import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { deleteCookie, setCookie } from 'hono/cookie';
import bcrypt from 'bcryptjs';

import { loginSchema } from '../schemas';
import { AUTH_COOKIE } from '../constants';
import { sessionMiddleware } from '@/lib/session-middleware';
import { connectDB } from '@/lib/db';
import { User } from '@/models';
import { signToken } from '@/lib/jwt';

const COOKIE_OPTS = {
  path: '/',
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24 * 30,
};

const app = new Hono()
  .get('/current', sessionMiddleware, (c) => {
    const user = c.get('user');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...safe } = user as typeof user & { passwordHash?: string };
    return c.json({ data: safe });
  })
  .post('/login', zValidator('json', loginSchema), async (c) => {
    const { email, password } = c.req.valid('json');

    await connectDB();
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return c.json({ error: 'Invalid credentials' }, 401);

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return c.json({ error: 'Invalid credentials' }, 401);

    const token = await signToken({ userId: user._id.toString(), email: user.email });
    setCookie(c, AUTH_COOKIE, token, COOKIE_OPTS);
    return c.json({ success: true });
  })
  .post('/register', async (c) => {
    // Public self-registration is disabled. Accounts are created by admins only.
    return c.json({ error: 'Registration is disabled. Contact your administrator.' }, 403);
  })
  .post('/logout', sessionMiddleware, (c) => {
    deleteCookie(c, AUTH_COOKIE);
    return c.json({ success: true });
  });

export default app;
