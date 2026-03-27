import { connectDB } from '@/lib/db';
import { Member } from '@/models';
import type { MemberRole } from './types';

interface GetMemberProps {
  workspaceId: string;
  userId: string;
}

export interface MemberDoc {
  $id: string;
  $createdAt: string;
  userId: string;
  workspaceId: string;
  role: MemberRole;
}

export const getMember = async ({ workspaceId, userId }: GetMemberProps): Promise<MemberDoc | null> => {
  await connectDB();
  const member = await Member.findOne({ workspaceId, userId }).lean() as Record<string, unknown> | null;
  if (!member) return null;
  return {
    $id: String(member._id),
    $createdAt: member.createdAt instanceof Date ? (member.createdAt as Date).toISOString() : '',
    userId: String(member.userId),
    workspaceId: String(member.workspaceId),
    role: String(member.role) as MemberRole,
  };
};
