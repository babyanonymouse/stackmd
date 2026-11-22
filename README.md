# stackmd

`stackmd` is a Next.js application built with React, TypeScript, and Tailwind
CSS. The current home page is a small starter surface that can be extended as
the application takes shape.

## Requirements

- Node.js 20 or newer
- pnpm 12 or newer

## Getting started

Install dependencies and start the development server:

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the development server |
| `pnpm build` | Create a production build |
| `pnpm start` | Serve the production build |
| `pnpm lint` | Run ESLint |

## Project structure

```text
src/
└── app/
    ├── layout.tsx      # Root layout and metadata
    ├── page.tsx        # Home page
    └── globals.css     # Global styles
public/                 # Static assets
```

Pages and data-fetching components should remain Server Components by default.
Use client components only at the leaf level when browser APIs or
interactivity are required.

## Development

The project uses `pnpm` as its package manager. Before opening a pull request,
run:

```bash
pnpm tsc --noEmit
pnpm lint
```

Keep the lockfile in sync with dependency changes and follow the repository
guidance in [`AGENTS.md`](./AGENTS.md).

## Learn more

- [Next.js documentation](https://nextjs.org/docs)
- [React documentation](https://react.dev)
- [Tailwind CSS documentation](https://tailwindcss.com/docs)
