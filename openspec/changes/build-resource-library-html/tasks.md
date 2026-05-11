## 1. Content And Information Architecture

- [x] 1.1 Review the current Markdown resource categories and decide which content belongs in the first HTML version.
- [x] 1.2 Keep private API key content out of the HTML data model.
- [x] 1.3 Define a compact resource object shape with fields for name, URL, group, type, usage, and status.
- [x] 1.4 Define the first-page documentation copy: purpose, scope, non-goals, and future upgrade path.

## 2. Visual System And Layout

- [x] 2.1 Choose the final single-file visual direction: React Bits-informed Graphite Product Docs with deep neutral surfaces and restrained amethyst accent.
- [x] 2.2 Build CSS tokens for colors, typography, borders, spacing, shadows, and component states.
- [x] 2.3 Implement a responsive shell with sidebar navigation, sticky top search, main content, and mobile fallback.
- [x] 2.4 Add polished states for buttons, chips, cards, empty results, focus, hover, and active interaction.

## 3. Resource Browser Functionality

- [x] 3.1 Implement category navigation that scopes resources by group.
- [x] 3.2 Implement keyword search across name, group, type, status, and usage text.
- [x] 3.3 Implement type filter chips that update based on the current category.
- [x] 3.4 Implement view switching between handbook, resource cards, matrix, and roadmap.
- [x] 3.5 Ensure external links open in a new tab and pending resource categories are clearly marked.

## 4. Documentation Views

- [x] 4.1 Build the handbook view with explanatory documentation and AI full-stack engineering considerations.
- [x] 4.2 Build the resource card view with compact, equal-width, documentation-style cards.
- [x] 4.3 Build the matrix/table view for dense scanning.
- [x] 4.4 Build the roadmap view for common goals such as high-aesthetic Web products and personal documentation sites.

## 5. Verification

- [x] 5.1 Run a JavaScript syntax check or equivalent validation for the single HTML file.
- [x] 5.2 Open the HTML locally and verify direct-open behavior.
- [x] 5.3 Verify search, category navigation, type filtering, view switching, and external links.
- [x] 5.4 Check responsive layout at desktop and mobile viewport widths.
- [x] 5.5 Confirm the API key text from the Markdown source does not appear in `resources-library.html`.

## 6. React Bits Product Page Pass

- [ ] 6.1 Inspect React Bits introduction page and extract applicable product documentation patterns.
- [ ] 6.2 Rework the default view into an Introduction-style product/docs page.
- [ ] 6.3 Update theme tokens from green-led Graphite Control OS to amethyst-led Graphite Product Docs while keeping functional status colors.
- [ ] 6.4 Add a right-side product card and subtle spotlight/gradient material without adding external dependencies.
- [ ] 6.5 Verify desktop/mobile screenshots, interactions, and secret exclusion again.
