# Tasks: Sidebar Global Cursor Refactor

## Completed

- [x] Remove all `motion.div layoutId="sidebar-active"` from sidebar buttons (Introduction, 全部资源, category headers, Browse all, sub-items)
- [x] Remove `hoveredItem` state and all `setHoveredItem` calls
- [x] Add `navRef`, `itemRefMap`, `cursorPos`, `cursorVisible` state to Sidebar
- [x] Implement `moveCursorTo(el)` using `getBoundingClientRect` + `scrollTop`
- [x] Implement `handleSidebarLeave()` for snap-back-to-selected behavior
- [x] Add `useEffect` for `selectedId` changes (snap cursor when selection changes externally)
- [x] Add `useEffect` for `openGroups` changes (recompute position after accordion toggle)
- [x] Add global `<motion.div className="sidebar-cursor">` inside `<nav>`
- [x] Wire `onMouseEnter` on sub-item buttons to `moveCursorTo(e.currentTarget)`
- [x] Wire `aside.onMouseLeave` to `handleSidebarLeave`
- [x] Replace category header text with `AnimatedGradientText` when `isActive || isScrolling`
- [x] Change category click from toggle to always-open (`if (!isOpen) onToggleGroup`)
- [x] Add `AnimatedGradientText` import
- [x] Add `.sidebar-cursor` CSS rule (absolute, left: 12px, glow shadow)
- [x] Remove `.nav-item.active::before` CSS rule
- [x] Restore nav `padding-left: 12px` for cursor alignment
- [x] Scrollbar already hidden (was done previously)
- [x] Build passes with no TypeScript errors

## Pending Verification

- [ ] Visual: pink line appears at correct X position (aligned with faint vertical line)
- [ ] Visual: pink line slides smoothly between sub-items on hover
- [ ] Visual: pink line snaps back to selected item when mouse leaves sidebar
- [ ] Visual: pink line fades out when no item is selected and mouse leaves
- [ ] Visual: AnimatedGradientText renders on active category headers
- [ ] Visual: Introduction and 全部资源 have no pink line
- [ ] Visual: accordion always opens on category click (never closes)
- [ ] Visual: cursor position correct after accordion expand/collapse
- [ ] Visual: cursor tracks correctly when nav is scrolled
