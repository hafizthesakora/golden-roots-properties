import { sessionMiddleware } from '@/lib/session-middleware';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import z from 'zod';
import { getMember } from '../utils';
import { Member, User } from '@/models';
import { connectDB } from '@/lib/db';
import { MemberRole, type Member as MemberType } from '../types';

function toMember(doc: Record<string, unknown>, name?: string, email?: string): MemberType {
  return {
    $id: String(doc._id),
    $createdAt: doc.createdAt instanceof Date ? (doc.createdAt as Date).toISOString() : '',
    workspaceId: String(doc.workspaceId),
    userId: String(doc.userId),
    role: doc.role as MemberRole,
    name: name ?? String(doc.name ?? ''),
    email: email ?? String(doc.email ?? ''),
  };
}

const app = new Hono()
  .get('/', sessionMiddleware, zValidator('query', z.object({ workspaceId: z.string() })), async (c) => {
    const user = c.get('user');
    const { workspaceId } = c.req.valid('query');

    const member = await getMember({ workspaceId, userId: user.$id });
    if (!member) return c.json({ error: 'Unauthorized' }, 401);

    await connectDB();
    const members = await Member.find({ workspaceId }).lean() as Record<string, unknown>[];

    const populatedMembers = await Promise.all(
      members.map(async (m) => {
        const u = await User.findById(m.userId).lean() as Record<string, unknown> | null;
        return toMember(m, String(u?.name ?? 'Unknown'), String(u?.email ?? ''));
      })
    );

    return c.json({ data: { documents: populatedMembers, total: populatedMembers.length } });
  })
  .delete('/:memberId', sessionMiddleware, async (c) => {
    const { memberId } = c.req.param();
    const user = c.get('user');

    await connectDB();
    const memberToDelete = await Member.findById(memberId).lean() as Record<string, unknown> | null;
    if (!memberToDelete) return c.json({ error: 'Not found' }, 404);

    const allCount = await Member.countDocuments({ workspaceId: memberToDelete.workspaceId });
    const member = await getMember({ workspaceId: String(memberToDelete.workspaceId), userId: user.$id });
    if (!member) return c.json({ error: 'Unauthorized' }, 401);

    if (member.$id !== memberId && member.role !== MemberRole.ADMIN) return c.json({ error: 'Unauthorized' }, 401);
    if (allCount === 1) return c.json({ error: 'Cannot delete the only member' }, 400);

    await Member.findByIdAndDelete(memberId);
    return c.json({ data: { $id: memberId } });
  })
  .patch('/:memberId', sessionMiddleware, zValidator('json', z.object({ role: z.nativeEnum(MemberRole) })), async (c) => {
    const { memberId } = c.req.param();
    const { role } = c.req.valid('json');
    const user = c.get('user');

    await connectDB();
    const memberToUpdate = await Member.findById(memberId).lean() as Record<string, unknown> | null;
    if (!memberToUpdate) return c.json({ error: 'Not found' }, 404);

    const allCount = await Member.countDocuments({ workspaceId: memberToUpdate.workspaceId });
    const member = await getMember({ workspaceId: String(memberToUpdate.workspaceId), userId: user.$id });
    if (!member) return c.json({ error: 'Unauthorized' }, 401);
    if (member.role !== MemberRole.ADMIN) return c.json({ error: 'Unauthorized' }, 401);
    if (allCount === 1) return c.json({ error: 'Cannot downgrade the only member' }, 400);

    await Member.findByIdAndUpdate(memberId, { role });
    return c.json({ data: { $id: memberId } });
  });

export default app;
