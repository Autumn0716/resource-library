# Astro Migration Closeout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the Astro migration worktree into practical alignment with the original migration brief by closing the remaining UX, asset, and documentation gaps while keeping live-network checks and real hosting deployment non-blocking.

**Architecture:** Keep Astro as the static shell and add only small client islands where runtime state is genuinely needed. Complete the existing filter island instead of inventing a second browse path; add lightweight browser-side controls for locale/theme/favorites/command access; reuse the migrated content collection as the single source for assets, docs, and deployment verification.

**Tech Stack:** Astro, React islands, TypeScript, Bun, Tailwind CSS v4, Pagefind, GitHub Actions.

---

## File map

- `src/components/ResourceFilters.tsx`, `src/components/ResourceCard.astro`, `src/pages/resources/index.astro`: faceted browsing UI and persisted query params.
- `src/components/SiteControls.tsx`, `src/components/FavoriteButton.tsx`, `src/components/CommandPalette.tsx`, `src/layouts/BaseLayout.astro`, `src/lib/i18n.ts`, `src/pages/*.astro`, `src/styles/global.css`: bilingual UI, theme state, favorites, command palette, and lightweight landing-page motion.
- `scripts/fetch-favicons.ts`, `scripts/generate-screenshots.ts`, `public/favicons/`, `public/screenshots/`: asset completion and repeatable generation.
- `README.md`, `docs/astro-migration-regression-checklist.md`, `.github/workflows/check-links.yml`: maintenance/deployment documentation and scheduled link checking.
- `tests/*.test.ts`: regression coverage for new behavior and script guarantees.

### Task 1: Complete faceted browsing

- [x] **Step 1: Add regression tests** for query parsing/filter facets or helper behavior proving `pricing`, `language`, and `difficulty` participate in AND logic and survive URL state.
- [x] **Step 2: Run the targeted test command** for the filter helper behavior.
- [x] **Step 3: Implement the minimal filter changes** by extending `ResourceFilters`, card data attributes, and `/resources` option derivation.
- [x] **Step 4: Re-run the targeted tests** and confirm they pass.

### Task 2: Restore practical first-release enhancements

- [x] **Step 1: Add coverage where logic is testable** for locale labels and persisted client-state helpers.
- [x] **Step 2: Implement the smallest coherent browser-side surface** for locale switch, theme switch, favorites, command palette, and lightweight homepage animation without reintroducing whole-app SPA hydration.
- [x] **Step 3: Re-run tests and Astro checks** to ensure the new islands compile cleanly.

### Task 3: Close asset and maintenance gaps

- [x] **Step 1: Add or extend tests** for favicon fallback behavior and screenshot output-directory creation.
- [x] **Step 2: Improve the scripts minimally** so legacy favicon assets can seed slug-keyed favicons and screenshot generation is repeatable from a clean tree.
- [x] **Step 3: Run `bun run fetch:favicons` and `bun run generate:screenshots`** to materialize the migrated asset sets.
- [x] **Step 4: Add a weekly link-check workflow** while keeping real external-network failures outside the release gate.

### Task 4: Synchronize docs and acceptance evidence

- [x] **Step 1: Update README** to describe the Astro architecture, new content workflow, scripts, and Vercel/Cloudflare Pages deployment settings.
- [x] **Step 2: Update the regression checklist** with actual restored/deferred statuses and explicit non-blocking notes for live link checks and real deploy verification.
- [x] **Step 3: Run end-to-end verification**: tests, `astro check`, content validation, build, and screenshot generation. Browser QA of the deployed site remains an operational follow-up.
