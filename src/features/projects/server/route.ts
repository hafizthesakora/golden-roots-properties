import { getMember } from '@/features/members/utils';
import { sessionMiddleware } from '@/lib/session-middleware';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import z from 'zod';
import { createProjectSchema, updateProjectSchema } from '../schema';
import { connectDB } from '@/lib/db';
import { Project, Task } from '@/models';
import { endOfMonth, startOfMonth, subMonths } from 'date-fns';
import { TaskStatus } from '@/features/tasks/types';
import type { Project as ProjectType } from '../types';

function toProject(doc: Record<string, unknown>): ProjectType {
  return {
    $id: String(doc._id),
    $createdAt: doc.createdAt instanceof Date ? (doc.createdAt as Date).toISOString() : '',
    name: String(doc.name),
    imageUrl: doc.imageUrl ? String(doc.imageUrl) : undefined,
    workspaceId: String(doc.workspaceId),
  };
}

const app = new Hono()
  .post('/', sessionMiddleware, zValidator('form', createProjectSchema), async (c) => {
    const user = c.get('user');
    const { name, image, workspaceId } = c.req.valid('form');

    const member = await getMember({ workspaceId, userId: user.$id });
    if (!member) return c.json({ error: 'Unauthorized' }, 401);

    let imageUrl: string | undefined;
    if (image instanceof File && image.size > 0) {
      const buf = await image.arrayBuffer();
      imageUrl = `data:${image.type || 'image/png'};base64,${Buffer.from(buf).toString('base64')}`;
    }

    await connectDB();
    const project = await Project.create({ name, imageUrl, workspaceId });
    return c.json({ data: toProject(project.toObject()) });
  })
  .get('/', sessionMiddleware, zValidator('query', z.object({ workspaceId: z.string() })), async (c) => {
    const user = c.get('user');
    const { workspaceId } = c.req.valid('query');

    const member = await getMember({ workspaceId, userId: user.$id });
    if (!member) return c.json({ error: 'Unauthorized' }, 401);

    await connectDB();
    const projects = await Project.find({ workspaceId }).sort({ createdAt: -1 }).lean() as Record<string, unknown>[];
    return c.json({ data: { documents: projects.map(toProject), total: projects.length } });
  })
  .get('/:projectId', sessionMiddleware, async (c) => {
    const user = c.get('user');
    const { projectId } = c.req.param();

    await connectDB();
    const project = await Project.findById(projectId).lean() as Record<string, unknown> | null;
    if (!project) return c.json({ error: 'Not found' }, 404);

    const member = await getMember({ workspaceId: String(project.workspaceId), userId: user.$id });
    if (!member) return c.json({ error: 'Unauthorized' }, 401);

    return c.json({ data: toProject(project) });
  })
  .patch('/:projectId', sessionMiddleware, zValidator('form', updateProjectSchema), async (c) => {
    const user = c.get('user');
    const { projectId } = c.req.param();
    const { name, image } = c.req.valid('form');

    await connectDB();
    const existing = await Project.findById(projectId).lean() as Record<string, unknown> | null;
    if (!existing) return c.json({ error: 'Not found' }, 404);

    const member = await getMember({ workspaceId: String(existing.workspaceId), userId: user.$id });
    if (!member) return c.json({ error: 'Unauthorized' }, 401);

    let imageUrl: string | undefined;
    if (image instanceof File && image.size > 0) {
      const buf = await image.arrayBuffer();
      imageUrl = `data:${image.type || 'image/png'};base64,${Buffer.from(buf).toString('base64')}`;
    } else if (typeof image === 'string') {
      imageUrl = image;
    }

    const project = await Project.findByIdAndUpdate(projectId, { name, imageUrl }, { new: true }).lean() as Record<string, unknown>;
    return c.json({ data: toProject(project) });
  })
  .delete('/:projectId', sessionMiddleware, async (c) => {
    const user = c.get('user');
    const { projectId } = c.req.param();

    await connectDB();
    const existing = await Project.findById(projectId).lean() as Record<string, unknown> | null;
    if (!existing) return c.json({ error: 'Not found' }, 404);

    const member = await getMember({ workspaceId: String(existing.workspaceId), userId: user.$id });
    if (!member) return c.json({ error: 'Unauthorized' }, 401);

    await Project.findByIdAndDelete(projectId);
    return c.json({ data: { $id: projectId } });
  })
  .get('/:projectId/analytics', sessionMiddleware, async (c) => {
    const user = c.get('user');
    const { projectId } = c.req.param();

    await connectDB();
    const project = await Project.findById(projectId).lean() as Record<string, unknown> | null;
    if (!project) return c.json({ error: 'Not found' }, 404);

    const member = await getMember({ workspaceId: String(project.workspaceId), userId: user.$id });
    if (!member) return c.json({ error: 'Unauthorized' }, 401);

    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const thisMonthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    const [taskCount, lastCount] = await Promise.all([
      Task.countDocuments({ projectId, createdAt: { $gte: thisMonthStart, $lte: thisMonthEnd } }),
      Task.countDocuments({ projectId, createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } }),
    ]);
    const [assignedCount, lastAssigned] = await Promise.all([
      Task.countDocuments({ projectId, assigneeId: member.$id, createdAt: { $gte: thisMonthStart, $lte: thisMonthEnd } }),
      Task.countDocuments({ projectId, assigneeId: member.$id, createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } }),
    ]);
    const [incompleteCount, lastIncomplete] = await Promise.all([
      Task.countDocuments({ projectId, status: { $ne: TaskStatus.DONE }, createdAt: { $gte: thisMonthStart, $lte: thisMonthEnd } }),
      Task.countDocuments({ projectId, status: { $ne: TaskStatus.DONE }, createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } }),
    ]);
    const [completedCount, lastCompleted] = await Promise.all([
      Task.countDocuments({ projectId, status: TaskStatus.DONE, createdAt: { $gte: thisMonthStart, $lte: thisMonthEnd } }),
      Task.countDocuments({ projectId, status: TaskStatus.DONE, createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } }),
    ]);
    const [overdueCount, lastOverdue] = await Promise.all([
      Task.countDocuments({ projectId, status: { $ne: TaskStatus.DONE }, dueDate: { $lt: now.toISOString() }, createdAt: { $gte: thisMonthStart, $lte: thisMonthEnd } }),
      Task.countDocuments({ projectId, status: { $ne: TaskStatus.DONE }, dueDate: { $lt: now.toISOString() }, createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } }),
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
  });

export default app;
