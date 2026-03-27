import 'server-only';

import { cookies } from 'next/headers';
import { AUTH_COOKIE } from '@/features/auth/constants';
import { verifyToken } from './jwt';
import { connectDB } from './db';
import { User, Member } from '@/models';

export async function createSessionClient() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;

  if (!token) throw new Error('Unauthorized');

  const payload = await verifyToken(token);
  await connectDB();

  const rawUser = await User.findById(payload.userId).lean() as Record<string, unknown> | null;
  if (!rawUser) throw new Error('Unauthorized');

  const userId = String(rawUser._id);

  const user = {
    ...rawUser,
    $id: userId,
    $createdAt: rawUser.createdAt instanceof Date ? rawUser.createdAt.toISOString() : String(rawUser.createdAt ?? ''),
  };

  return { user };
}

// Kept for compatibility — with MongoDB we query directly
export async function getMemberForWorkspace(workspaceId: string, userId: string) {
  await connectDB();
  return Member.findOne({ workspaceId, userId }).lean();
}
