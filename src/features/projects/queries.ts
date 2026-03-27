import { createSessionClient } from '@/lib/appwrite';
import { getMember } from '../members/utils';
import { connectDB } from '@/lib/db';
import { Project } from '@/models';
import type { Project as ProjectType } from './types';

interface GetProjectProps {
  projectId: string;
}

export const getProject = async ({ projectId }: GetProjectProps): Promise<ProjectType | null> => {
  try {
    const { user } = await createSessionClient();
    await connectDB();

    const raw = await Project.findById(projectId).lean() as Record<string, unknown> | null;
    if (!raw) return null;

    const member = await getMember({ userId: user.$id, workspaceId: String(raw.workspaceId) });
    if (!member) return null;

    return {
      $id: String(raw._id),
      $createdAt: raw.createdAt instanceof Date ? (raw.createdAt as Date).toISOString() : '',
      name: String(raw.name),
      imageUrl: raw.imageUrl ? String(raw.imageUrl) : undefined,
      workspaceId: String(raw.workspaceId),
    };
  } catch {
    return null;
  }
};
