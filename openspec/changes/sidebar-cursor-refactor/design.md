# Design: Sidebar Global Cursor

## Architecture Decision

**Single absolute-positioned `motion.div`** inside the `<nav>` scroll container, driven by `getBoundingClientRect()` coordinates + `scrollTop`.

### Why not layoutId

`layoutId` requires the same DOM element to be conditionally rendered inside different parent buttons. Each hover triggers unmount + remount, causing Framer Motion to play a crossfade transition that appears as jank at high interaction speed. A single always-mounted cursor avoids this entirely.

### Why not CSS `::before` pseudo-element

CSS can't smoothly animate `top` between arbitrary DOM positions. `motion.div` with spring physics gives the "magnetic snap" feel the user wants.

## Component Structure

```
<nav ref={navRef} className="side-nav">   ← position: relative, overflow-y: auto
  <motion.div className="sidebar-cursor">  ← position: absolute, left: 12px
    ...animated by Framer Motion...
  </motion.div>
  <section> Introduction (no cursor logic) </section>
  <section> Collections
    <button> 全部资源 (no cursor logic) </button>
    <div> Category group
      <button> Category header (AnimatedGradientText when active) </button>
      <div> Sub-items
        <button onMouseEnter={moveCursorTo}> Resource item </button>
      </div>
    </div>
  </section>
</nav>
```

## Coordinate System

- Cursor uses `position: absolute` inside the nav (which has `position: relative`)
- `y` is computed as: `elRect.top - navRect.top + navRef.scrollTop`
- This gives a position in the nav's content space, so the cursor scrolls with the content naturally
- `height` matches the target button's height (with 8px inset for visual padding)

## State Machine

```
hoveredItem → moveCursorTo(el) → cursorVisible=true, cursorPos updated
sidebar.onMouseLeave → if selectedId → snap to selected item
                     → else → cursorVisible=false (fade out)
selectedId changes → if element in DOM → moveCursorTo(el)
                   → else → cursorVisible=false
openGroups changes → recompute selectedId position if cursor visible
```

## AnimatedGradientText for Category Headers

When a category is active (`isActive || isScrolling`), its title text is wrapped in `<AnimatedGradientText>` from `components/ui/animated-gradient-text`. This uses pure CSS `animate-gradient` with `bg-clip-text` — no JS animation loop, minimal performance cost.

Colors: `#c084fc` (purple-400) → `#d946ef` (fuchsia-500), speed=2 (subtle, slow gradient shift).

## Accordion Click Behavior

Changed from toggle (`onToggleGroup`) to conditional open (`if (!isOpen) onToggleGroup`). Clicking a category always opens the accordion and navigates. Closing an accordion requires clicking the chevron separately (future enhancement if needed).

## CSS Changes

- `.sidebar-cursor`: absolute positioned, `left: 12px`, purple glow shadow, pointer-events: none
- Removed `.nav-item.active::before` (old CSS-based active indicator)
- Nav `padding-left: 12px` restored for cursor alignment
- Scrollbar hidden via `scrollbar-width: none` and `::-webkit-scrollbar { display: none }`
