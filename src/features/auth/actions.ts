import { createSessionClient } from '@/lib/appwrite';

export const getCurrent = async () => {
  try {
    const { user } = await createSessionClient();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...safe } = user as typeof user & { passwordHash?: string };
    return safe;
  } catch {
    return null;
  }
};
