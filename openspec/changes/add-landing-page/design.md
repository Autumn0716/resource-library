## Context

The Resources Library currently lands directly on the main library view. To improve user engagement, we want to introduce a visually appealing Landing Page utilizing high-quality WebGL and CSS animations from the React Bits library (GradientText, SoftAurora, LiquidEther). 

## Goals / Non-Goals

**Goals:**
- Create a dedicated Landing Page as the application's root (`/`).
- Integrate `GradientText`, `SoftAurora`, and `LiquidEther` as reusable components in `src/components/ui/`.
- Provide a smooth transition (routing or conditional rendering) to the main App view.

**Non-Goals:**
- We are not refactoring the entire UI to use framer motion; only the landing page and specific highlighted elements.
- We will not implement complex multi-page routing. Simple state-based or basic routing is sufficient for this scope.

## Decisions

- **Dependency Installation**: Use `bun add motion ogl three` directly to avoid `shadcn` CLI path alias issues. We will manually fetch and integrate the React Bits component source code for `GradientText`, `SoftAurora`, and `LiquidEther`.
- **Routing Strategy**: Given the simplicity of the app, if `react-router-dom` is not installed, we can simply add it or use a simple root state (e.g., `showLanding = true`) in `main.tsx`/`App.tsx` to keep the architecture minimal.
- **Component Placement**: All new animation components will reside in `src/components/ui/` to align with the current structure.

## Risks / Trade-offs

- **Risk**: Performance impact of WebGL backgrounds.
  - **Mitigation**: The components support pausing or disabling rendering when out of view (e.g., `LiquidEther` uses IntersectionObserver). We will ensure they are unmounted or paused when transitioning to the main library.
- **Risk**: Missing source code for React Bits.
  - **Mitigation**: The source code is open source and will be fetched directly from the DavidHDev/react-bits GitHub repository.