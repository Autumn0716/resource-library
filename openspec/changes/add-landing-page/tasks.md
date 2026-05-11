## 1. Setup Dependencies

- [ ] 1.1 Run `bun add motion ogl three` to install required animation dependencies.

## 2. Animation Components Implementation

- [ ] 2.1 Create `src/components/ui/GradientText.tsx` and its CSS by fetching React Bits source or using provided snippets.
- [ ] 2.2 Create `src/components/ui/SoftAurora.tsx` by fetching its source from the DavidHDev/react-bits repository.
- [ ] 2.3 Create `src/components/ui/LiquidEther.tsx` by fetching its source from the DavidHDev/react-bits repository.

## 3. Landing Page Construction

- [ ] 3.1 Create `src/Landing.tsx`.
- [ ] 3.2 Implement a hero section in `Landing.tsx` using `SoftAurora` or `LiquidEther` as a background.
- [ ] 3.3 Add a stylized title using `GradientText` in the landing page.
- [ ] 3.4 Add a HeroUI `Button` as a Call-to-Action to enter the library.

## 4. Routing & State Management

- [ ] 4.1 Update `src/App.tsx` (or `main.tsx`) to manage a `showLanding` state (defaulting to `true`).
- [ ] 4.2 Render the `Landing` component when `showLanding` is true; otherwise, render the main Resources Library.
- [ ] 4.3 Pass a callback to `Landing` to set `showLanding` to `false` when the CTA is clicked.