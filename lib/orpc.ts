import { os } from '@orpc/server';
import { createAuthMiddleware } from './orpc/middleware/auth';

export const orpcInstance = {
  router: <T extends Record<string, any>>(routes: T): T => routes,
  procedure: os,
};

export const publicProcedure = os;

const authMiddleware = createAuthMiddleware();

export const protectedProcedure = authMiddleware;

