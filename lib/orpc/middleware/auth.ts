import { ORPCError, os } from '@orpc/server';

export function createAuthMiddleware() {
  return os.use(async ({ next, context }: any) => {
    const headers = (context as any).headers || {};
    const authHeader = headers.authorization;

    if (!authHeader) {
      throw new ORPCError('UNAUTHORIZED', {
        message: 'Authentication required',
      });
    }

    return next({
      context: {
        ...context,
        user: {
          id: 'user-id',
          email: 'user@example.com',
        },
      },
    });
  });
}

