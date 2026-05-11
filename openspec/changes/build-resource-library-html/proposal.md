## Why

The current Resources Library is useful as a Markdown note, but it is becoming too dense for browsing, comparison, and long-term expansion. A single-file documentation-style website can make the same resource base feel closer to csdiy.wiki or polished product documentation while staying easy to open locally.

The immediate goal is to turn the existing UI / 审美 / 网站资源 section into a high-aesthetic, searchable, multi-view resource browser without committing to a full Next.js / Fumadocs app yet.

## What Changes

- Create a self-contained `resources-library.html` that opens directly in a browser without a build step or local server.
- Present the resource library as a documentation/resource portal with:
  - sidebar category navigation,
  - prominent search,
  - multiple views for handbook reading, card browsing, table/matrix scanning, and recommended routes,
  - curated resource metadata derived from the Markdown note.
- Use a high-end visual direction rather than default documentation styling:
  - restrained neutral palette,
  - editorial spacing,
  - crisp borders and dense-but-readable content,
  - no generic AI-purple SaaS gradients,
  - responsive desktop and mobile layouts.
- Keep private content out of the generated website; the API key present in the Markdown note must not be embedded in the HTML.
- Treat the current one-file HTML draft as replaceable prototype work; the final should be cleaner, more deliberate, and easier to extend.

## Capabilities

### New Capabilities

- `single-file-resource-library-site`: A local single-file documentation website for browsing, searching, filtering, and navigating the resource library.

### Modified Capabilities

- None.

## Impact

- Affected files:
  - `resources-library.html`
  - OpenSpec planning artifacts under `openspec/changes/build-resource-library-html/`
- No package manager, runtime server, or generated dependency lockfile is required for the single-file version.
- External UI libraries are not required unless loaded through CDN; the preferred baseline is handcrafted HTML/CSS/JS to preserve direct-open behavior and avoid brittle dependency setup.
- Browser verification should confirm the file opens locally, renders correctly, and supports search, navigation, filtering, and view switching.
