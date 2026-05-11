# Proposal: Sidebar Pink Line Refactor — Global Cursor

## Background

The sidebar navigation uses Framer Motion's `layoutId="sidebar-active"` pattern, placing a `<motion.div>` inside each hoverable button. When the mouse moves between items at different nesting levels, React unmounts/remounts the shared layoutId element, causing visible jank and frame drops. Additionally, the pink line wobbles horizontally because its X position is relative to each button's DOM position, which varies by indentation depth.

## Goal

Replace the per-element layoutId pattern with a single global cursor `motion.div` that slides along a fixed vertical rail, ensuring 60fps animation with zero horizontal wobble.

## Success Criteria

- Pink line never moves horizontally — always at a fixed X position (left rail)
- Animation is smooth (no jank from mount/unmount cycles)
- Every resource sub-item gets the pink line on hover and on selection
- Category headers use AnimatedGradientText instead of pink line
- Introduction and "全部资源" have no pink line — just text color change
- When mouse leaves sidebar, line springs back to selected item
- When no item is selected, line fades out
- Scrollbar is hidden but scrolling still works
- Clicking a category always opens its accordion (never toggles closed)

## What Happens If We Don't Do This

The sidebar remains janky on fast hover, the pink line wobbles between nesting levels, and only category headers have animation (sub-items don't).
