## Why

The current `resources-library.html` proves the resource taxonomy and interactions, but the user now explicitly approved installing UI libraries and wants a product-page quality implementation informed by React Bits. A React app can support a richer documentation shell, reusable components, cleaner state management, stronger visual polish, and future migration toward Fumadocs / Next.js / MDX.

## What Changes

- Create a Bun-managed React application in this workspace.
- Use HeroUI v3 for accessible React components where it fits the interface.
- Use React Bits as a visual reference for dark product documentation, not as a bulk dependency.
- Preserve the existing resource taxonomy and private-secret exclusion.
- Keep the existing `resources-library.html` as a static prototype/backup.
- Build a polished product documentation shell with top navigation, sidebar taxonomy, searchable resource browsing, compare matrix, roadmap, and product-style overview.

## Success Criteria

- `bun install` and `bun run dev` start the React resource-library site.
- The UI feels closer to React Bits: dark product docs, expressive right-side product card, dense left navigation, polished search and controls.
- Search, category navigation, type filters, tabs/views, command-style search, and resource details still work.
- HeroUI is configured using v3 patterns.
- Desktop and mobile screenshots show no horizontal overflow or overlapping text.
- The API key text from the Obsidian source does not appear in the app source or rendered UI.

## Non-Goals

- Do not remove or overwrite the existing `resources-library.html`.
- Do not build a full Fumadocs or Next.js site in this pass.
- Do not add persistence, login, database, editing, scraping, or live sync.
- Do not expose private secrets from the Markdown note.
