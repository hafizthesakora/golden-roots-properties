import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { createWorkspaceSchema, updateWorkspaceSchema } from '../schemas';
import { sessionMiddleware } from '@/lib/session-middleware';
import { getMember } from '@/features/members/utils';
import { MemberRole } from '@/features/members/types';
import { generateInviteCode } from '@/lib/utils';
import { connectDB } from '@/lib/db';
import { Workspace, Member, Task, ActivityLog } from '@/models';
import { endOfMonth, startOfMonth, subMonths } from 'date-fns';
import { TaskStatus } from '@/features/tasks/types';
import type { Workspace as WorkspaceType } from '../types';

function toWorkspace(doc: Record<string, unknown>): WorkspaceType {
  return {
    $id: String(doc._id),
    $createdAt: doc.createdAt instanceof Date ? (doc.createdAt as Date).toISOString() : '',
    name: String(doc.name),
    imageUrl: doc.imageUrl ? String(doc.imageUrl) : undefined,
    inviteCode: String(doc.inviteCode),
    userId: String(doc.userId),
  };
}

const app = new Hono()
  .get('/', sessionMiddleware, async (c) => {
    const user = c.get('user');
    await connectDB();

    const members = await Member.find({ userId: user.$id }).lean() as Record<string, unknown>[];
    if (members.length === 0) return c.json({ data: { documents: [] as WorkspaceType[], total: 0 } });

    const workspaceIds = members.map((m) => String(m.workspaceId));
    const workspaces = await Workspace.find({ _id: { $in: workspaceIds } })
      .sort({ createdAt: -1 })
      .lean() as Record<string, unknown>[];

    return c.json({ data: { documents: workspaces.map(toWorkspace), total: workspaces.length } });
  })
  .get('/:workspaceId', sessionMiddleware, async (c) => {
    const user = c.get('user');
    const { workspaceId } = c.req.param();

    const member = await getMember({ workspaceId, userId: user.$id });
    if (!member) return c.json({ error: 'Unauthorized' }, 401);

    await connectDB();
    const workspace = await Workspace.findById(workspaceId).lean() as Record<string, unknown> | null;
    if (!workspace) return c.json({ error: 'Not found' }, 404);

    return c.json({ data: toWorkspace(workspace) });
  })
  .post('/', zValidator('form', createWorkspaceSchema), sessionMiddleware, async (c) => {
    const user = c.get('user');
    const { name, image } = c.req.valid('form');

    let imageUrl: string | undefined;
    if (image instanceof File && image.size > 0) {
      const buf = await image.arrayBuffer();
      imageUrl = `data:${image.type || 'image/png'};base64,${Buffer.from(buf).toString('base64')}`;
    }

    await connectDB();
    const workspace = await Workspace.create({ name, userId: user.$id, imageUrl, inviteCode: generateInviteCode(6) });
    await Member.create({ userId: user.$id, workspaceId: workspace._id.toString(), role: MemberRole.ADMIN });

    return c.json({ data: toWorkspace(workspace.toObject()) });
  })
  .patch('/:workspaceId', sessionMiddleware, zValidator('form', updateWorkspaceSchema), async (c) => {
    const user = c.get('user');
    const { workspaceId } = c.req.param();
    const { name, image } = c.req.valid('form');

    const member = await getMember({ workspaceId, userId: user.$id });
    if (!member || member.role !== MemberRole.ADMIN) return c.json({ error: 'Unauthorized' }, 401);

    let imageUrl: string | undefined;
    if (image instanceof File && image.size > 0) {
      const buf = await image.arrayBuffer();
      imageUrl = `data:${image.type || 'image/png'};base64,${Buffer.from(buf).toString('base64')}`;
    } else if (typeof image === 'string') {
      imageUrl = image;
    }

    await connectDB();
    const workspace = await Workspace.findByIdAndUpdate(workspaceId, { name, imageUrl }, { new: true }).lean() as Record<string, unknown>;
    return c.json({ data: toWorkspace(workspace) });
  })
  .delete('/:workspaceId', sessionMiddleware, async (c) => {
    const user = c.get('user');
    const { workspaceId } = c.req.param();

    const member = await getMember({ workspaceId, userId: user.$id });
    if (!member || member.role !== MemberRole.ADMIN) return c.json({ error: 'Unauthorized' }, 401);

    await connectDB();
    await Workspace.findByIdAndDelete(workspaceId);
    return c.json({ data: { $id: workspaceId } });
  })
  .post('/:workspaceId/reset-invite-code', sessionMiddleware, async (c) => {
    const user = c.get('user');
    const { workspaceId } = c.req.param();

    const member = await getMember({ workspaceId, userId: user.$id });
    if (!member || member.role !== MemberRole.ADMIN) return c.json({ error: 'Unauthorized' }, 401);

    await connectDB();
    const workspace = await Workspace.findByIdAndUpdate(workspaceId, { inviteCode: generateInviteCode(6) }, { new: true }).lean() as Record<string, unknown>;
    return c.json({ data: toWorkspace(workspace) });
  })
  .post('/:workspaceId/join', sessionMiddleware, zValidator('json', z.object({ code: z.string() })), async (c) => {
    const { workspaceId } = c.req.param();
    const { code } = c.req.valid('json');
    const user = c.get('user');

    const existingMember = await getMember({ workspaceId, userId: user.$id });
    if (existingMember) return c.json({ error: 'Already a member' }, 400);

    await connectDB();
    const workspace = await Workspace.findById(workspaceId).lean() as Record<string, unknown> | null;
    if (!workspace) return c.json({ error: 'Workspace not found' }, 404);
    if (workspace.inviteCode !== code) return c.json({ error: 'Invalid invite code' }, 400);

    await Member.create({ workspaceId, userId: user.$id, role: MemberRole.MEMBER });
    return c.json({ data: toWorkspace(workspace) });
  })
  .get('/:workspaceId/analytics', sessionMiddleware, async (c) => {
    const user = c.get('user');
    const { workspaceId } = c.req.param();

    const member = await getMember({ workspaceId, userId: user.$id });
    if (!member) return c.json({ error: 'Unauthorized' }, 401);

    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const thisMonthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    await connectDB();
    const [taskCount, lastCount] = await Promise.all([
      Task.countDocuments({ workspaceId, createdAt: { $gte: thisMonthStart, $lte: thisMonthEnd } }),
      Task.countDocuments({ workspaceId, createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } }),
    ]);
    const [assignedCount, lastAssigned] = await Promise.all([
      Task.countDocuments({ workspaceId, assigneeId: member.$id, createdAt: { $gte: thisMonthStart, $lte: thisMonthEnd } }),
      Task.countDocuments({ workspaceId, assigneeId: member.$id, createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } }),
    ]);
    const [incompleteCount, lastIncomplete] = await Promise.all([
      Task.countDocuments({ workspaceId, status: { $ne: TaskStatus.DONE }, createdAt: { $gte: thisMonthStart, $lte: thisMonthEnd } }),
      Task.countDocuments({ workspaceId, status: { $ne: TaskStatus.DONE }, createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } }),
    ]);
    const [completedCount, lastCompleted] = await Promise.all([
      Task.countDocuments({ workspaceId, status: TaskStatus.DONE, createdAt: { $gte: thisMonthStart, $lte: thisMonthEnd } }),
      Task.countDocuments({ workspaceId, status: TaskStatus.DONE, createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } }),
    ]);
    const [overdueCount, lastOverdue] = await Promise.all([
      Task.countDocuments({ workspaceId, status: { $ne: TaskStatus.DONE }, dueDate: { $lt: now.toISOString() }, createdAt: { $gte: thisMonthStart, $lte: thisMonthEnd } }),
      Task.countDocuments({ workspaceId, status: { $ne: TaskStatus.DONE }, dueDate: { $lt: now.toISOString() }, createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } }),
    ]);

    return c.json({
      data: {
        taskCount, taskDifference: taskCount - lastCount,
        assignedTaskCount: assignedCount, assignedTaskDifference: assignedCount - lastAssigned,
        incompleteTaskCount: incompleteCount, incompleteTaskDifference: incompleteCount - lastIncomplete,
        completedTaskCount: completedCount, completedTaskDifference: completedCount - lastCompleted,
        overdueTaskCount: overdueCount, overdueTaskDifference: overdueCount - lastOverdue,
      },
    });
  })
  // ── Activity Log ─────────────────────────────────────────────────────────────
  .get('/:workspaceId/activity', sessionMiddleware, async (c) => {
    const user = c.get('user');
    const { workspaceId } = c.req.param();
    const member = await getMember({ workspaceId, userId: user.$id });
    if (!member) return c.json({ error: 'Unauthorized' }, 401);
    await connectDB();
    const logs = await ActivityLog.find({ workspaceId }).sort({ createdAt: -1 }).limit(50).lean() as Record<string, unknown>[];
    const docs = logs.map((l) => ({
      $id: String(l._id),
      $createdAt: l.createdAt instanceof Date ? (l.createdAt as Date).toISOString() : '',
      workspaceId: String(l.workspaceId),
      userId: String(l.userId),
      userName: String(l.userName),
      action: String(l.action),
      entityType: String(l.entityType),
      entityId: String(l.entityId),
      entityName: String(l.entityName),
      details: l.details ? String(l.details) : undefined,
    }));
    return c.json({ data: docs });
  });

export default app;
