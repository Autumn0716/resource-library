## ADDED Requirements

### Requirement: React product documentation app
The system SHALL provide a Bun-managed React application for the resource library while preserving the existing static HTML prototype.

#### Scenario: User starts the React app
- **WHEN** the user runs the documented Bun dev command
- **THEN** a local React resource-library product site starts successfully

#### Scenario: Static prototype remains available
- **WHEN** the React app is created
- **THEN** the existing `resources-library.html` remains present and usable as a static prototype

### Requirement: UI-library backed implementation
The system SHALL use installed UI dependencies for accessible reusable components where appropriate.

#### Scenario: HeroUI is used
- **WHEN** implementing React UI components
- **THEN** the implementation follows HeroUI v3 patterns and does not use v2 provider or framer-motion assumptions

### Requirement: React Bits-informed product docs visual language
The system SHALL present the resource library as a high-aesthetic product documentation experience inspired by React Bits.

#### Scenario: User opens the default page
- **WHEN** the user visits the app
- **THEN** the default interface shows a dark product-docs shell with top navigation, left taxonomy, central introduction/resource content, and a polished right-side product/status rail

### Requirement: Resource discovery and comparison
The system SHALL preserve resource discovery capabilities from the prototype.

#### Scenario: User browses resources
- **WHEN** the user selects a category, search query, type filter, or view
- **THEN** the visible resource content updates without a full page reload

#### Scenario: User compares resources
- **WHEN** the user switches to compare mode
- **THEN** the app shows a dense table/matrix suitable for scanning resource name, category, type, usage, status, and actions

### Requirement: Private data exclusion
The system SHALL avoid embedding private secrets from the Obsidian Markdown source into the React app.

#### Scenario: Source Markdown contains an API key
- **WHEN** app source files are inspected
- **THEN** the private API key text and obvious secret tokens do not appear in the app files

### Requirement: Responsive quality
The system SHALL render cleanly at desktop and mobile viewport widths.

#### Scenario: User opens on mobile
- **WHEN** the viewport is narrow
- **THEN** the layout adapts without horizontal page overflow, text overlap, or unusable controls
