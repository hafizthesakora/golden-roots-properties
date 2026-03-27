import 'server-only';

import { createSessionClient } from '@/lib/appwrite';
import { getMember } from '../members/utils';
import { connectDB } from '@/lib/db';
import { Workspace } from '@/models';

function toDoc(doc: Record<string, unknown>) {
  return {
    ...doc,
    $id: String(doc._id),
    $createdAt: doc.createdAt instanceof Date ? (doc.createdAt as Date).toISOString() : String(doc.createdAt ?? ''),
  };
}

export const getWorkspaces = async () => {
  try {
    const { user } = await createSessionClient();
    await connectDB();

    const { Member } = await import('@/models');
    const members = await Member.find({ userId: user.$id }).lean() as Record<string, unknown>[];

    if (members.length === 0) return { documents: [], total: 0 };

    const workspaceIds = members.map((m) => String(m.workspaceId));
    const workspaces = await Workspace.find({ _id: { $in: workspaceIds } })
      .sort({ createdAt: -1 })
      .lean() as Record<string, unknown>[];

    return { documents: workspaces.map(toDoc), total: workspaces.length };
  } catch {
    return { documents: [], total: 0 };
  }
};

export const getWorkspace = async ({ workspaceId }: { workspaceId: string }) => {
  try {
    const { user } = await createSessionClient();

    const member = await getMember({ userId: user.$id, workspaceId });
    if (!member) return null;

    await connectDB();
    const workspace = await Workspace.findById(workspaceId).lean() as Record<string, unknown> | null;
    return workspace ? toDoc(workspace) : null;
  } catch {
    return null;
  }
};

export const getWorkspaceInfo = async ({ workspaceId }: { workspaceId: string }) => {
  try {
    await connectDB();
    const workspace = await Workspace.findById(workspaceId).lean() as Record<string, unknown> | null;
    return workspace ? { name: String(workspace.name) } : null;
  } catch {
    return null;
  }
};
