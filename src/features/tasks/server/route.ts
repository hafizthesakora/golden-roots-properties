import { sessionMiddleware } from '@/lib/session-middleware';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { createTaskSchema } from '../schemas';
import { getMember } from '@/features/members/utils';
import { z } from 'zod';
import { TaskStatus } from '../types';
import { connectDB } from '@/lib/db';
import { Task, Member, Project, User, TaskComment } from '@/models';
import { logActivity } from '@/lib/activity';
import type { Task as TaskType } from '../types';
import type { Project as ProjectType } from '@/features/projects/types';
import type { Member as MemberType } from '@/features/members/types';
import { addDays, addWeeks, addMonths, addYears } from 'date-fns';

function toTask(doc: Record<string, unknown>): TaskType {
  return {
    $id: String(doc._id),
    $createdAt: doc.createdAt instanceof Date ? (doc.createdAt as Date).toISOString() : '',
    name: String(doc.name),
    status: doc.status as TaskStatus,
    workspaceId: String(doc.workspaceId),
    projectId: String(doc.projectId),
    assigneeId: String(doc.assigneeId),
    dueDate: doc.dueDate ? String(doc.dueDate) : '',
    position: Number(doc.position),
    description: doc.description ? String(doc.description) : undefined,
    isRecurring: Boolean(doc.isRecurring),
    recurringInterval: doc.recurringInterval ? String(doc.recurringInterval) : undefined,
    recurringEndDate: doc.recurringEndDate ? String(doc.recurringEndDate) : undefined,
  };
}

function nextRecurringDate(current: string, interval: string): Date {
  const d = new Date(current);
  if (interval === 'daily') return addDays(d, 1);
  if (interval === 'weekly') return addWeeks(d, 1);
  if (interval === 'monthly') return addMonths(d, 1);
  if (interval === 'yearly') return addYears(d, 1);
  return addWeeks(d, 1);
}

function toProject(doc: Record<string, unknown>): ProjectType {
  return {
    $id: String(doc._id),
    $createdAt: doc.createdAt instanceof Date ? (doc.createdAt as Date).toISOString() : '',
    name: String(doc.name),
    imageUrl: doc.imageUrl ? String(doc.imageUrl) : undefined,
    workspaceId: String(doc.workspaceId),
  };
}

function toMember(doc: Record<string, unknown>, name: string, email: string): MemberType {
  return {
    $id: String(doc._id),
    $createdAt: doc.createdAt instanceof Date ? (doc.createdAt as Date).toISOString() : '',
    workspaceId: String(doc.workspaceId),
    userId: String(doc.userId),
    role: doc.role as MemberType['role'],
    name,
    email,
  };
}

