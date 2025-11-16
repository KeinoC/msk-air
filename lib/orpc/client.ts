import { createORPCClient } from '@orpc/client';
import { RPCLink } from '@orpc/client/fetch';
import type { ApiRouter } from './router';

export const orpcClient = createORPCClient(
  new RPCLink({
    url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/orpc`,
  })
) as any as ApiRouter;

