## ADDED Requirements

### Requirement: Direct-open single-file documentation site
The system SHALL provide a complete `resources-library.html` resource-library website that can be opened directly from the filesystem in a modern browser without a build step, package installation, local server, or network dependency for core functionality.

#### Scenario: User opens the HTML file locally
- **WHEN** the user opens `resources-library.html` through a browser or `file://` URL
- **THEN** the site renders the resource-library interface and all core navigation, search, filtering, and view switching works without starting a dev server

#### Scenario: Network is unavailable
- **WHEN** the user opens the site without internet access
- **THEN** the interface still renders and local browsing functionality remains usable, while external resource links simply require internet when clicked

### Requirement: Documentation-style information architecture
The system SHALL present the resource library as a documentation portal with clear hierarchy, sidebar navigation, and multiple views suited to different browsing modes.

#### Scenario: User scans categories
- **WHEN** the user views the site on desktop
- **THEN** the site shows a persistent category navigation area and a main content area with documentation-style hierarchy

#### Scenario: User switches browsing mode
- **WHEN** the user chooses a view such as handbook, resource cards, matrix, or roadmap
- **THEN** the main content area updates to that view without reloading the page

### Requirement: Resource discovery
The system SHALL allow users to discover resources through search, category selection, type filtering, and external links.

#### Scenario: User searches for a resource
- **WHEN** the user enters a keyword matching a resource name, category, type, status, or usage text
- **THEN** the visible resources are filtered to matching results

#### Scenario: User opens a resource
- **WHEN** the user activates an external resource link
- **THEN** the browser opens the target website in a new tab

### Requirement: High-aesthetic UI without heavy dependency setup
The system SHALL use a deliberate, high-aesthetic visual system while preserving the single-file constraint.

#### Scenario: User evaluates visual quality
- **WHEN** the user opens the site
- **THEN** the interface uses a cohesive palette, refined typography, controlled spacing, polished component states, responsive layout, and documentation/product-site cues rather than generic browser defaults

#### Scenario: Implementation chooses UI library strategy
- **WHEN** implementing the single-file version
- **THEN** the implementation MUST avoid package-manager UI libraries and SHOULD use handcrafted HTML/CSS/JS components unless a CDN dependency is explicitly approved

### Requirement: Private data exclusion
The system SHALL avoid embedding private secrets from the source Markdown into the generated website.

#### Scenario: Source Markdown contains an API key
- **WHEN** the HTML resource data is generated or maintained from the Markdown note
- **THEN** the API key text MUST NOT appear in the HTML file or rendered UI

### Requirement: Responsive and accessible interaction
The system SHALL support common desktop and mobile viewport widths and basic accessibility expectations for a local documentation site.

#### Scenario: User opens on mobile
- **WHEN** the viewport is narrow
- **THEN** the layout adapts without horizontal page overflow, text overlap, or unusable controls

#### Scenario: User navigates with keyboard
- **WHEN** the user tabs through controls and uses search or view switching
- **THEN** controls remain focusable, labeled, and functional through keyboard interaction
