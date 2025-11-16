import { publicProcedure, protectedProcedure, orpcInstance } from '@/lib/orpc';
import * as exampleSchemas from '../schemas/example';
import { ORPCError } from '@orpc/server';

export const exampleRouter = {
  hello: publicProcedure
    .input(exampleSchemas.hello.request)
    .output(exampleSchemas.hello.response)
    .handler(async ({ input }) => {
      return {
        message: `Hello, ${input.name}!`,
        timestamp: new Date().toISOString(),
      };
    }),

  protectedHello: protectedProcedure
    .input(exampleSchemas.protectedHello.request)
    .output(exampleSchemas.protectedHello.response)
    .handler(async ({ input, context }: any) => {
      return {
        message: `Hello, ${context.user.email}!`,
        userId: context.user.id,
        timestamp: new Date().toISOString(),
      };
    }),

  getUser: protectedProcedure
    .route({ method: 'GET', path: '/users/:id' })
    .input(exampleSchemas.getUser.request)
    .output(exampleSchemas.getUser.response)
    .handler(async ({ input, context }: any) => {
      if (input.id !== context.user.id) {
        throw new ORPCError('FORBIDDEN', {
          message: 'You do not have permission to access this resource',
        });
      }

      return {
        id: input.id,
        name: 'User Name',
        email: context.user.email,
      };
    }),
};

