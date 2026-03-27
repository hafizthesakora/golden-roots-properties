import 'server-only';

import { getCookie } from 'hono/cookie';
import { createMiddleware } from 'hono/factory';
import { AUTH_COOKIE } from '@/features/auth/constants';
import { verifyToken } from './jwt';
import { connectDB } from './db';
import { User } from '@/models';

export interface SessionUser {
  $id: string;
  name: string;
  email: string;
  $createdAt: string;
}

type AdditionalContext = {
  Variables: {
    user: SessionUser;
  };
};

export const sessionMiddleware = createMiddleware<AdditionalContext>(
  async (c, next) => {
    const token = getCookie(c, AUTH_COOKIE);

    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    try {
      const payload = await verifyToken(token);
      await connectDB();

      const raw = await User.findById(payload.userId).lean() as {
        _id: { toString(): string };
        name: string;
        email: string;
        createdAt?: Date;
      } | null;

      if (!raw) return c.json({ error: 'Unauthorized' }, 401);

      c.set('user', {
        $id: raw._id.toString(),
        name: raw.name,
        email: raw.email,
        $createdAt: raw.createdAt?.toISOString() ?? '',
      });

      await next();
    } catch {
      return c.json({ error: 'Unauthorized' }, 401);
    }
  }
);
