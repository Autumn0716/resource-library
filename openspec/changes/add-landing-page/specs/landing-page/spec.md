## ADDED Requirements

### Requirement: Landing Page Display
The system SHALL present a visually appealing landing page to the user upon initial visit.

#### Scenario: User visits root URL
- **WHEN** the user navigates to `/`
- **THEN** they see the new Landing Page featuring LiquidEther or SoftAurora backgrounds
- **THEN** they see a clear call-to-action (CTA) button to enter the main Resources Library

### Requirement: Entry to Main App
The system SHALL allow the user to transition from the Landing Page to the main library.

#### Scenario: User clicks Enter button
- **WHEN** the user clicks the CTA button on the Landing Page
- **THEN** the Landing Page is dismissed
- **THEN** the main Resources Library UI is displayed
