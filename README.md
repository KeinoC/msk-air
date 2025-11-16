# MSK Air

MSK Air project with oRPC boilerplate setup based on the forge-bi project structure.

## Getting Started

Install dependencies:
```bash
bun install
```

Run the development server:
```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
msk-air/
├── app/
│   ├── api/
│   │   └── orpc/
│   │       └── route.ts      # Next.js API route handler
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── lib/
│   └── orpc/
│       ├── router.ts         # Main API router
│       ├── client.ts         # Client configuration
│       └── middleware/
│           └── auth.ts       # Authentication middleware
├── modules/
│   └── example/
│       ├── routers/
│       │   └── example.router.ts
│       └── schemas/
│           └── example.ts
└── package.json
```

## oRPC Setup

See `ORPC_SETUP.md` for detailed documentation on using oRPC in this project.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [oRPC Documentation](https://orpc.unnoq.com)

