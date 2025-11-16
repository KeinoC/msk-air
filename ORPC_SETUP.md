# oRPC Boilerplate Setup - MSK Air

This project (msk-air) includes an oRPC boilerplate setup based on the forge-bi project structure.

## Installation

The oRPC packages have been installed:
```bash
bun add @orpc/server @orpc/client
```

## Project Structure

```
lib/
├── orpc.ts                    # Base oRPC instance and procedures
├── orpc/
│   ├── router.ts             # Main API router
│   ├── client.ts             # Client configuration
│   └── middleware/
│       └── auth.ts           # Authentication middleware
app/
└── api/
    └── orpc/
        └── route.ts          # Next.js API route handler
modules/
└── example/
    ├── routers/
    │   └── example.router.ts # Example router
    └── schemas/
        └── example.ts        # Example schemas
```

## Usage

### Creating a New Router

1. Create a schema file in `modules/[feature]/schemas/[resource].ts`:
```typescript
import { z } from 'zod';

export const createResource = {
  request: z.object({
    name: z.string().min(1),
  }),
  response: z.object({
    id: z.string(),
    name: z.string(),
  }),
};
```

2. Create a router file in `modules/[feature]/routers/[resource].router.ts`:
```typescript
import { publicProcedure, protectedProcedure, orpcInstance } from '@/lib/orpc';
import * as resourceSchemas from '../schemas/resource';

export const resourceRouter = orpcInstance.router({
  create: protectedProcedure
    .input(resourceSchemas.createResource.request)
    .output(resourceSchemas.createResource.response)
    .handler(async ({ input, context }) => {
      // Your logic here
      return { id: '1', name: input.name };
    }),
});
```

3. Add the router to `lib/orpc/router.ts`:
```typescript
import { resourceRouter } from '@/modules/[feature]/routers/[resource].router';

export const apiRouter = orpcInstance.router({
  example: exampleRouter,
  resource: resourceRouter, // Add your router here
});
```

### Using Public vs Protected Procedures

- **Public Procedures**: Use `publicProcedure` for endpoints that don't require authentication
- **Protected Procedures**: Use `protectedProcedure` for endpoints that require authentication. The user will be available in `context.user`

### Client Usage

Import and use the client:
```typescript
import { orpcClient } from '@/lib/orpc/client';

const result = await orpcClient.example.hello({ name: 'World' });
```

## API Endpoint

The oRPC API is available at `/api/orpc` and supports both GET and POST requests.

## Example Endpoints

- `POST /api/orpc` - Call any procedure
- `GET /api/orpc` - Call any procedure (for simple queries)

Example request:
```typescript
const response = await fetch('/api/orpc', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    procedure: 'example.hello',
    input: { name: 'World' },
  }),
});
```

