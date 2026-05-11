import { Button, Card, Skeleton } from "@heroui/react";
import Fuse from "fuse.js";
import { motion, AnimatePresence } from "motion/react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import {
  resourceGroups,
  resources,
  type Resource,
  type ResourceGroup,
} from "./data/resources";
import { IntroductionHero } from "./components/IntroductionHero";
import { AnimatedGradientText } from "./components/ui/animated-gradient-text";
import { MagicCard } from "./components/ui/MagicCard";
import { useLang } from "./i18n/LangContext";

import { BlurFade } from "./components/ui/BlurFade";

const updatedGroups = new Set(["极端审美参考", "UI 工程基建"]);
const defaultOpenGroups = ["极端审美参考", "UI 工程基建"];
const PENDING_GROUP = "待补充方向";

function useReveal(selector: string, deps: unknown[]) {
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>(selector);
    if (!elements.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const idx = Number(el.dataset.revealIdx ?? 0);
            el.style.transitionDelay = `${idx * 40}ms`;
            el.classList.add("visible");
            observer.unobserve(el);
          }
        }
      },
      { threshold: 0.05 },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

function countByGroup() {
  return resources.reduce<Map<string, number>>((map, item) => {
    map.set(item.group, (map.get(item.group) ?? 0) + 1);
    return map;
  }, new Map());
}

function isExternal(item: Resource) {
  return item.url !== "#";
}

function onMoveSpotlight(event: React.MouseEvent<HTMLElement>) {
  const rect = event.currentTarget.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;
  event.currentTarget.style.setProperty("--mx", `${x}%`);
  event.currentTarget.style.setProperty("--my", `${y}%`);
}