const app = new Hono()
  .delete('/:taskId', sessionMiddleware, async (c) => {
    const user = c.get('user');
    const { taskId } = c.req.param();

    await connectDB();
    const task = await Task.findById(taskId).lean() as Record<string, unknown> | null;
    if (!task) return c.json({ error: 'Not found' }, 404);

    const member = await getMember({ workspaceId: String(task.workspaceId), userId: user.$id });
    if (!member) return c.json({ error: 'Unauthorized' }, 401);

    const u = await User.findById(user.$id).lean() as Record<string, unknown> | null;
    await Task.findByIdAndDelete(taskId);
    await TaskComment.deleteMany({ taskId });
    await logActivity({ workspaceId: String(task.workspaceId), userId: user.$id, userName: String(u?.name ?? 'Unknown'), action: 'deleted', entityType: 'task', entityId: taskId, entityName: String(task.name) });
    return c.json({ data: { $id: taskId } });
  })
  // ── Comments ──────────────────────────────────────────────────────────────
  .get('/:taskId/comments', sessionMiddleware, async (c) => {
    const user = c.get('user');
    const { taskId } = c.req.param();
    await connectDB();
    const task = await Task.findById(taskId).lean() as Record<string, unknown> | null;
    if (!task) return c.json({ error: 'Not found' }, 404);
    const member = await getMember({ workspaceId: String(task.workspaceId), userId: user.$id });
    if (!member) return c.json({ error: 'Unauthorized' }, 401);
    const comments = await TaskComment.find({ taskId }).sort({ createdAt: 1 }).lean() as Record<string, unknown>[];
    const docs = comments.map((c) => ({
      $id: String(c._id),
      $createdAt: c.createdAt instanceof Date ? (c.createdAt as Date).toISOString() : '',
      taskId: String(c.taskId),
      workspaceId: String(c.workspaceId),
      authorId: String(c.authorId),
      authorName: String(c.authorName),
      content: String(c.content),
    }));
    return c.json({ data: docs });
  })
  .post('/:taskId/comments', sessionMiddleware, zValidator('json', z.object({ content: z.string().min(1).max(2000) })), async (c) => {
    const user = c.get('user');
    const { taskId } = c.req.param();
    const { content } = c.req.valid('json');
    await connectDB();
    const task = await Task.findById(taskId).lean() as Record<string, unknown> | null;
    if (!task) return c.json({ error: 'Not found' }, 404);
    const member = await getMember({ workspaceId: String(task.workspaceId), userId: user.$id });
    if (!member) return c.json({ error: 'Unauthorized' }, 401);
    const u = await User.findById(user.$id).lean() as Record<string, unknown> | null;
    const authorName = String(u?.name ?? 'Unknown');
    const comment = await TaskComment.create({ taskId, workspaceId: task.workspaceId, authorId: user.$id, authorName, content });
    await logActivity({ workspaceId: String(task.workspaceId), userId: user.$id, userName: authorName, action: 'commented', entityType: 'task', entityId: taskId, entityName: String(task.name), details: { preview: content.slice(0, 80) } });
    return c.json({ data: { $id: String(comment._id), $createdAt: comment.createdAt?.toISOString() ?? '', taskId, workspaceId: String(task.workspaceId), authorId: user.$id, authorName, content } });
  })
  .delete('/:taskId/comments/:commentId', sessionMiddleware, async (c) => {
    const user = c.get('user');
    const { taskId, commentId } = c.req.param();
    await connectDB();
    const comment = await TaskComment.findById(commentId).lean() as Record<string, unknown> | null;
    if (!comment || String(comment.taskId) !== taskId) return c.json({ error: 'Not found' }, 404);
    if (String(comment.authorId) !== user.$id) return c.json({ error: 'Unauthorized' }, 401);
    await TaskComment.findByIdAndDelete(commentId);
    return c.json({ data: { $id: commentId } });
  })
  .get(
    '/',
    sessionMiddleware,
    zValidator('query', z.object({
      workspaceId: z.string(),
      projectId: z.string().nullish(),
      assigneeId: z.string().nullish(),
      status: z.nativeEnum(TaskStatus).nullish(),
      search: z.string().nullish(),
      dueDate: z.string().nullish(),
    })),
    async (c) => {
      const user = c.get('user');
      const { workspaceId, projectId, assigneeId, status, search, dueDate } = c.req.valid('query');

      const member = await getMember({ workspaceId, userId: user.$id });
      if (!member) return c.json({ error: 'Unauthorized' }, 401);

      await connectDB();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const query: Record<string, any> = { workspaceId };
      if (projectId) query.projectId = projectId;
      if (status) query.status = status;
      if (assigneeId) query.assigneeId = assigneeId;
      if (dueDate) query.dueDate = dueDate;
      if (search) query.name = { $regex: search, $options: 'i' };

      const tasks = await Task.find(query).sort({ createdAt: -1 }).lean() as Record<string, unknown>[];

      const projectIds = Array.from(new Set(tasks.map((t) => String(t.projectId))));
      const assigneeIds = Array.from(new Set(tasks.map((t) => String(t.assigneeId))));

      const [projects, memberDocs] = await Promise.all([
        projectIds.length > 0 ? Project.find({ _id: { $in: projectIds } }).lean() : [],
        assigneeIds.length > 0 ? Member.find({ _id: { $in: assigneeIds } }).lean() : [],
      ]) as [Record<string, unknown>[], Record<string, unknown>[]];

      const assignees = await Promise.all(
        memberDocs.map(async (m) => {
          const u = await User.findById(m.userId).lean() as Record<string, unknown> | null;
          return toMember(m, String(u?.name ?? 'Unknown'), String(u?.email ?? ''));
        })
      );

      const populatedTasks = tasks.map((task) => {
        const project = projects.find((p) => String(p._id) === String(task.projectId));
        const assignee = assignees.find((a) => a.$id === String(task.assigneeId));
        return {
          ...toTask(task),
          project: project ? toProject(project) : undefined,
          assignee: assignee ?? undefined,
        };
      });

      return c.json({ data: { documents: populatedTasks, total: populatedTasks.length } });
    }
  )
  .post('/', sessionMiddleware, zValidator('json', createTaskSchema), async (c) => {
    const user = c.get('user');
    const updates = c.req.valid('json');
    const { name, status, workspaceId, projectId, dueDate, assigneeId } = updates;

    const member = await getMember({ workspaceId, userId: user.$id });
    if (!member) return c.json({ error: 'Unauthorized' }, 401);

    await connectDB();
    const lastTask = await Task.findOne({ workspaceId, status }).sort({ position: -1 }).lean() as Record<string, unknown> | null;
    const position = ((lastTask?.position as number) ?? 0) + 1000;

    const u = await User.findById(user.$id).lean() as Record<string, unknown> | null;
    const userName = String(u?.name ?? 'Unknown');

    const task = await Task.create({
      name, status, workspaceId, projectId, dueDate, assigneeId, position,
      isRecurring: (updates as Record<string, unknown>).isRecurring ?? false,
      recurringInterval: (updates as Record<string, unknown>).recurringInterval,
      recurringEndDate: (updates as Record<string, unknown>).recurringEndDate,
    });

    await logActivity({ workspaceId, userId: user.$id, userName, action: 'created', entityType: 'task', entityId: String(task._id), entityName: name });
    return c.json({ data: toTask(task.toObject()) });
  })
  .patch('/:taskId', sessionMiddleware, zValidator('json', createTaskSchema.partial()), async (c) => {
    const user = c.get('user');
    const { taskId } = c.req.param();
    const updates = c.req.valid('json');

    await connectDB();
    const existingTask = await Task.findById(taskId).lean() as Record<string, unknown> | null;
    if (!existingTask) return c.json({ error: 'Not found' }, 404);

    const member = await getMember({ workspaceId: String(existingTask.workspaceId), userId: user.$id });
    if (!member) return c.json({ error: 'Unauthorized' }, 401);

    const task = await Task.findByIdAndUpdate(taskId, updates, { new: true }).lean() as Record<string, unknown>;

    const u = await User.findById(user.$id).lean() as Record<string, unknown> | null;
    const userName = String(u?.name ?? 'Unknown');
    const wasCompleted = updates.status === TaskStatus.DONE && existingTask.status !== TaskStatus.DONE;

    if (wasCompleted) {
      await logActivity({ workspaceId: String(task.workspaceId), userId: user.$id, userName, action: 'completed', entityType: 'task', entityId: taskId, entityName: String(task.name) });
    } else if (updates.status && updates.status !== existingTask.status) {
      await logActivity({ workspaceId: String(task.workspaceId), userId: user.$id, userName, action: 'status_changed', entityType: 'task', entityId: taskId, entityName: String(task.name), details: { from: existingTask.status, to: updates.status } });
    } else {
      await logActivity({ workspaceId: String(task.workspaceId), userId: user.$id, userName, action: 'updated', entityType: 'task', entityId: taskId, entityName: String(task.name) });
    }

    // Recurring: when a recurring task is completed, spawn the next instance
    if (wasCompleted && existingTask.isRecurring && existingTask.recurringInterval) {
      const interval = String(existingTask.recurringInterval);
      const currentDue = existingTask.dueDate ? String(existingTask.dueDate) : new Date().toISOString();
      const nextDue = nextRecurringDate(currentDue, interval);
      const endDate = existingTask.recurringEndDate ? new Date(String(existingTask.recurringEndDate)) : null;

      if (!endDate || nextDue <= endDate) {
        const lastTask = await Task.findOne({ workspaceId: task.workspaceId, status: TaskStatus.TODO }).sort({ position: -1 }).lean() as Record<string, unknown> | null;
        const nextPosition = ((lastTask?.position as number) ?? 0) + 1000;
        await Task.create({
          name: task.name,
          status: TaskStatus.TODO,
          workspaceId: task.workspaceId,
          projectId: task.projectId,
          assigneeId: task.assigneeId,
          dueDate: nextDue.toISOString(),
          position: nextPosition,
          description: task.description,
          isRecurring: true,
          recurringInterval: interval,
          recurringEndDate: task.recurringEndDate,
        });
      }
    }

    return c.json({ data: toTask(task) });
  })
  .get('/:taskId', sessionMiddleware, async (c) => {
    const user = c.get('user');
    const { taskId } = c.req.param();

    await connectDB();
    const task = await Task.findById(taskId).lean() as Record<string, unknown> | null;
    if (!task) return c.json({ error: 'Not found' }, 404);

    const currentMember = await getMember({ workspaceId: String(task.workspaceId), userId: user.$id });
    if (!currentMember) return c.json({ error: 'Unauthorized' }, 401);

    const [project, assigneeMember] = await Promise.all([
      Project.findById(task.projectId).lean() as Promise<Record<string, unknown> | null>,
      Member.findById(task.assigneeId).lean() as Promise<Record<string, unknown> | null>,
    ]);

    const assigneeUser = assigneeMember
      ? await User.findById(assigneeMember.userId).lean() as Record<string, unknown> | null
      : null;

    const assignee = assigneeMember
      ? toMember(assigneeMember, String(assigneeUser?.name ?? 'Unknown'), String(assigneeUser?.email ?? ''))
      : undefined;

    return c.json({
      data: {
        ...toTask(task),
        project: project ? toProject(project) : undefined,
        assignee,
      },
    });
  })
  .post(
    '/bulk-update',
    sessionMiddleware,
    zValidator('json', z.object({
      tasks: z.array(z.object({
        $id: z.string(),
        status: z.nativeEnum(TaskStatus),
        position: z.number().int().positive().min(1000).max(1_000_000),
      })),
    })),
    async (c) => {
      const user = c.get('user');
      const { tasks } = c.req.valid('json');

      await connectDB();
      const ids = tasks.map((t) => t.$id);
      const existing = await Task.find({ _id: { $in: ids } }).lean() as Record<string, unknown>[];

      const workspaceIds = new Set(existing.map((t) => String(t.workspaceId)));
      if (workspaceIds.size !== 1) return c.json({ error: 'Tasks belong to different workspaces' }, 400);

      const workspaceId = Array.from(workspaceIds)[0];
      const member = await getMember({ workspaceId, userId: user.$id });
      if (!member) return c.json({ error: 'Unauthorized' }, 401);

      const updated = await Promise.all(
        tasks.map((t) => Task.findByIdAndUpdate(t.$id, { status: t.status, position: t.position }, { new: true }).lean())
      );

      return c.json({ data: (updated.filter(Boolean) as Record<string, unknown>[]).map(toTask) });
    }
  );

export default app;
