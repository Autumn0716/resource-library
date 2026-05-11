## Context

The source content is a local Obsidian note, `Resources Library.md`, currently focused on UI / 审美 / 网站资源 with placeholders for future full-stack, AI, testing, security, deployment, and product-growth categories. The user wants something closer to csdiy.wiki or polished application documentation: multiple categories, multiple views, and a high-aesthetic interface.

The requested deliverable is not yet a full Fumadocs / Next.js project. The immediate artifact is a single HTML file that can manage and browse the resource library locally.

There is already a rough `resources-library.html` prototype. It should be treated as disposable scaffolding: useful for data shape and interaction ideas, but the final pass should be more intentional.

## Goals / Non-Goals

**Goals:**

- Build one direct-open `resources-library.html`.
- Make it feel like a refined documentation/product resource portal, not a plain bookmark list.
- Support category navigation, search, resource cards, table/matrix scanning, handbook text, and recommended paths.
- Use the existing Markdown as content source and preserve the current resource taxonomy.
- Exclude private API key content from the website.
- Keep implementation maintainable inside one file through clear data, render functions, CSS tokens, and component-like sections.

**Non-Goals:**

- Do not build a Next.js, Fumadocs, Astro, or Docusaurus app in this step.
- Do not add package-manager dependencies or lockfiles.
- Do not implement persistence, editing, login, sync, analytics, or database storage.
- Do not scrape or live-sync external websites.
- Do not expose private secrets from the Obsidian note.

## Decisions

### Decision: Use handcrafted single-file HTML/CSS/JS instead of a UI library

For this deliverable, a package-based UI library is not appropriate. Libraries such as shadcn/ui, Radix, Base UI, Fumadocs, or HeroUI require a project scaffold, build tooling, and dependency management. That conflicts with the user's clarified requirement: "只需要一个 html".

The single-file version will use a small custom design system:

- CSS variables for palette, spacing, borders, shadows, typography.
- Semantic HTML for navigation, buttons, tables, cards, and articles.
- Small JavaScript render functions for data-driven views.
- Inline SVG icons only where useful, avoiding icon package setup.

Alternative considered: Tailwind CDN or Alpine.js CDN. This would speed up styling or state handling, but it adds network dependency and makes the file less self-contained. It can be reconsidered only if the user explicitly wants CDN-based convenience over offline reliability.

### Decision: Use documentation-site IA with product-level visual polish

The site should combine two references:

- csdiy.wiki-style clarity: sidebar taxonomy, dense information, resource routes, practical tables.
- modern product documentation polish: strong search, segmented view controls, refined cards, responsive layout, clear empty states.
- React Bits-style product documentation: dark shell, product top navigation, expressive right-side product card, clear Introduction / Mission content rhythm, and visually memorable but limited creative effects.

The visual direction should avoid generic AI SaaS tropes and the earlier paper-like warm documentation feel. Use a React Bits-informed Graphite Product Docs direction: deep neutral surfaces, fine borders, compact resource cards, a restrained amethyst product accent, functional green success status, and product-console material depth.

### Decision: Do not install HeroUI or React Bits for the single HTML version

HeroUI and React Bits are useful references, but the requested artifact is still one direct-open HTML file. Installing HeroUI v3 would require React, Tailwind CSS v4, `@heroui/react`, and `@heroui/styles`; React Bits components are React-oriented and usually copied or installed per component. For this phase, borrow their design patterns instead:

- HeroUI influence: semantic component states, tokenized theme variables, accessible interaction patterns.
- React Bits influence: dark documentation shell, expressive product card, limited memorable effects, and the "copy only what you need" modular mindset.

### Decision: Keep data embedded but structured

Resource data will be embedded in JavaScript arrays/objects. This keeps the file portable and avoids parsing Markdown at runtime. The data shape should support future migration to JSON, MDX, or a Fumadocs content collection.

Suggested resource fields:

- `name`
- `url`
- `group`
- `type`
- `use`
- `status`

Future optional fields:

- `whenToUse`
- `notFor`
- `alternatives`
- `priority`
- `lastChecked`

### Decision: Use four primary views

- **Overview:** explanatory documentation and how to use the library.
- **Browse:** compact card-based browsing for discovery.
- **Compare:** dense table view for quick scanning.
- **Roadmap:** curated usage paths for goals like "极端审美 Web 产品" and "个人知识库 / 文档网站".

This gives the site the feel of documentation rather than a static gallery.

## Risks / Trade-offs

- **Single HTML can become large** → Keep data separate from render functions inside the file and use clear section comments.
- **No UI library means more manual polish work** → Define reusable CSS classes and component-like render templates.
- **No build step means no TypeScript or linting** → Verify through browser checks, JavaScript syntax checks, and targeted interaction testing.
- **Embedded data can drift from Markdown** → Treat this as a prototype; later migrate to JSON/MDX if the format works.
- **High aesthetic can reduce readability if overdone** → Prefer documentation clarity over spectacle; use motion and decoration sparingly.
- **Dark product surfaces can hide overflow issues** → Verify desktop and mobile viewport widths with browser checks instead of relying on visual inspection alone.

## Migration Plan

1. Replace or substantially refine the existing `resources-library.html` prototype in place.
2. Keep the file standalone and openable directly.
3. Verify it manually and, if possible, through a local browser screenshot.
4. If the single-file version proves useful, plan a later migration to Fumadocs + Next.js + MDX with the HTML serving as the information-architecture prototype.

## Open Questions

- Should the final visual tone lean more "editorial warm documentation" or "cool technical atlas"? Resolved after visual review: use Graphite Control OS, because the user rejected the paper-like warm version and asked for a more advanced product feel.
- Should future resource additions be edited in Markdown first or directly in a structured data block? For now, keep Markdown as the source of truth and manually mirror curated resources into the HTML.
