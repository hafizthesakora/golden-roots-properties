import { sessionMiddleware } from '@/lib/session-middleware';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { getMember } from '@/features/members/utils';
import { Lead, LeadNote, User } from '@/models';
import { connectDB } from '@/lib/db';
import { z } from 'zod';
import { LeadStatus, type Lead as LeadType, type LeadSource, type PropertyType } from '../types';
import { createLeadSchema, updateLeadSchema } from '../schemas';
import { logActivity } from '@/lib/activity';

function toLead(doc: Record<string, unknown>): LeadType {
  return {
    $id: String(doc._id),
    $createdAt: doc.createdAt instanceof Date ? (doc.createdAt as Date).toISOString() : '',
    name: String(doc.name),
    email: doc.email ? String(doc.email) : undefined,
    phone: doc.phone ? String(doc.phone) : undefined,
    source: doc.source as LeadSource,
    propertyInterest: doc.propertyInterest ? String(doc.propertyInterest) : undefined,
    propertyType: doc.propertyType ? (doc.propertyType as PropertyType) : undefined,
    budget: doc.budget ? String(doc.budget) : undefined,
    status: doc.status as LeadStatus,
    position: Number(doc.position),
    notes: doc.notes ? String(doc.notes) : undefined,
    workspaceId: String(doc.workspaceId),
    assigneeId: doc.assigneeId ? String(doc.assigneeId) : undefined,
  };
}

