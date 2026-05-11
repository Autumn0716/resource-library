## Why

We want to enhance the visual appeal of the project by integrating a series of rich UI animations (GradientText, SoftAurora, and LiquidEther from React Bits) and creating a dedicated Landing Page. This will serve as a visually engaging entry point to the Resources Library application.

## What Changes

- Install required dependencies (`motion`, `ogl`, `three`) using `bun`.
- Integrate `GradientText`, `SoftAurora`, and `LiquidEther` components into `src/components/ui/`.
- Build a new Landing Page (`Landing.tsx`) that incorporates these animation components along with existing HeroUI elements.
- Update the main application entry point to display the Landing Page, providing a clear call-to-action to enter the main Resources Library view.

## Capabilities

### New Capabilities
- `landing-page`: A new entry point page featuring rich WebGL and framer motion animations.
- `animation-components`: A set of new reusable UI components (GradientText, SoftAurora, LiquidEther) added to the project's design system.

### Modified Capabilities
- 

## Impact

- **Dependencies**: Adds `motion`, `ogl`, and `three` to `package.json`.
- **UI Structure**: Introduces a landing page, modifying the root rendering flow (e.g., adding simple routing or conditional rendering in `main.tsx`/`App.tsx`).
- **Files**: New files in `src/components/ui/` and a new page component.