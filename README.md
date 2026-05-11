# AI Builder Atlas · Resources Library

A curated design-engineering resource library for builders who care about UI craft, engineering foundations, documentation systems, AI workflows, and quality verification.

Live site: https://resource-library-wheat.vercel.app/

![Resources Library landing screen](./images/landing.png)

## Overview

Resources Library is a static, Git-backed catalog of high-signal tools and references. It currently contains **204 resources** across **9 groups**, with data stored in JSON files and deployed automatically on Vercel.

The project is designed for lightweight maintenance: no backend, no database, no runtime writes. Resource changes are reviewed through Git, then Vercel rebuilds the site.

## Features

- Curated resource groups for academic writing, UI aesthetics, component libraries, visual assets, AI tools, documentation sites, and quality checks.
- Fuzzy search powered by Fuse.js, with highlighted matches.
- Group and type filters for browsing large collections quickly.
- Resource detail drawer with related items by type and group.
- Curated / pending status support for published resources and future directions.
- Keyboard-friendly navigation and help panel.
- Bilingual UI strings for English and Chinese.
- Docs-as-code contribution flow using JSON, GitHub Issues, PRs, and Vercel.

![Resources Library cards grid](./images/cards-grid.png)

## Tech Stack

- Vite
- React 19
- TypeScript
- Bun
- HeroUI v3
- Tailwind CSS v4
- Fuse.js
- Motion / GSAP
- Vercel

## Project Structure

```text
.
├── src/
│   ├── App.tsx
│   ├── components/
│   ├── data/
│   │   ├── groups.json
│   │   ├── resources.json
│   │   └── resources.ts
│   ├── i18n/
│   └── styles.css
├── scripts/
│   ├── add-resource.ts
│   └── fetch-favicons.ts
├── docs/
│   └── resource-update-workflow.md
├── images/
│   ├── cards-grid.png
│   └── landing.png
├── public/
├── package.json
└── vite.config.ts
```

## Getting Started

Install dependencies:

```bash
bun install
```

Run the development server:

```bash
bun run dev
```

Build for production:

```bash
bun run build
```

Preview the production build:

```bash
bun run preview
```

## Resource Data

Resource entries live in:

- `src/data/resources.json`
- `src/data/groups.json`

Each resource has this shape:

```json
{
  "id": "0",
  "name": "Awwwards",
  "url": "https://www.awwwards.com",
  "group": "极端审美参考",
  "type": "网站灵感",
  "use": "获奖网站设计，看顶级视觉、动效和创意交互。",
  "status": "curated"
}
```

`status` can be:

- `curated`: reviewed and shown as a real recommendation.
- `pending`: planned direction or placeholder for future expansion.

## Adding Resources

For maintainers, use the local helper:

```bash
bun scripts/add-resource.ts
```

Or add a resource in batch mode:

```bash
bun scripts/add-resource.ts \
  --name "Motion Primitives" \
  --url "https://motion-primitives.com" \
  --group "UI 工程基建" \
  --type "动效库" \
  --use "Copy-paste motion components built on motion." \
  --status curated
```

For contributors, submit a GitHub Issue using the resource submission template. Approved issues are turned into pull requests by the repository workflow.

More details:

- [CONTRIBUTING.md](./CONTRIBUTING.md)
- [Resource update workflow](./docs/resource-update-workflow.md)

## Deployment

The production site is deployed on Vercel:

https://resource-library-wheat.vercel.app/

Typical flow:

```text
Edit JSON / approve issue
        ↓
Pull request
        ↓
Merge
        ↓
Vercel build and deploy
```

## License

This repository does not currently declare a license. Add one before redistributing or reusing the project outside its current owner context.