const app = new Hono()
  .get('/', sessionMiddleware, zValidator('query', z.object({ workspaceId: z.string() })), async (c) => {
    const user = c.get('user');
    const { workspaceId } = c.req.valid('query');

    const member = await getMember({ workspaceId, userId: user.$id });
    if (!member) return c.json({ error: 'Unauthorized' }, 401);

    await connectDB();
    const leads = await Lead.find({ workspaceId }).sort({ position: 1 }).lean() as Record<string, unknown>[];
    return c.json({ data: { documents: leads.map(toLead), total: leads.length } });
  })
  .post('/', sessionMiddleware, zValidator('json', createLeadSchema), async (c) => {
    const user = c.get('user');
    const { workspaceId, name, email, phone, source, propertyInterest, propertyType, budget, status, notes, assigneeId } = c.req.valid('json');

    const member = await getMember({ workspaceId, userId: user.$id });
    if (!member) return c.json({ error: 'Unauthorized' }, 401);

    await connectDB();
    const lastLead = await Lead.findOne({ workspaceId, status: status ?? LeadStatus.NEW }).sort({ position: -1 }).lean() as Record<string, unknown> | null;
    const position = ((lastLead?.position as number) ?? 0) + 1000;

    const lead = await Lead.create({
      workspaceId, name,
      email: email || undefined, phone: phone || undefined, source,
      propertyInterest: propertyInterest || undefined,
      propertyType: propertyType || undefined,
      budget: budget || undefined,
      status: status ?? LeadStatus.NEW,
      notes: notes || undefined,
      assigneeId: assigneeId || undefined,
      position,
    });

    const u = await User.findById(user.$id).lean() as Record<string, unknown> | null;
    const userName = String(u?.name ?? 'Unknown');
    await logActivity({ workspaceId, userId: user.$id, userName, action: 'created', entityType: 'lead', entityId: String(lead._id), entityName: name });

    return c.json({ data: toLead(lead.toObject()) });
  })
  .patch('/:leadId', sessionMiddleware, zValidator('json', updateLeadSchema), async (c) => {
    const user = c.get('user');
    const { leadId } = c.req.param();
    const updates = c.req.valid('json');

    await connectDB();
    const existing = await Lead.findById(leadId).lean() as Record<string, unknown> | null;
    if (!existing) return c.json({ error: 'Not found' }, 404);

    const member = await getMember({ workspaceId: String(existing.workspaceId), userId: user.$id });
    if (!member) return c.json({ error: 'Unauthorized' }, 401);

    const lead = await Lead.findByIdAndUpdate(leadId, updates, { new: true }).lean() as Record<string, unknown>;
    const u = await User.findById(user.$id).lean() as Record<string, unknown> | null;
    const userName = String(u?.name ?? 'Unknown');

    // Auto-log status change as a LeadNote
    if (updates.status && updates.status !== existing.status) {
      await LeadNote.create({
        leadId,
        workspaceId: lead.workspaceId,
        authorId: user.$id,
        authorName: userName,
        content: `Status changed from ${String(existing.status).replace('_', ' ')} to ${String(updates.status).replace('_', ' ')}`,
        type: 'status_change',
        meta: JSON.stringify({ from: existing.status, to: updates.status }),
      });
      await logActivity({ workspaceId: String(lead.workspaceId), userId: user.$id, userName, action: 'status_changed', entityType: 'lead', entityId: leadId, entityName: String(lead.name), details: { from: existing.status, to: updates.status } });
    } else {
      await logActivity({ workspaceId: String(lead.workspaceId), userId: user.$id, userName, action: 'updated', entityType: 'lead', entityId: leadId, entityName: String(lead.name) });
    }

    return c.json({ data: toLead(lead) });
  })
  .delete('/:leadId', sessionMiddleware, async (c) => {
    const user = c.get('user');
    const { leadId } = c.req.param();

    await connectDB();
    const existing = await Lead.findById(leadId).lean() as Record<string, unknown> | null;
    if (!existing) return c.json({ error: 'Not found' }, 404);

    const member = await getMember({ workspaceId: String(existing.workspaceId), userId: user.$id });
    if (!member) return c.json({ error: 'Unauthorized' }, 401);

    const u = await User.findById(user.$id).lean() as Record<string, unknown> | null;
    await Lead.findByIdAndDelete(leadId);
    await LeadNote.deleteMany({ leadId });
    await logActivity({ workspaceId: String(existing.workspaceId), userId: user.$id, userName: String(u?.name ?? 'Unknown'), action: 'deleted', entityType: 'lead', entityId: leadId, entityName: String(existing.name) });
    return c.json({ data: { $id: leadId } });
  })
  // ── Lead Notes ──────────────────────────────────────────────────────────────
  .get('/:leadId/notes', sessionMiddleware, async (c) => {
    const user = c.get('user');
    const { leadId } = c.req.param();
    await connectDB();
    const lead = await Lead.findById(leadId).lean() as Record<string, unknown> | null;
    if (!lead) return c.json({ error: 'Not found' }, 404);
    const member = await getMember({ workspaceId: String(lead.workspaceId), userId: user.$id });
    if (!member) return c.json({ error: 'Unauthorized' }, 401);
    const notes = await LeadNote.find({ leadId }).sort({ createdAt: 1 }).lean() as Record<string, unknown>[];
    const docs = notes.map((n) => ({
      $id: String(n._id),
      $createdAt: n.createdAt instanceof Date ? (n.createdAt as Date).toISOString() : '',
      leadId: String(n.leadId),
      workspaceId: String(n.workspaceId),
      authorId: String(n.authorId),
      authorName: String(n.authorName),
      content: String(n.content),
      type: String(n.type),
      meta: n.meta ? String(n.meta) : undefined,
    }));
    return c.json({ data: docs });
  })
  .post('/:leadId/notes', sessionMiddleware, zValidator('json', z.object({ content: z.string().min(1).max(2000) })), async (c) => {
    const user = c.get('user');
    const { leadId } = c.req.param();
    const { content } = c.req.valid('json');
    await connectDB();
    const lead = await Lead.findById(leadId).lean() as Record<string, unknown> | null;
    if (!lead) return c.json({ error: 'Not found' }, 404);
    const member = await getMember({ workspaceId: String(lead.workspaceId), userId: user.$id });
    if (!member) return c.json({ error: 'Unauthorized' }, 401);
    const u = await User.findById(user.$id).lean() as Record<string, unknown> | null;
    const authorName = String(u?.name ?? 'Unknown');
    const note = await LeadNote.create({ leadId, workspaceId: lead.workspaceId, authorId: user.$id, authorName, content, type: 'note' });
    await logActivity({ workspaceId: String(lead.workspaceId), userId: user.$id, userName: authorName, action: 'noted', entityType: 'lead', entityId: leadId, entityName: String(lead.name), details: { preview: content.slice(0, 80) } });
    return c.json({ data: { $id: String(note._id), $createdAt: note.createdAt?.toISOString() ?? '', leadId, workspaceId: String(lead.workspaceId), authorId: user.$id, authorName, content, type: 'note' } });
  })
  .post(
    '/bulk-update',
    sessionMiddleware,
    zValidator('json', z.object({
      leads: z.array(z.object({
        $id: z.string(),
        status: z.nativeEnum(LeadStatus),
        position: z.number().int().positive(),
      })),
    })),
    async (c) => {
      const user = c.get('user');
      const { leads } = c.req.valid('json');

      if (leads.length === 0) return c.json({ data: [] as LeadType[] });

      await connectDB();
      const firstLead = await Lead.findById(leads[0].$id).lean() as Record<string, unknown> | null;
      if (!firstLead) return c.json({ error: 'Not found' }, 404);

      const member = await getMember({ workspaceId: String(firstLead.workspaceId), userId: user.$id });
      if (!member) return c.json({ error: 'Unauthorized' }, 401);

      const updated = await Promise.all(
        leads.map((l) => Lead.findByIdAndUpdate(l.$id, { status: l.status, position: l.position }, { new: true }).lean())
      );

      return c.json({ data: (updated.filter(Boolean) as Record<string, unknown>[]).map(toLead) });
    }
  );

export default app;
