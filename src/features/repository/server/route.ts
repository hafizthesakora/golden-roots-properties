import { sessionMiddleware } from '@/lib/session-middleware';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { getMember } from '@/features/members/utils';
import { RepositoryFile, WorkspaceFileCategory } from '@/models';
import { connectDB } from '@/lib/db';
import { z } from 'zod';
import { type RepositoryFile as RepositoryFileType, type FileCategory } from '../types';
import { uploadToCloudinary, downloadFromCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';

const DEFAULT_CATEGORIES = [
  { name: 'DOCUMENT', label: 'Document', icon: 'FileText', color: 'bg-blue-50', textColor: 'text-blue-600', isDefault: true, order: 0 },
  { name: 'CONTRACT', label: 'Contract', icon: 'ScrollText', color: 'bg-amber-50', textColor: 'text-amber-700', isDefault: true, order: 1 },
  { name: 'IMAGE', label: 'Image', icon: 'Image', color: 'bg-amber-50', textColor: 'text-amber-700', isDefault: true, order: 2 },
  { name: 'VIDEO', label: 'Video', icon: 'Video', color: 'bg-purple-50', textColor: 'text-purple-600', isDefault: true, order: 3 },
  { name: 'SPREADSHEET', label: 'Spreadsheet', icon: 'Table', color: 'bg-emerald-50', textColor: 'text-emerald-600', isDefault: true, order: 4 },
  { name: 'PRESENTATION', label: 'Presentation', icon: 'Presentation', color: 'bg-orange-50', textColor: 'text-orange-600', isDefault: true, order: 5 },
  { name: 'INVOICE', label: 'Invoice', icon: 'Receipt', color: 'bg-green-50', textColor: 'text-green-700', isDefault: true, order: 6 },
  { name: 'OTHER', label: 'Other', icon: 'File', color: 'bg-neutral-100', textColor: 'text-neutral-600', isDefault: true, order: 7 },
];

function toFile(doc: Record<string, unknown>): RepositoryFileType {
  return {
    $id: String(doc._id),
    $createdAt: doc.createdAt instanceof Date ? (doc.createdAt as Date).toISOString() : '',
    name: String(doc.name),
    category: String(doc.category),
    description: doc.description ? String(doc.description) : undefined,
    workspaceId: String(doc.workspaceId),
    projectId: doc.projectId ? String(doc.projectId) : undefined,
    fileId: String(doc.fileId),
    mimeType: String(doc.mimeType),
    size: Number(doc.size),
    uploadedBy: String(doc.uploadedBy),
  };
}

function toCategory(doc: Record<string, unknown>): FileCategory {
  return {
    $id: String(doc._id),
    $createdAt: doc.createdAt instanceof Date ? (doc.createdAt as Date).toISOString() : '',
    name: String(doc.name),
    label: String(doc.label),
    icon: String(doc.icon),
    color: String(doc.color),
    textColor: String(doc.textColor),
    workspaceId: String(doc.workspaceId),
    isDefault: Boolean(doc.isDefault),
    order: Number(doc.order),
  };
}

async function seedCategories(workspaceId: string) {
  const count = await WorkspaceFileCategory.countDocuments({ workspaceId });
  if (count === 0) {
    await WorkspaceFileCategory.insertMany(DEFAULT_CATEGORIES.map((c) => ({ ...c, workspaceId })));
  }
}

const app = new Hono()
  // ── Categories ────────────────────────────────────────────────────────────
  .get(
    '/categories',
    sessionMiddleware,
    zValidator('query', z.object({ workspaceId: z.string() })),
    async (c) => {
      const user = c.get('user');
      const { workspaceId } = c.req.valid('query');
      const member = await getMember({ workspaceId, userId: user.$id });
      if (!member) return c.json({ error: 'Unauthorized' }, 401);
      await connectDB();
      await seedCategories(workspaceId);
      const cats = await WorkspaceFileCategory.find({ workspaceId }).sort({ order: 1 }).lean() as Record<string, unknown>[];
      return c.json({ data: cats.map(toCategory) });
    }
  )
  .post(
    '/categories',
    sessionMiddleware,
    zValidator('json', z.object({
      workspaceId: z.string(),
      label: z.string().min(1),
      icon: z.string().default('File'),
      color: z.string().default('bg-neutral-100'),
      textColor: z.string().default('text-neutral-600'),
    })),
    async (c) => {
      const user = c.get('user');
      const { workspaceId, label, icon, color, textColor } = c.req.valid('json');
      const member = await getMember({ workspaceId, userId: user.$id });
      if (!member) return c.json({ error: 'Unauthorized' }, 401);
      await connectDB();
      const name = label.toUpperCase().replace(/\s+/g, '_');
      const last = await WorkspaceFileCategory.findOne({ workspaceId }).sort({ order: -1 }).lean() as Record<string, unknown> | null;
      const order = last ? Number(last.order) + 1 : 100;
      const doc = await WorkspaceFileCategory.create({ name, label, icon, color, textColor, workspaceId, isDefault: false, order });
      return c.json({ data: toCategory(doc.toObject()) });
    }
  )
  .patch(
    '/categories/:categoryId',
    sessionMiddleware,
    zValidator('json', z.object({
      label: z.string().min(1).optional(),
      icon: z.string().optional(),
      color: z.string().optional(),
      textColor: z.string().optional(),
    })),
    async (c) => {
      const user = c.get('user');
      const { categoryId } = c.req.param();
      const body = c.req.valid('json');
      await connectDB();
      const cat = await WorkspaceFileCategory.findById(categoryId).lean() as Record<string, unknown> | null;
      if (!cat) return c.json({ error: 'Not found' }, 404);
      const member = await getMember({ workspaceId: String(cat.workspaceId), userId: user.$id });
      if (!member) return c.json({ error: 'Unauthorized' }, 401);
      const updated = await WorkspaceFileCategory.findByIdAndUpdate(categoryId, body, { new: true }).lean() as Record<string, unknown>;
      return c.json({ data: toCategory(updated) });
    }
  )
  .delete('/categories/:categoryId', sessionMiddleware, async (c) => {
    const user = c.get('user');
    const { categoryId } = c.req.param();
    await connectDB();
    const cat = await WorkspaceFileCategory.findById(categoryId).lean() as Record<string, unknown> | null;
    if (!cat) return c.json({ error: 'Not found' }, 404);
    if (cat.isDefault) return c.json({ error: 'Cannot delete a default category' }, 400);
    const member = await getMember({ workspaceId: String(cat.workspaceId), userId: user.$id });
    if (!member) return c.json({ error: 'Unauthorized' }, 401);
    await WorkspaceFileCategory.findByIdAndDelete(categoryId);
    return c.json({ data: { $id: categoryId } });
  })
  // ── Files ─────────────────────────────────────────────────────────────────
  .get(
    '/',
    sessionMiddleware,
    zValidator('query', z.object({
      workspaceId: z.string(),
      projectId: z.string().nullish(),
      category: z.string().nullish(),
      search: z.string().nullish(),
    })),
    async (c) => {
      const user = c.get('user');
      const { workspaceId, projectId, category, search } = c.req.valid('query');
      const member = await getMember({ workspaceId, userId: user.$id });
      if (!member) return c.json({ error: 'Unauthorized' }, 401);
      await connectDB();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const query: Record<string, any> = { workspaceId };
      if (projectId) query.projectId = projectId;
      if (category) query.category = category;
      if (search) query.name = { $regex: search, $options: 'i' };
      const files = await RepositoryFile.find(query).sort({ createdAt: -1 }).lean() as Record<string, unknown>[];
      return c.json({ data: { documents: files.map(toFile), total: files.length } });
    }
  )
  .post('/', sessionMiddleware, async (c) => {
    const user = c.get('user');
    const formData = await c.req.formData();
    const workspaceId = formData.get('workspaceId') as string;
    const name = formData.get('name') as string;
    const category = formData.get('category') as string;
    const description = formData.get('description') as string | null;
    const projectId = formData.get('projectId') as string | null;
    const file = formData.get('file') as File | null;
    if (!workspaceId || !name || !category || !file) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    const member = await getMember({ workspaceId, userId: user.$id });
    if (!member) return c.json({ error: 'Unauthorized' }, 401);
    const bytes = await file.arrayBuffer();
    const fileId = await uploadToCloudinary(name, file.type || 'application/octet-stream', Buffer.from(bytes));
    await connectDB();
    const doc = await RepositoryFile.create({
      workspaceId, name, category,
      description: description || undefined,
      projectId: projectId || undefined,
      fileId,
      mimeType: file.type || 'application/octet-stream',
      size: file.size,
      uploadedBy: user.$id,
    });
    return c.json({ data: toFile(doc.toObject()) });
  })
  .delete('/:fileDocId', sessionMiddleware, async (c) => {
    const user = c.get('user');
    const { fileDocId } = c.req.param();
    await connectDB();
    const doc = await RepositoryFile.findById(fileDocId).lean() as Record<string, unknown> | null;
    if (!doc) return c.json({ error: 'Not found' }, 404);
    const member = await getMember({ workspaceId: String(doc.workspaceId), userId: user.$id });
    if (!member) return c.json({ error: 'Unauthorized' }, 401);
    try { await deleteFromCloudinary(String(doc.fileId), String(doc.mimeType)); } catch { /* ignore if already gone */ }
    await RepositoryFile.findByIdAndDelete(fileDocId);
    return c.json({ data: { $id: fileDocId } });
  })
  .get('/download/:fileDocId', sessionMiddleware, async (c) => {
    const user = c.get('user');
    const { fileDocId } = c.req.param();
    await connectDB();
    const doc = await RepositoryFile.findById(fileDocId).lean() as Record<string, unknown> | null;
    if (!doc) return c.json({ error: 'Not found' }, 404);
    const member = await getMember({ workspaceId: String(doc.workspaceId), userId: user.$id });
    if (!member) return c.json({ error: 'Unauthorized' }, 401);
    const buffer = await downloadFromCloudinary(String(doc.fileId), String(doc.mimeType));
    return new Response(buffer, {
      headers: {
        'Content-Type': String(doc.mimeType),
        'Content-Disposition': `attachment; filename="${encodeURIComponent(String(doc.name))}"`,
      },
    });
  });

export default app;
