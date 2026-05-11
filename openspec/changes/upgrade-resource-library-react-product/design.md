## Context

The user wants the resource library to feel like a high-aesthetic product or documentation website and provided React Bits as the latest reference. They also explicitly approved installing UI libraries. The best next step is a React app that preserves the existing content but moves the interface from a handcrafted single HTML prototype to a reusable product-docs implementation.

## Technical Approach

- Runtime/package manager: Bun.
- App scaffold: Vite + React + TypeScript.
- UI library: HeroUI v3 via `@heroui/react`, `@heroui/styles`, `tailwind-variants`, and Tailwind CSS v4 setup.
- Styling: HeroUI component primitives plus custom CSS tokens for the React Bits-inspired product shell.
- Data: local TypeScript resource arrays copied from the current HTML data model, excluding secrets.

## Visual Direction

Use a React Bits-informed dark documentation product style:

- Deep graphite background with a restrained amethyst accent.
- Functional green only for successful/curated status.
- Top product nav with search and compact actions.
- Left docs-style sidebar grouped by resource category.
- Main Introduction-style overview with "Mission" / "Principles" rhythm.
- Right-side product card for "Pro / Atlas" style summary, but tailored to this resource library rather than copied copy.
- Resource browser uses compact cards with spotlight borders and subtle CSS-only motion.

HeroUI influence:

- Use semantic button, chip, card, modal/drawer-like components where practical.
- Follow v3 compound/no-provider assumptions.
- Keep custom theme tokens in CSS rather than hardcoding one-off component colors.

React Bits influence:

- Copy the structure language: top docs nav, left docs index, central documentation content, right promotion/status rail.
- Use at most 2-3 expressive effects on the page to avoid performance and taste issues.
- Disable or simplify effects on mobile.

## Data And Interaction

The app will support:

- Category selection.
- Keyword search across resource name, group, type, status, and usage.
- Type filter chips per current category.
- Views: Introduction, Browse, Compare, Paths.
- Resource detail modal/drawer.
- External resource links open in a new tab.

## Verification

- Run a type/build check with Bun.
- Run browser checks through local dev server.
- Capture desktop and mobile screenshots.
- Check mobile page width for overflow.
- Grep for private key strings and obvious secret tokens.

## Trade-Offs

- Installing HeroUI improves accessibility and component consistency but adds a project build step.
- Vite is faster and smaller than Next.js for this iteration; Fumadocs/Next.js can be a later migration.
- React Bits is used as inspiration rather than dependency because the goal is a resource product, not an animation showcase.
