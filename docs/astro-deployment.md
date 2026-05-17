# Astro Deployment

The Astro migration stays fully static and can be deployed without a runtime server.

## Vercel

- Framework preset: `Astro`
- Install command: `bun install`
- Build command: `bun run build`
- Output directory: `dist`

## Cloudflare Pages

- Framework preset: `Astro`
- Build command: `bun run build`
- Build output directory: `dist`
- Node/Bun runtime: use Bun for install and build steps so the same lockfile and scripts are exercised as CI.

No redirects or edge functions are required for the first migration pass because Astro emits static HTML for every public route.
