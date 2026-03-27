import { sessionMiddleware } from '@/lib/session-middleware';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { createContentPostSchema } from '../schemas';
import { getMember } from '@/features/members/utils';
import { ContentPost } from '@/models';
import { connectDB } from '@/lib/db';
import { z } from 'zod';
import { type ContentPost as ContentPostType, type ContentPostType as PostType, type ContentPostStatus, type ContentPlatform } from '../types';

function toPost(doc: Record<string, unknown>): ContentPostType {
  return {
    $id: String(doc._id),
    $createdAt: doc.createdAt instanceof Date ? (doc.createdAt as Date).toISOString() : '',
    title: String(doc.title),
    concept: doc.concept ? String(doc.concept) : undefined,
    postType: doc.postType as PostType,
    platform: doc.platform ? (doc.platform as ContentPlatform) : undefined,
    status: doc.status as ContentPostStatus,
    scheduledDate: String(doc.scheduledDate),
    workspaceId: String(doc.workspaceId),
    projectId: doc.projectId ? String(doc.projectId) : undefined,
    tags: doc.tags ? String(doc.tags) : undefined,
    festivity: doc.festivity ? String(doc.festivity) : undefined,
  };
}

const app = new Hono()
  .get(
    '/',
    sessionMiddleware,
    zValidator('query', z.object({
      workspaceId: z.string(),
      projectId: z.string().nullish(),
      status: z.string().nullish(),
      month: z.string().nullish(),
    })),
    async (c) => {
      const user = c.get('user');
      const { workspaceId, projectId, status, month } = c.req.valid('query');

      const member = await getMember({ workspaceId, userId: user.$id });
      if (!member) return c.json({ error: 'Unauthorized' }, 401);

      await connectDB();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const query: Record<string, any> = { workspaceId };
      if (projectId) query.projectId = projectId;
      if (status) query.status = status;
      if (month) {
        const [year, mon] = month.split('-').map(Number);
        query.scheduledDate = {
          $gte: new Date(year, mon - 1, 1).toISOString(),
          $lte: new Date(year, mon, 0, 23, 59, 59).toISOString(),
        };
      }

      const posts = await ContentPost.find(query).sort({ scheduledDate: 1 }).lean() as Record<string, unknown>[];
      return c.json({ data: { documents: posts.map(toPost), total: posts.length } });
    }
  )
  .post('/', sessionMiddleware, zValidator('json', createContentPostSchema), async (c) => {
    const user = c.get('user');
    const { workspaceId, title, concept, postType, platform, status, scheduledDate, projectId, tags, festivity } = c.req.valid('json');

    const member = await getMember({ workspaceId, userId: user.$id });
    if (!member) return c.json({ error: 'Unauthorized' }, 401);

    await connectDB();
    const post = await ContentPost.create({
      workspaceId, title, concept, postType, platform, status, scheduledDate,
      projectId: projectId ?? undefined,
      tags: tags ?? undefined,
      festivity: festivity ?? undefined,
    });

    return c.json({ data: toPost(post.toObject()) });
  })
  .patch('/:postId', sessionMiddleware, zValidator('json', createContentPostSchema.partial()), async (c) => {
    const user = c.get('user');
    const { postId } = c.req.param();
    const updates = c.req.valid('json');

    await connectDB();
    const existing = await ContentPost.findById(postId).lean() as Record<string, unknown> | null;
    if (!existing) return c.json({ error: 'Not found' }, 404);

    const member = await getMember({ workspaceId: String(existing.workspaceId), userId: user.$id });
    if (!member) return c.json({ error: 'Unauthorized' }, 401);

    const post = await ContentPost.findByIdAndUpdate(postId, updates, { new: true }).lean() as Record<string, unknown>;
    return c.json({ data: toPost(post) });
  })
  .delete('/:postId', sessionMiddleware, async (c) => {
    const user = c.get('user');
    const { postId } = c.req.param();

    await connectDB();
    const existing = await ContentPost.findById(postId).lean() as Record<string, unknown> | null;
    if (!existing) return c.json({ error: 'Not found' }, 404);

    const member = await getMember({ workspaceId: String(existing.workspaceId), userId: user.$id });
    if (!member) return c.json({ error: 'Unauthorized' }, 401);

    await ContentPost.findByIdAndDelete(postId);
    return c.json({ data: { $id: postId } });
  });

export default app;