function shuffle<T>(arr: T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function computeRelated(selected: Resource): {
  sameType: Resource[];
  sameGroup: Resource[];
} {
  const pool = resources.filter((r) => r.id !== selected.id);
  const typeAndGroup = pool.filter(
    (r) => r.type === selected.type && r.group === selected.group,
  );
  const typeOnly = pool.filter(
    (r) => r.type === selected.type && r.group !== selected.group,
  );
  const groupOnly = pool.filter(
    (r) => r.group === selected.group && r.type !== selected.type,
  );
  const sameType = [...shuffle(typeAndGroup), ...shuffle(typeOnly)].slice(0, 3);
  const sameGroup = shuffle(groupOnly).slice(0, 3);
  return { sameType, sameGroup };
}

/* Render string with Fuse's char-index matches as <mark> highlights */
function renderWithHighlights(
  text: string,
  matches: ReadonlyArray<[number, number]> | undefined,
): React.ReactNode {
  if (!matches || matches.length === 0) return text;
  const segments: React.ReactNode[] = [];
  let cursor = 0;
  for (let i = 0; i < matches.length; i++) {
    const [start, end] = matches[i];
    if (start > cursor) segments.push(text.slice(cursor, start));
    segments.push(
      <mark key={`m-${i}`} className="hl">
        {text.slice(start, end + 1)}
      </mark>,
    );
    cursor = end + 1;
  }
  if (cursor < text.length) segments.push(text.slice(cursor));
  return <>{segments}</>;
}

interface ResourceWithHighlights extends Resource {
  _highlights?: {
    name?: ReadonlyArray<[number, number]>;
    use?: ReadonlyArray<[number, number]>;
    type?: ReadonlyArray<[number, number]>;
    group?: ReadonlyArray<[number, number]>;
  };
}

export function App() {
  const [activeGroup, setActiveGroup] = useState("intro");
  const [activeType, setActiveType] = useState("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Resource | null>(null);
  const [openGroups, setOpenGroups] = useState<Set<string>>(
    () => new Set(defaultOpenGroups),
  );
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [drawerFocusIdx, setDrawerFocusIdx] = useState<number | null>(null);
  const [pendingOnly, setPendingOnly] = useState(false);
  const [scrollingGroup, setScrollingGroup] = useState<string | null>(null);
  const [viewFading, setViewFading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const lastSurpriseId = useRef<string | null>(null);
  const flatFocusBackup = useRef<number | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const groupCounts = useMemo(() => countByGroup(), []);
  const visibleGroups = useMemo(
    () => resourceGroups.filter((group) => (groupCounts.get(group.title) ?? 0) > 0),
    [groupCounts],
  );

  const curatedCount = useMemo(
    () => resources.filter((r) => r.status === "curated").length,
    [],
  );
  const pendingCount = useMemo(
    () => resources.filter((r) => r.status === "pending").length,
    [],
  );

  const isIntroView = activeGroup === "intro";
  const isAllView = activeGroup === "all";

  const scopedResources = useMemo(
    () => resources.filter((item) => isAllView || item.group === activeGroup),
    [activeGroup, isAllView],
  );

  const typeFilters = useMemo(() => {
    return [...new Set(scopedResources.map((item) => item.type))].sort((a, b) =>
      a.localeCompare(b, "zh-CN"),
    );
  }, [scopedResources]);

  const fuse = useMemo(
    () =>
      new Fuse(scopedResources, {
        keys: [
          { name: "name", weight: 3 },
          { name: "use", weight: 2 },
          { name: "type", weight: 1 },
          { name: "group", weight: 1 },
        ],
        threshold: 0.35,
        minMatchCharLength: 2,
        ignoreLocation: true,
        includeMatches: true,
        includeScore: true,
      }),
    [scopedResources],
  );

  const trimmedQuery = query.trim();
  const isSearching = trimmedQuery.length > 0;

  const filteredResources: ResourceWithHighlights[] = useMemo(() => {
    if (isSearching) {
      const results = fuse.search(trimmedQuery);
      return results
        .filter((r) => (pendingOnly ? r.item.status === "pending" : true))
        .map((r) => {
          const hi: ResourceWithHighlights["_highlights"] = {};
          for (const m of r.matches ?? []) {
            if (!m.key) continue;
            hi[m.key as keyof NonNullable<ResourceWithHighlights["_highlights"]>] =
              m.indices as ReadonlyArray<[number, number]>;
          }
          return { ...r.item, _highlights: hi };
        });
    }
    return scopedResources.filter((item) => {
      if (pendingOnly) return item.status === "pending";
      if (isAllView && item.status === "pending") return false;
      if (!isAllView && activeType !== "all" && item.type !== activeType) return false;
      return true;
    });
  }, [
    isSearching,
    trimmedQuery,
    fuse,
    scopedResources,
    pendingOnly,
    isAllView,
    activeType,
  ]);

  const groupedForFlat = useMemo(() => {
    if (!isAllView || isSearching) return [];
    const map = new Map<string, ResourceWithHighlights[]>();
    for (const r of filteredResources) {
      const bucket = map.get(r.group) ?? [];
      bucket.push(r);
      map.set(r.group, bucket);
    }
    return resourceGroups
      .filter((g) => (map.get(g.title)?.length ?? 0) > 0 && g.title !== PENDING_GROUP)
      .map((g) => ({ group: g, items: map.get(g.title)! }));
  }, [filteredResources, isAllView, isSearching]);

  const pendingRoadmap = useMemo(
    () => resources.filter((r) => r.group === PENDING_GROUP),
    [],
  );

  const relatedPair = useMemo(
    () => (selected ? computeRelated(selected) : { sameType: [], sameGroup: [] }),
    [selected],
  );

  const drawerRelatedFlat = useMemo(
    () => [...relatedPair.sameType, ...relatedPair.sameGroup],
    [relatedPair],
  );

  const flatRows = useMemo(() => {
    if (isIntroView) return [];
    if (isAllView) {
      if (pendingOnly) return pendingRoadmap;
      if (isSearching) return filteredResources;
      return groupedForFlat.flatMap((g) => g.items);
    }
    return filteredResources;
  }, [
    isIntroView,
    isAllView,
    pendingOnly,
    isSearching,
    pendingRoadmap,
    groupedForFlat,
    filteredResources,
  ]);

  const chooseGroup = useCallback((group: string) => {
    setViewFading(true);
    window.setTimeout(() => setViewFading(false), 160);
    setActiveGroup(group);
    setActiveType("all");
    setPendingOnly(false);
    setFocusedIndex(null);
    window.scrollTo({ top: 0 });
  }, []);

  function toggleGroup(group: string) {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  }

  const openResource = useCallback((item: Resource) => {
    setSelected(item);
  }, []);

  const surpriseMe = useCallback(() => {
    const pool = resources.filter(
      (r) => r.status === "curated" && r.id !== lastSurpriseId.current,
    );
    if (!pool.length) return;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    lastSurpriseId.current = pick.id;
    setSelected(pick);
  }, []);

  useEffect(() => {
    setFocusedIndex(null);
  }, [activeGroup, pendingOnly, query]);

  useEffect(() => {
    if (focusedIndex !== null && focusedIndex >= flatRows.length) {
      setFocusedIndex(flatRows.length > 0 ? flatRows.length - 1 : null);
    }
  }, [flatRows.length, focusedIndex]);

  // Focus stack for drawer
  useEffect(() => {
    if (selected) {
      flatFocusBackup.current = focusedIndex;
      setDrawerFocusIdx(null);
    } else if (flatFocusBackup.current !== null) {
      setFocusedIndex(flatFocusBackup.current);
      flatFocusBackup.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  useEffect(() => {
    function isTyping(target: EventTarget | null) {
      const el = target as HTMLElement | null;
      return !!el && ["INPUT", "TEXTAREA"].includes(el.tagName);
    }

    function onKeyDown(event: KeyboardEvent) {
      const typing = isTyping(event.target);
      const key = event.key;
      const cmdK = (event.metaKey || event.ctrlKey) && key.toLowerCase() === "k";

      if (key === "/" || cmdK) {
        event.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
        return;
      }
      if (key === "Escape") {
        if (showHelp) setShowHelp(false);
        else if (selected) setSelected(null);
        else if (typing) (event.target as HTMLInputElement).blur();
        return;
      }
      if (typing) return;

      if (selected) {
        // drawer-scoped nav
        if (key === "j" || key === "ArrowDown") {
          event.preventDefault();
          setDrawerFocusIdx((i) => {
            if (drawerRelatedFlat.length === 0) return null;
            if (i === null) return 0;
            return Math.min(i + 1, drawerRelatedFlat.length - 1);
          });
          return;
        }
        if (key === "k" || key === "ArrowUp") {
          event.preventDefault();
          setDrawerFocusIdx((i) => {
            if (drawerRelatedFlat.length === 0) return null;
            if (i === null) return 0;
            return Math.max(0, i - 1);
          });
          return;
        }
        if (key === "Enter" && drawerFocusIdx !== null && drawerRelatedFlat[drawerFocusIdx]) {
          event.preventDefault();
          setSelected(drawerRelatedFlat[drawerFocusIdx]);
          return;
        }
        if (
          (key === "o" || key === "O") &&
          drawerFocusIdx !== null &&
          drawerRelatedFlat[drawerFocusIdx]
        ) {
          const item = drawerRelatedFlat[drawerFocusIdx];
          if (isExternal(item)) {
            event.preventDefault();
            window.open(item.url, "_blank", "noopener,noreferrer");
          }
          return;
        }
      } else {
        if (key === "j" || key === "ArrowDown") {
          event.preventDefault();
          setFocusedIndex((i) => {
            if (flatRows.length === 0) return null;
            if (i === null) return 0;
            return Math.min(i + 1, flatRows.length - 1);
          });
          return;
        }
        if (key === "k" || key === "ArrowUp") {
          event.preventDefault();
          setFocusedIndex((i) => {
            if (flatRows.length === 0) return null;
            if (i === null) return 0;
            return Math.max(0, i - 1);
          });
          return;
        }
        if (key === "Enter" && focusedIndex !== null && flatRows[focusedIndex]) {
          event.preventDefault();
          openResource(flatRows[focusedIndex]);
          return;
        }
        if ((key === "o" || key === "O") && focusedIndex !== null && flatRows[focusedIndex]) {
          const item = flatRows[focusedIndex];
          if (isExternal(item)) {
            event.preventDefault();
            window.open(item.url, "_blank", "noopener,noreferrer");
          }
          return;
        }
      }

      if (key === "r" || key === "R") {
        event.preventDefault();
        surpriseMe();
        return;
      }
      if (key === "?") {
        event.preventDefault();
        setShowHelp((v) => !v);
        return;
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    flatRows,
    focusedIndex,
    selected,
    showHelp,
    drawerFocusIdx,
    drawerRelatedFlat,
    openResource,
    surpriseMe,
  ]);

  useEffect(() => {
    if (focusedIndex === null || selected) return;
    const row = document.querySelector<HTMLElement>(`[data-row-idx="${focusedIndex}"]`);
    row?.scrollIntoView({ block: "nearest" });
  }, [focusedIndex, selected]);

  useEffect(() => {
    if (drawerFocusIdx === null) return;
    const row = document.querySelector<HTMLElement>(
      `[data-drawer-rel-idx="${drawerFocusIdx}"]`,
    );
    row?.scrollIntoView({ block: "nearest" });
  }, [drawerFocusIdx]);

  // IntersectionObserver for current-section tracking
  useEffect(() => {
    if (!isAllView || isSearching || pendingOnly) {
      setScrollingGroup(null);
      return;
    }
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-section]"),
    );
    if (sections.length === 0) return;

    const visibility = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const name = (entry.target as HTMLElement).dataset.section;
          if (!name) continue;
          visibility.set(name, entry.intersectionRatio);
        }
        let best: string | null = null;
        let bestRatio = 0;
        for (const [name, ratio] of visibility) {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            best = name;
          }
        }
        if (best && bestRatio > 0.02) setScrollingGroup(best);
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: [0, 0.02, 0.1, 0.25, 0.5, 0.75, 1] },
    );

    for (const s of sections) observer.observe(s);
    return () => observer.disconnect();
  }, [isAllView, isSearching, pendingOnly, groupedForFlat.length]);

  const currentChipGroup =
    scrollingGroup && resourceGroups.find((g) => g.title === scrollingGroup);
  const currentChipCount = scrollingGroup
    ? groupCounts.get(scrollingGroup) ?? 0
    : 0;

  return (
    <div className="app-shell">
      <Sidebar
        visibleGroups={visibleGroups}
        groupCounts={groupCounts}
        openGroups={openGroups}
        activeGroup={activeGroup}
        scrollingGroup={isAllView ? scrollingGroup : null}
        selectedId={selected?.id ?? null}
        onChooseGroup={chooseGroup}
        onToggleGroup={toggleGroup}
        onOpenResource={openResource}
        onSurprise={surpriseMe}
      />

      <main className="main-panel" id="top">
        <Topbar searchRef={searchRef} query={query} onQueryChange={setQuery} />

        {currentChipGroup && (
          <CurrentGroupChip
            title={currentChipGroup.title}
            count={currentChipCount}
            onClick={() => chooseGroup(currentChipGroup.title)}
          />
        )}

        <div className={`workspace ${isIntroView ? "with-rail" : "no-rail"}`}>
          <section className={`content-column ${viewFading ? "fading" : ""}`}>
            {isIntroView ? (
              <IntroductionHero />
            ) : isAllView ? (
              <FlatList
                groupedForFlat={groupedForFlat}
                roadmap={pendingRoadmap}
                flatRows={flatRows}
                focusedIndex={focusedIndex}
                curatedCount={curatedCount}
                pendingCount={pendingCount}
                pendingOnly={pendingOnly}
                query={query}
                isSearching={isSearching}
                onTogglePending={() => setPendingOnly((p) => !p)}
                onOpenResource={openResource}
                onChooseGroup={chooseGroup}
              />
            ) : (
              <GroupView
                activeGroup={activeGroup}
                items={filteredResources}
                activeType={activeType}
                focusedIndex={focusedIndex}
                typeFilters={typeFilters}
                onTypeChange={setActiveType}
                onInspect={openResource}
                onBackToAll={() => chooseGroup("all")}
              />
            )}
          </section>

          {isIntroView && (
            <aside className={`right-rail-wrap ${viewFading ? "fading" : ""}`}>
              <AtlasRail visible={resources.length} />
            </aside>
          )}
        </div>
      </main>

      <AnimatePresence>
        {selected && (
          <ResourceDetail
            item={selected}
            related={relatedPair}
            relatedFlat={drawerRelatedFlat}
            drawerFocusIdx={drawerFocusIdx}
            onClose={() => setSelected(null)}
            onInspect={openResource}
          />
        )}
      </AnimatePresence>

      {showHelp && (
        <HelpModal onClose={() => setShowHelp(false)} />
      )}
    </div>
  );
}

/* ===================================================================
   Sidebar
   =================================================================== */

function Sidebar({
  visibleGroups,
  groupCounts,
  openGroups,
  activeGroup,
  scrollingGroup,
  selectedId,
  onChooseGroup,
  onToggleGroup,
  onOpenResource,
  onSurprise,
}: {
  visibleGroups: ResourceGroup[];
  groupCounts: Map<string, number>;
  openGroups: Set<string>;
  activeGroup: string;
  scrollingGroup: string | null;
  selectedId: string | null;
  onChooseGroup: (group: string) => void;
  onToggleGroup: (group: string) => void;
  onOpenResource: (item: Resource) => void;
  onSurprise: () => void;
}) {
  const { t } = useLang();
  const activeRef = useRef<HTMLButtonElement | null>(null);
  const scrollingRef = useRef<HTMLButtonElement | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const itemRefMap = useRef<Map<string, HTMLElement>>(new Map());
  const [cursorPos, setCursorPos] = useState<{ y: number; h: number } | null>(null);
  const [cursorVisible, setCursorVisible] = useState(false);

  useEffect(() => {
    if (scrollingGroup && scrollingRef.current) {
      scrollingRef.current.scrollIntoView({ block: "center", behavior: "smooth" });
    } else if (activeRef.current) {
      activeRef.current.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, [activeGroup, scrollingGroup, selectedId]);

  useEffect(() => {
    if (selectedId) {
      const el = itemRefMap.current.get(selectedId);
      if (el) moveCursorTo(el);
    } else {
      setCursorVisible(false);
    }
  }, [selectedId]);

  useEffect(() => {
    if (!selectedId || !cursorVisible) return;
    const el = itemRefMap.current.get(selectedId);
    if (el) moveCursorTo(el);
  }, [openGroups]);

  const isIntroActive = activeGroup === "intro";
  const isAllViewActive = activeGroup === "all" && !scrollingGroup;

  const moveCursorTo = useCallback((el: HTMLElement) => {
    if (!navRef.current) return;
    const navRect = navRef.current.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    setCursorPos({
      y: elRect.top - navRect.top + navRef.current.scrollTop,
      h: elRect.height,
    });
    setCursorVisible(true);
  }, []);

  function handleSidebarLeave() {
    if (selectedId) {
      const el = itemRefMap.current.get(selectedId);
      if (el) moveCursorTo(el);
      else setCursorVisible(false);
    } else {
      setCursorVisible(false);
    }
  }

  // The active or hovered item determines where the pink line should be.
  // The layoutId="sidebar-active" will smoothly animate it between these states.
  // We use a shared wrapper to ensure the absolute positioning coordinates are consistent (always left: -12px relative to the container).

  return (
    <aside className="sidebar" aria-label={t("sidebar.collections")} onMouseLeave={handleSidebarLeave}>
      <a className="brand" href="#top" onClick={() => onChooseGroup("intro")}>
        <span className="brand-mark" aria-hidden="true">
          RB
        </span>
        <span>
          <span className="brand-title">Resources Library</span>
          <span className="brand-subtitle">AI Builder Atlas</span>
        </span>
      </a>

      <div className="side-nav-wrap">
        <nav ref={navRef} className="side-nav">
          <motion.div
            className="sidebar-cursor"
            animate={
              cursorVisible && cursorPos
                ? { y: cursorPos.y + 4, height: cursorPos.h - 8, opacity: 1 }
                : { opacity: 0 }
            }
            initial={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
          />
          <section className="relative">
            <button
              ref={isIntroActive ? activeRef : null}
              className={isIntroActive ? "nav-item active" : "nav-item"}
              type="button"
              onClick={() => onChooseGroup("intro")}
            >
              <span>Introduction</span>
            </button>
          </section>

          <section className="relative">
            <p className="nav-kicker">{t("sidebar.collections")}</p>
            <button
              ref={isAllViewActive ? activeRef : null}
              className={activeGroup === "all" ? "nav-item active" : "nav-item"}
              type="button"
              onClick={() => onChooseGroup("all")}
            >
              <span>{t("sidebar.allResources")}</span>
              <span className="nav-count">{resources.length}</span>
            </button>
            {visibleGroups.map((group) => {
              const groupResources = resources.filter((r) => r.group === group.title);
              const isOpen = openGroups.has(group.title);
              const isActive = activeGroup === group.title;
              const isScrolling = activeGroup === "all" && scrollingGroup === group.title;

              return (
                <div key={group.id} className="relative">
                  <div
                    className={[
                      "nav-group-head",
                      isOpen || isActive ? "open" : "",
                      isScrolling ? "scrolling" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <button
                      className="nav-chevron-btn"
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleGroup(group.title);
                      }}
                      aria-expanded={isOpen}
                      aria-label={isOpen ? "收起" : "展开"}
                    >
                      <ChevronIcon />
                    </button>
                    <button
                      ref={isScrolling ? scrollingRef : null}
                      className="nav-title-btn"
                      type="button"
                      onClick={() => {
                        if (!isOpen) onToggleGroup(group.title);
                        onChooseGroup(group.title);
                      }}
                    >
                      <span>
                        {isActive || isScrolling ? (
                          <AnimatedGradientText
                            colorFrom="#1a1a1a"
                            colorTo="#c8a96e"
                            speed={2}
                          >
                            {group.title}
                          </AnimatedGradientText>
                        ) : (
                          group.title
                        )}
                        {updatedGroups.has(group.title) ? (
                          <span className="updated-tag">{t("status.updated")}</span>
                        ) : null}
                      </span>
                      <span className="nav-count">{groupCounts.get(group.title) ?? 0}</span>
                    </button>
                  </div>
                  {isOpen && (
                    <div className="nav-subitems">
                      {groupResources.map((item) => {
                        const isActiveItem = selectedId === item.id;
                        const classes = [
                          "nav-subitem",
                          item.status === "pending" ? "pending" : "",
                          isActiveItem ? "active" : "",
                        ]
                          .filter(Boolean)
                          .join(" ");
                        return (
                          <button
                            ref={(el) => {
                              if (el) itemRefMap.current.set(item.id, el);
                              else itemRefMap.current.delete(item.id);
                              if (isActiveItem) activeRef.current = el;
                            }}
                            className={classes}
                            key={item.id}
                            type="button"
                            title={item.use}
                            onClick={() => onOpenResource(item)}
                            onMouseEnter={(e) => moveCursorTo(e.currentTarget)}
                          >
                            {item.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </section>
        </nav>
      </div>

      <div className="sidebar-footer">
        <button
          className="surprise-btn"
          type="button"
          onClick={onSurprise}
          title={t("sidebar.surpriseMe")}
        >
          <ShuffleIcon />
          <span>{t("sidebar.surpriseMe")}</span>
          <kbd>R</kbd>
        </button>
        <p className="shortcut-hints">
          <kbd>/</kbd> {t("sidebar.search")} &nbsp; <kbd>J</kbd>/<kbd>K</kbd> {t("sidebar.navigate")} &nbsp; <kbd>?</kbd> {t("sidebar.help")}
        </p>
      </div>
    </aside>
  );
}

/* ===================================================================
   Topbar
   =================================================================== */

function Topbar({
  searchRef,
  query,
  onQueryChange,
}: {
  searchRef: RefObject<HTMLInputElement | null>;
  query: string;
  onQueryChange: (value: string) => void;
}) {
  const { lang, toggleLang, t } = useLang();
  return (
    <header className="topbar">
      <span className="topbar-mark" aria-hidden="true">
        RB
      </span>
      <label className="search-box">
        <SearchIcon />
        <input
          ref={searchRef}
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={t("topbar.search")}
          aria-label={t("topbar.search")}
        />
        <kbd>/</kbd>
      </label>
      <button className="lang-toggle" onClick={toggleLang} title={lang === "en" ? "切换中文" : "Switch to English"}>
        {lang === "en" ? "中" : "EN"}
      </button>
    </header>
  );
}

/* ===================================================================
   CurrentGroupChip
   =================================================================== */

function CurrentGroupChip({
  title,
  count,
  onClick,
}: {
  title: string;
  count: number;
  onClick: () => void;
}) {
  const { t } = useLang();
  return (
    <button
      className="current-group-chip"
      type="button"
      onClick={onClick}
      title={t("meta.viewAsGrid")}
    >
      <span className="cg-label">{t("chip.browsing")}</span>
      <span className="cg-sep">·</span>
      <span className="cg-title">{title}</span>
      <span className="cg-count">{count}</span>
      <span className="cg-cta">{t("meta.viewAsGrid")}</span>
    </button>
  );
}

/* ===================================================================
   FlatList
   =================================================================== */

function FlatList({
  groupedForFlat,
  roadmap,
  flatRows,
  focusedIndex,
  curatedCount,
  pendingCount,
  pendingOnly,
  query,
  isSearching,
  onTogglePending,
  onOpenResource,
  onChooseGroup,
}: {
  groupedForFlat: Array<{ group: ResourceGroup; items: ResourceWithHighlights[] }>;
  roadmap: Resource[];
  flatRows: ResourceWithHighlights[];
  focusedIndex: number | null;
  curatedCount: number;
  pendingCount: number;
  pendingOnly: boolean;
  query: string;
  isSearching: boolean;
  onTogglePending: () => void;
  onOpenResource: (item: Resource) => void;
  onChooseGroup: (group: string) => void;
}) {
  const globalIndex = new Map<string, number>();
  flatRows.forEach((r, i) => globalIndex.set(r.id, i));
  const visibleCount = flatRows.length;

  useReveal(".flat-row", [flatRows.length, pendingOnly, query]);

  return (
    <div className="flat-list">
      <header className="atlas-meta">
        <span className="docs-badge">Resources Library</span>
        <span className="meta-sep">·</span>
        {pendingOnly ? (
          <>
            <button className="meta-pending meta-back" type="button" onClick={onTogglePending}>
              ← back to {curatedCount} curated
            </button>
            <span className="meta-sep">·</span>
            <span className="meta-stat">{visibleCount} pending shown</span>
          </>
        ) : (
          <>
            <span className="meta-stat">{curatedCount} curated</span>
            {pendingCount > 0 && (
              <>
                <span className="meta-sep">·</span>
                <button className="meta-pending" type="button" onClick={onTogglePending}>
                  {pendingCount} pending
                </button>
              </>
            )}
            {isSearching && (
              <>
                <span className="meta-sep">·</span>
                <span className="meta-filter">fuzzy match · {visibleCount} visible</span>
              </>
            )}
          </>
        )}
      </header>

      {pendingOnly ? (
        <section className="flat-section" data-section={PENDING_GROUP}>
          <FlatSectionHeader
            kicker="Upcoming"
            title="待补充方向"
            keywords="规格·架构·方向"
            hideViewAs
          />
          <div className="flat-rows">
            {flatRows.map((item) => (
              <FlatRow
                key={item.id}
                item={item}
                query={query}
                index={globalIndex.get(item.id) ?? 0}
                focused={globalIndex.get(item.id) === focusedIndex}
                onOpen={onOpenResource}
              />
            ))}
          </div>
        </section>
      ) : isSearching ? (
        flatRows.length === 0 ? (
          <div className="empty-state">
            没有匹配资源。换一个关键词试试，或者{" "}
            <button className="inline-link" type="button" onClick={onTogglePending}>
              看 {pendingCount} 条待补充
            </button>
            。
          </div>
        ) : (
          <div className="flat-rows flat-rows--search">
            {flatRows.map((item, i) => (
              <FlatRow
                key={item.id}
                item={item}
                query={query}
                index={i}
                focused={i === focusedIndex}
                showGroup
                onOpen={onOpenResource}
              />
            ))}
          </div>
        )
      ) : groupedForFlat.length === 0 ? (
        <div className="empty-state">
          没有匹配资源。换一个关键词试试，或者{" "}
          <button className="inline-link" type="button" onClick={onTogglePending}>
            看 {pendingCount} 条待补充
          </button>
          。
        </div>
      ) : (
        <>
          {groupedForFlat.map(({ group, items }) => (
            <section key={group.id} className="flat-section" data-section={group.title}>
              <FlatSectionHeader
                kicker={`${items.length} resources`}
                title={group.title}
                keywords={extractKeywords(group.description)}
                onViewAsGrid={() => onChooseGroup(group.title)}
              />
              <div className="flat-rows">
                {items.map((item) => (
                  <FlatRow
                    key={item.id}
                    item={item}
                    query={query}
                    index={globalIndex.get(item.id) ?? 0}
                    focused={globalIndex.get(item.id) === focusedIndex}
                    onOpen={onOpenResource}
                  />
                ))}
              </div>
            </section>
          ))}
          {roadmap.length > 0 && (
            <section className="roadmap-footer" aria-label="待补充方向">
              <p className="roadmap-label">Upcoming · 待补充方向</p>
              <p className="roadmap-list">
                {roadmap.map((item, i) => (
                  <span key={item.id}>
                    <button
                      type="button"
                      className="roadmap-chip"
                      onClick={() => onOpenResource(item)}
                      title={item.use}
                    >
                      {item.name}
                    </button>
                    {i < roadmap.length - 1 ? <span className="roadmap-sep"> · </span> : null}
                  </span>
                ))}
              </p>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function FlatSectionHeader({
  kicker,
  title,
  keywords,
  onViewAsGrid,
  hideViewAs,
}: {
  kicker: string;
  title: string;
  keywords: string;
  onViewAsGrid?: () => void;
  hideViewAs?: boolean;
}) {
  return (
    <div className="flat-section-header">
      <div className="section-kicker-row">
        <span className="section-kicker">{kicker}</span>
        {!hideViewAs && onViewAsGrid && (
          <button className="section-view-as" type="button" onClick={onViewAsGrid}>
            view as grid →
          </button>
        )}
      </div>
      <h2 className="section-title">{title}</h2>
      <p className="section-keywords">{keywords}</p>
      <div className="section-rule" aria-hidden="true" />
    </div>
  );
}

function FlatRow({
  item,
  index,
  focused,
  showGroup,
  onOpen,
}: {
  item: ResourceWithHighlights;
  query: string;
  index: number;
  focused: boolean;
  showGroup?: boolean;
  onOpen: (item: Resource) => void;
}) {
  const pending = item.status === "pending";
  const highlights = item._highlights;
  return (
    <div
      className={`flat-row ${focused ? "focused" : ""} ${pending ? "pending" : ""}`}
      data-row-idx={index}
      data-reveal-idx={index}
    >
      <button
        className="flat-row-main"
        type="button"
        onClick={() => onOpen(item)}
        title={`Open ${item.name}`}
      >
        <FaviconImg id={item.id} />
        <div className="flat-row-body">
          <div className="flat-row-title-line">
            <span className="flat-row-title">
              {renderWithHighlights(item.name, highlights?.name)}
            </span>
            {showGroup ? (
              <span className="flat-row-group">
                {renderWithHighlights(item.group, highlights?.group)}
              </span>
            ) : null}
            <span className="flat-row-type">
              {renderWithHighlights(item.type, highlights?.type)}
            </span>
          </div>
          <p className="flat-row-use">
            {renderWithHighlights(item.use, highlights?.use)}
          </p>
        </div>
      </button>
      {isExternal(item) ? (
        <a
          className="flat-row-ext"
          href={item.url}
          rel="noreferrer"
          target="_blank"
          aria-label={`Open ${item.name} in new tab`}
          title="Open external (O)"
        >
          <ArrowUpRightIcon />
        </a>
      ) : (
        <span className="flat-row-ext disabled" aria-label="待补充">
          <EllipsisIcon />
        </span>
      )}
    </div>
  );
}

function FaviconImg({ id }: { id: string }) {
  const [stage, setStage] = useState<"png" | "ico" | "svg" | "done">("png");
  if (stage === "done") {
    return <span className="favicon-fallback" aria-hidden="true" />;
  }
  const src =
    stage === "png"
      ? `/icons/${id}.png`
      : stage === "ico"
        ? `/icons/${id}.ico`
        : `/icons/${id}.svg`;
  return (
    <img
      className="favicon"
      src={src}
      alt=""
      loading="lazy"
      onError={() => {
        setStage((prev) =>
          prev === "png" ? "ico" : prev === "ico" ? "svg" : "done",
        );
      }}
    />
  );
}

function extractKeywords(description: string): string {
  if (!description) return "";
  return description
    .replace(/。$/, "")
    .split(/[，,、·。]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 5)
    .join(" · ");
}

/* ===================================================================
   GroupView
   =================================================================== */

function GroupView({
  activeGroup,
  items,
  activeType,
  focusedIndex,
  typeFilters,
  onTypeChange,
  onInspect,
  onBackToAll,
}: {
  activeGroup: string;
  items: ResourceWithHighlights[];
  activeType: string;
  focusedIndex: number | null;
  typeFilters: string[];
  onTypeChange: (type: string) => void;
  onInspect: (item: Resource) => void;
  onBackToAll: () => void;
}) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [loading, setLoading] = useState(true);
  const group = resourceGroups.find((g) => g.title === activeGroup);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, [activeGroup, activeType]);

  useReveal(".flat-row", [items.length, activeType, viewMode, loading]);
  return (
    <div className="group-view">
      <div className="section-heading">
        <button className="crumb-back" type="button" onClick={onBackToAll}>
          ← all resources
        </button>
        <div className="section-heading-title-row">
          <h1 className="section-heading-title">{activeGroup}</h1>
          <div className="section-heading-meta">
            <span>{items.length} items</span>
            <div className="view-toggle">
              <button type="button" className={viewMode === "list" ? "active" : ""} onClick={() => setViewMode("list")}>List</button>
              <button type="button" className={viewMode === "grid" ? "active" : ""} onClick={() => setViewMode("grid")}>Grid</button>
            </div>
          </div>
        </div>
        <p>{group?.description ?? "跨分类浏览。"}</p>
      </div>

      <FilterBar
        activeType={activeType}
        count={items.length}
        types={typeFilters}
        onChange={onTypeChange}
      />

      {items.length ? (
        viewMode === "grid" ? (
          <div className="resource-grid">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <ResourceCardSkeleton key={`skel-${i}`} />
              ))
            ) : (
              items.map((item, i) => (
                <BlurFade key={item.id} delay={i * 0.05} inView offset={10} blur="6px">
                  <ResourceCard
                    item={item}
                    focused={i === focusedIndex}
                    index={i}
                    onInspect={onInspect}
                  />
                </BlurFade>
              ))
            )}
          </div>
        ) : (
          <div className="flat-rows" style={{ marginTop: "24px" }}>
            {items.map((item, i) => (
              <FlatRow
                key={item.id}
                item={item}
                query=""
                index={i}
                focused={i === focusedIndex}
                onOpen={onInspect}
              />
            ))}
          </div>
        )
      ) : (
        <div className="empty-state">没有匹配资源。换一个关键词或类型试试。</div>
      )}
    </div>
  );
}

function ResourceCard({
  item,
  focused,
  index,
  onInspect,
}: {
  item: Resource;
  focused: boolean;
  index: number;
  onInspect: (item: Resource) => void;
}) {
  return (
    <MagicCard
      className={`resource-card ${focused ? "focused" : ""}`}
      data-row-idx={index}
      gradientSize={340}
      gradientFrom="#5a4020"
      gradientTo="#f5e6c8"
      gradientColor="#c8a96e"
      gradientOpacity={0.12}
    >
      <div className="resource-card-inner">
        <div className="card-head">
          <div className="card-head-title">
            <FaviconImg id={item.id} />
            <h3>{item.name}</h3>
          </div>
          <StatusBadge status={item.status} />
        </div>
        <p className="resource-card-desc">{item.use}</p>
        <div className="card-actions">
          <span className="card-type">{item.type}</span>
          <div className="card-actions-right">
            <button
              className="card-detail-btn"
              type="button"
              onClick={() => onInspect(item)}
            >
              Details
            </button>
            {isExternal(item) ? (
              <a href={item.url} rel="noreferrer" target="_blank">
                Open →
              </a>
            ) : (
              <span className="disabled-link">待补充</span>
            )}
          </div>
        </div>
      </div>
    </MagicCard>
  );
}

function FilterBar({
  activeType,
  count,
  types,
  onChange,
}: {
  activeType: string;
  count: number;
  types: string[];
  onChange: (type: string) => void;
}) {
  return (
    <div className="filter-bar">
      <button
        className={activeType === "all" ? "active" : ""}
        type="button"
        onClick={() => onChange("all")}
      >
        {activeType === "all" && (
          <motion.span className="filter-indicator" layoutId="filter-indicator" />
        )}
        <span className="filter-label">全部类型</span>
      </button>
      {types.map((type) => (
        <button
          className={activeType === type ? "active" : ""}
          key={type}
          type="button"
          onClick={() => onChange(type)}
        >
          {activeType === type && (
            <motion.span className="filter-indicator" layoutId="filter-indicator" />
          )}
          <span className="filter-label">{type}</span>
        </button>
      ))}
      <span>{count} visible</span>
    </div>
  );
}

/* ===================================================================
   AtlasRail
   =================================================================== */

function AtlasRail({ visible }: { visible: number }) {
  return (
    <div className="right-rail" aria-label="资源库状态">
      <div className="pro-card-wrap">
        <Card className="pro-card" variant="tertiary">
          <Card.Header>
            <span className="pro-pill">ATLAS</span>
            <Card.Title className="pro-card-title">Build a taste system.</Card.Title>
            <Card.Description className="pro-card-desc">
              {resources.length} 个资源入口，覆盖 UI 审美、组件库、文档站、AI 开发和质量验证。
            </Card.Description>
          </Card.Header>
          <Card.Content className="rail-stats">
            <div>
              <strong>{resources.length}</strong>
              <span>total</span>
            </div>
            <div>
              <strong>{resourceGroups.length}</strong>
              <span>groups</span>
            </div>
            <div>
              <strong>{visible}</strong>
              <span>visible</span>
            </div>
          </Card.Content>
          <Card.Footer>
            <div className="pro-code-pill">
              <span>Press</span>
              <strong>/</strong>
              <span>to focus search</span>
            </div>
          </Card.Footer>
        </Card>
      </div>
    </div>
  );
}

/* ===================================================================
   ResourceDetail
   =================================================================== */

function ResourceDetail({
  item,
  related,
  relatedFlat,
  drawerFocusIdx,
  onClose,
  onInspect,
}: {
  item: Resource;
  related: { sameType: Resource[]; sameGroup: Resource[] };
  relatedFlat: Resource[];
  drawerFocusIdx: number | null;
  onClose: () => void;
  onInspect: (item: Resource) => void;
}) {
  const { t } = useLang();
  const idxMap = new Map<string, number>();
  relatedFlat.forEach((r, i) => idxMap.set(r.id, i));

  const stagger = {
    hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { delay: 0.12 + i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
    }),
  };

  const hasRelated = related.sameType.length > 0 || related.sameGroup.length > 0;

  return (
    <motion.div
      className="detail-layer"
      role="presentation"
      onMouseDown={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <motion.aside
        aria-label="资源详情"
        className="detail-panel"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.98, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 28, mass: 0.5 }}
      >
        {/* Header */}
        <motion.div custom={0} variants={stagger} initial="hidden" animate="visible">
          <div className="detail-header">
            <div className="detail-header-left">
              <span className="detail-header-text">
                <span className="detail-kicker">{item.group}</span>
                <span className="detail-meta-dot" aria-hidden="true">·</span>
                <span>{item.type}</span>
              </span>
              <StatusBadge status={item.status} />
            </div>
            <button className="detail-close-btn" type="button" onClick={onClose} aria-label={t("detail.close")}>
              ×
            </button>
          </div>
        </motion.div>

        {/* Title */}
        <motion.div custom={1} variants={stagger} initial="hidden" animate="visible">
          <div className="detail-title-row">
            <FaviconImg id={item.id} />
            <h2 className="detail-title">{item.name}</h2>
          </div>
        </motion.div>

        {/* Scrollable body */}
        <div className="detail-body">
          {/* Bento body */}
          <div className={`detail-bento ${hasRelated ? "with-related" : ""}`}>
            {/* Left: description */}
            <motion.div custom={2} variants={stagger} initial="hidden" animate="visible">
              <div className="detail-bento-main">
                <div>
                  <h3>{t("detail.reachFor")}</h3>
                  <p>{item.use}</p>

                  {item.status === "pending" && (
                    <div className="detail-pending-notice">
                      {t("detail.pendingNotice")}
                    </div>
                  )}
                </div>

                <div className="detail-actions">
                  {isExternal(item) ? (
                    <a className="detail-primary-link" href={item.url} rel="noreferrer" target="_blank">
                      {t("detail.open")} {item.name} →
                    </a>
                  ) : (
                    <span className="detail-pending-link">{t("detail.linkPending")}</span>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Right: related */}
            {hasRelated && (
              <motion.div custom={3} variants={stagger} initial="hidden" animate="visible">
                <div className="detail-bento-related">
                  <h3>{t("detail.related")}</h3>
                  {related.sameType.length > 0 && (
                    <div className="related-block">
                      <p className="related-label">
                        {t("detail.byType")} <span className="related-label-value">· {item.type}</span>
                      </p>
                      <div className="related-list">
                        {related.sameType.map((next) => {
                          const idx = idxMap.get(next.id) ?? -1;
                          return (
                            <motion.button
                              key={next.id}
                              type="button"
                              className={idx === drawerFocusIdx ? "focused" : ""}
                              data-drawer-rel-idx={idx}
                              onClick={() => onInspect(next)}
                              whileHover={{ x: 3 }}
                              whileTap={{ scale: 0.96 }}
                              transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            >
                              <FaviconImg id={next.id} />
                              <span className="rel-name">{next.name}</span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {related.sameGroup.length > 0 && (
                    <div className="related-block">
                      <p className="related-label">
                        By group <span className="related-label-value">· {item.group}</span>
                      </p>
                      <div className="related-list">
                        {related.sameGroup.map((next) => {
                          const idx = idxMap.get(next.id) ?? -1;
                          return (
                            <motion.button
                              key={next.id}
                              type="button"
                              className={idx === drawerFocusIdx ? "focused" : ""}
                              data-drawer-rel-idx={idx}
                              onClick={() => onInspect(next)}
                              whileHover={{ x: 3 }}
                              whileTap={{ scale: 0.96 }}
                              transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            >
                              <FaviconImg id={next.id} />
                              <span className="rel-name">{next.name}</span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.aside>
    </motion.div>
  );
}

function StatusBadge({ status }: { status: Resource["status"] }) {
  const { t } = useLang();
  return (
    <span className={status === "pending" ? "status pending" : "status"}>
      {status === "pending" ? t("status.pending") : t("status.curated")}
    </span>
  );
}

function ResourceCardSkeleton() {
  return (
    <div className="resource-card-skeleton">
      <div className="rcs-head">
        <div className="rcs-head-left">
          <div className="rcs-avatar" />
          <Skeleton className="h-3.5 w-3/5 rounded-lg" />
        </div>
        <Skeleton className="h-4 w-14 rounded-md" />
      </div>
      <div className="rcs-body">
        <Skeleton className="h-2.5 w-full rounded" />
        <Skeleton className="h-2.5 w-3/5 rounded" />
      </div>
      <div className="rcs-footer">
        <Skeleton className="h-5 w-12 rounded-md" />
        <div className="rcs-footer-right">
          <Skeleton className="h-5 w-14 rounded-md" />
          <Skeleton className="h-3 w-12 rounded" />
        </div>
      </div>
    </div>
  );
}

/* ===================================================================
   HelpModal
   =================================================================== */

function HelpModal({ onClose }: { onClose: () => void }) {
  const { t } = useLang();
  const shortcuts = [
    { keys: "/", desc: t("help.focusSearch") },
    { keys: "J / ↓", desc: t("help.nextRow") },
    { keys: "K / ↑", desc: t("help.prevRow") },
    { keys: "Enter", desc: t("help.openSelected") },
    { keys: "O", desc: t("help.openExternal") },
    { keys: "R", desc: t("help.surprise") },
    { keys: "Esc", desc: t("help.closeBlur") },
    { keys: "?", desc: t("help.togglePanel") },
  ];

  return (
    <div className="help-overlay" role="presentation" onMouseDown={onClose}>
      <div
        className="help-panel"
        role="dialog"
        aria-label={t("help.title")}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h3 className="help-title">{t("help.title")}</h3>
        <div className="help-grid">
          {shortcuts.map((s) => (
            <div key={s.keys} className="help-row">
              <kbd>{s.keys}</kbd>
              <span>{s.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ===================================================================
   Icons
   =================================================================== */

function SearchIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="16" viewBox="0 0 24 24" width="16">
      <path
        d="m21 21-4.3-4.3m1.3-5.2a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg
      aria-hidden="true"
      className="nav-chevron"
      fill="none"
      height="11"
      viewBox="0 0 12 12"
      width="11"
    >
      <path
        d="m4.5 3 3 3-3 3"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function ArrowUpRightIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="14" viewBox="0 0 14 14" width="14">
      <path
        d="M4 10 10 4M5 4h5v5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function ShuffleIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="14" viewBox="0 0 16 16" width="14">
      <path
        d="M12 3h2v2M2 4h2l6 8h4v-2M14 10v2h-2L9 8M2 12h2l3-4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function EllipsisIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="14" viewBox="0 0 14 14" width="14">
      <circle cx="3" cy="7" fill="currentColor" r="1" />
      <circle cx="7" cy="7" fill="currentColor" r="1" />
      <circle cx="11" cy="7" fill="currentColor" r="1" />
    </svg>
  );
}
