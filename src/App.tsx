import { Button, Card } from "@heroui/react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  engineeringAngles,
  resourceGroups,
  resources,
  type Resource,
} from "./data/resources";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type View = "intro" | "browse" | "compare" | "paths";

const viewLabels: Record<View, string> = {
  intro: "Introduction",
  browse: "Browse",
  compare: "Compare",
  paths: "Paths",
};

const productLinks = ["Docs", "Showcase", "Tools", "Sponsors"];

function normalize(value: string) {
  return value.toLowerCase();
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

export function App() {
  const [activeGroup, setActiveGroup] = useState("极端审美参考");
  const [activeType, setActiveType] = useState("all");
  const [view, setView] = useState<View>("intro");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Resource | null>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const groupCounts = useMemo(() => countByGroup(), []);
  const visibleGroups = useMemo(
    () => resourceGroups.filter((group) => (groupCounts.get(group.title) ?? 0) > 0),
    [groupCounts],
  );

  const scopedResources = useMemo(
    () => resources.filter((item) => activeGroup === "all" || item.group === activeGroup),
    [activeGroup],
  );

  const typeFilters = useMemo(() => {
    return [...new Set(scopedResources.map((item) => item.type))].sort((a, b) =>
      a.localeCompare(b, "zh-CN"),
    );
  }, [scopedResources]);

  const filteredResources = useMemo(() => {
    const q = normalize(query.trim());
    return scopedResources.filter((item) => {
      const typeMatch = activeType === "all" || item.type === activeType;
      const queryMatch =
        !q ||
        normalize(`${item.name} ${item.group} ${item.type} ${item.status} ${item.use}`).includes(q);
      return typeMatch && queryMatch;
    });
  }, [activeType, query, scopedResources]);

  const relatedResources = useMemo(() => {
    if (!selected) return [];
    return resources
      .filter(
        (item) =>
          item.id !== selected.id && (item.group === selected.group || item.type === selected.type),
      )
      .slice(0, 6);
  }, [selected]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const commandK = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      if (event.key === "/" || commandK) {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key === "Escape") setSelected(null);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.from(".intro-stack .eyebrow, .intro-stack h1, .intro-stack .lead, .hero-actions", {
        autoAlpha: 0,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.08,
        y: 22,
      });

      gsap.from(".bento-card", {
        autoAlpha: 0,
        duration: 0.9,
        ease: "power3.out",
        scale: 0.94,
        stagger: 0.08,
        scrollTrigger: {
          trigger: ".bento-board",
          start: "top 96%",
        },
        y: 34,
      });

      gsap.to(".scrub-copy span", {
        autoAlpha: 1,
        duration: 1,
        ease: "none",
        stagger: 0.18,
        scrollTrigger: {
          trigger: ".scrub-copy",
          start: "top 82%",
          scrub: 0.8,
        },
      });

      gsap.from(".action-panel", {
        autoAlpha: 0,
        duration: 0.8,
        ease: "power3.out",
        scale: 0.96,
        scrollTrigger: {
          trigger: ".action-panel",
          start: "top 84%",
        },
        y: 32,
      });
    },
    { dependencies: [view], revertOnUpdate: true, scope: shellRef },
  );

  function chooseGroup(group: string) {
    setActiveGroup(group);
    setActiveType("all");
    if (view === "intro") setView("browse");
  }

  return (
    <div className="app-shell" ref={shellRef}>
      <aside className="sidebar" aria-label="资源分类">
        <a className="brand" href="#top" onClick={() => setView("intro")}>
          <span className="brand-mark" aria-hidden="true">
            RB
          </span>
          <span>
            <span className="brand-title">Resources Library</span>
            <span className="brand-subtitle">AI Builder Atlas</span>
          </span>
        </a>

        <nav className="side-nav">
          <section>
            <p className="nav-kicker">Get Started</p>
            <button
              className={view === "intro" ? "nav-item active" : "nav-item"}
              type="button"
              onClick={() => setView("intro")}
            >
              Introduction
            </button>
            <button
              className={view === "paths" ? "nav-item active" : "nav-item"}
              type="button"
              onClick={() => setView("paths")}
            >
              Product Paths
            </button>
          </section>

          <section>
            <p className="nav-kicker">Collections</p>
            <button
              className={activeGroup === "all" && view !== "intro" ? "nav-item active" : "nav-item"}
              type="button"
              onClick={() => chooseGroup("all")}
            >
              <span>全部资源</span>
              <span>{resources.length}</span>
            </button>
            {visibleGroups.map((group) => (
              <button
                className={
                  activeGroup === group.title && view !== "intro" ? "nav-item active" : "nav-item"
                }
                key={group.id}
                type="button"
                onClick={() => chooseGroup(group.title)}
              >
                <span>{group.title}</span>
                <span>{groupCounts.get(group.title) ?? 0}</span>
              </button>
            ))}
          </section>
        </nav>

        <p className="private-note">Local source. No private keys are shipped in this app.</p>
      </aside>

      <main className="main-panel" id="top">
        <header className="topbar">
          <div className="product-links" aria-label="产品导航">
            {productLinks.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>

          <label className="search-box">
            <SearchIcon />
            <input
              ref={searchRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search resources, patterns, tools..."
              aria-label="搜索资源"
            />
            <kbd>/</kbd>
          </label>

          <a
            className="github-pill"
            href="https://reactbits.dev/get-started/introduction"
            rel="noreferrer"
            target="_blank"
          >
            React Bits ref
          </a>
        </header>

        <div className="workspace">
          <section className="content-column">
            <div className="view-switch" role="tablist" aria-label="资源库视图">
              {(Object.keys(viewLabels) as View[]).map((next) => (
                <Button
                  className={view === next ? "view-button active" : "view-button"}
                  key={next}
                  onPress={() => setView(next)}
                  size="sm"
                  variant="ghost"
                >
                  {viewLabels[next]}
                </Button>
              ))}
            </div>

            {view !== "intro" && (
              <FilterBar
                activeType={activeType}
                count={filteredResources.length}
                types={typeFilters}
                onChange={setActiveType}
              />
            )}

            {view === "intro" && (
              <IntroView
                groupCounts={groupCounts}
                onBrowse={() => setView("browse")}
                onOpenGroup={chooseGroup}
              />
            )}
            {view === "browse" && (
              <BrowseView
                activeGroup={activeGroup}
                items={filteredResources}
                onInspect={setSelected}
              />
            )}
            {view === "compare" && <CompareView items={filteredResources} onInspect={setSelected} />}
            {view === "paths" && <PathsView onOpenGroup={chooseGroup} />}
          </section>

          <RightRail
            activeGroup={activeGroup}
            filteredCount={filteredResources.length}
            groupCounts={groupCounts}
            onBrowse={() => setView("browse")}
          />
        </div>
      </main>

      {selected && (
        <ResourceDetail
          item={selected}
          related={relatedResources}
          onClose={() => setSelected(null)}
          onInspect={setSelected}
        />
      )}
    </div>
  );
}

function IntroView({
  groupCounts,
  onBrowse,
  onOpenGroup,
}: {
  groupCounts: Map<string, number>;
  onBrowse: () => void;
  onOpenGroup: (group: string) => void;
}) {
  const topGroups = ["极端审美参考", "UI 工程基建", "视觉素材与生成器"];
  const marqueeItems = ["React Bits", "HeroUI", "Mobbin", "Awwwards", "Fumadocs", "Playwright"];

  return (
    <article className="intro-stack">
      <p className="eyebrow">Introduction</p>
      <h1>
        Curated <span className="hero-media-pill" aria-hidden="true" /> UI intelligence for AI builders.
      </h1>
      <p className="lead">
        这不是一个普通收藏夹。它把 UI 审美、组件库、文档站、AI 开发和质量验证资源整理成一个可以持续扩展的桌面级知识入口。
      </p>
      <p className="body-copy">
        React Bits 给这版的启发是清晰的暗色文档结构、鲜明但克制的产品卡和少量可记忆的视觉动作。HeroUI 则负责把按钮、卡片等基础组件放在更稳定的可访问组件体系里。
      </p>

      <div className="hero-actions">
        <Button className="primary-action" onPress={onBrowse} size="lg" variant="primary">
          Browse Library
        </Button>
        <Button className="secondary-action" onPress={() => onOpenGroup("UI 工程基建")} size="lg" variant="outline">
          UI Engineering
        </Button>
      </div>

      <section className="bento-board" aria-label="资源系统预览">
        <button className="bento-card bento-wide" type="button" onClick={() => onOpenGroup("极端审美参考")}>
          <span className="bento-kicker">Taste Map</span>
          <strong>把参考站、动效、版式和产品细节放在同一张审美地图里。</strong>
          <div className="reference-stack" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </button>
        <button className="bento-card bento-wide bento-dark" type="button" onClick={() => onOpenGroup("UI 工程基建")}>
          <span className="bento-kicker">Component Spine</span>
          <strong>从组件库到验证工具，按全栈 AI 产品的实际工作流整理。</strong>
          <div className="component-shelf" aria-hidden="true">
            <span>HeroUI</span>
            <span>Radix</span>
            <span>GSAP</span>
          </div>
        </button>
        <button className="bento-card bento-medium" type="button" onClick={() => onOpenGroup("个人知识库与文档网站")}>
          <span className="bento-kicker">Docs System</span>
          <strong>Obsidian 作为母库，MDX / 文档站负责公开表达。</strong>
        </button>
        <button className="bento-card bento-medium" type="button" onClick={() => onOpenGroup("视觉素材与生成器")}>
          <span className="bento-kicker">Media Layer</span>
          <strong>生成图、素材、灵感板和展示资产统一归档。</strong>
        </button>
        <button className="bento-card bento-medium" type="button" onClick={() => onOpenGroup("待补充方向")}>
          <span className="bento-kicker">AI Stack</span>
          <strong>规格、后端、RAG、评测、安全和运维继续扩展。</strong>
        </button>
      </section>

      <section className="doc-section">
        <h2>Mission</h2>
        <p>
          资源库的目标不是收集更多链接，而是让你在做产品、网站、文档和 AI 应用时，能快速决定该看什么、参考什么、组合什么。
        </p>
        <ul className="principles">
          <li>
            <strong>Visual taste first:</strong>
            <span>先建立审美判断，再进入组件和实现。</span>
          </li>
          <li>
            <strong>Product docs rhythm:</strong>
            <span>像文档一样可查，像产品一样有状态和层级。</span>
          </li>
          <li>
            <strong>Modular sources:</strong>
            <span>每个资源都能迁移到后续 MDX / Fumadocs 内容集合。</span>
          </li>
        </ul>
      </section>

      <p className="scrub-copy">
        {[
          "资源库应该像产品一样有导航、状态、筛选、比较和行动路径。",
          "当你要做一个有审美的 Web 端、文档站或 AI 工具时，它先帮你缩小参考范围。",
          "后续每个条目都可以迁移成 MDX 页面、实现笔记、案例拆解或组件方案。",
        ].map((line) => (
          <span key={line}>{line}</span>
        ))}
      </p>

      <section className="collection-strip" aria-label="关键资源分类">
        {topGroups.map((group) => (
          <button key={group} type="button" onClick={() => onOpenGroup(group)}>
            <span>{group}</span>
            <strong>{groupCounts.get(group) ?? 0}</strong>
          </button>
        ))}
      </section>

      <div className="source-marquee" aria-label="参考来源">
        <div>
          {[...marqueeItems, ...marqueeItems].map((item, index) => (
            <span key={`${item}-${index}`}>{item}</span>
          ))}
        </div>
      </div>

      <section className="action-panel">
        <div>
          <h2>Turn the vault into a product surface.</h2>
          <p>先用这个桌面版管理资源，等资源结构稳定后，再升级成 Fumadocs / Next.js / MDX 文档站。</p>
        </div>
        <Button className="primary-action" onPress={onBrowse} size="lg" variant="primary">
          Start Browsing
        </Button>
      </section>
    </article>
  );
}

function BrowseView({
  activeGroup,
  items,
  onInspect,
}: {
  activeGroup: string;
  items: Resource[];
  onInspect: (item: Resource) => void;
}) {
  const group = resourceGroups.find((item) => item.title === activeGroup);
  return (
    <section className="resource-view">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Collection</p>
          <h1>{activeGroup === "all" ? "全部资源" : activeGroup}</h1>
          <p>{group?.description ?? "跨分类浏览所有资源，适合搜索和快速盘点。"}</p>
        </div>
        <span>{items.length} items</span>
      </div>

      {items.length ? (
        <div className="resource-grid">
          {items.map((item) => (
            <ResourceCard item={item} key={item.id} onInspect={onInspect} />
          ))}
        </div>
      ) : (
        <div className="empty-state">没有匹配资源。换一个关键词或类型试试。</div>
      )}
    </section>
  );
}

function ResourceCard({
  item,
  onInspect,
}: {
  item: Resource;
  onInspect: (item: Resource) => void;
}) {
  return (
    <Card className="resource-card" variant="transparent">
      <Card.Header className="card-head">
        <Card.Title>{item.name}</Card.Title>
        <StatusBadge status={item.status} />
      </Card.Header>
      <Card.Description>{item.use}</Card.Description>
      <Card.Footer className="card-actions">
        <Button onPress={() => onInspect(item)} size="sm" variant="outline">
          详情
        </Button>
        {isExternal(item) ? (
          <a href={item.url} rel="noreferrer" target="_blank">
            打开资源
          </a>
        ) : (
          <span className="disabled-link">待补充</span>
        )}
      </Card.Footer>
      <Card.Content className="tag-row">
        <span>{item.group}</span>
        <span>{item.type}</span>
      </Card.Content>
    </Card>
  );
}

function CompareView({
  items,
  onInspect,
}: {
  items: Resource[];
  onInspect: (item: Resource) => void;
}) {
  return (
    <section className="resource-view">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Reference</p>
          <h1>Compare Matrix</h1>
          <p>适合快速扫描资源类型、用途和状态。以后可以升级成可排序 reference table。</p>
        </div>
        <span>{items.length} rows</span>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Resource</th>
              <th>Group</th>
              <th>Type</th>
              <th>Best for</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  <strong>{item.name}</strong>
                </td>
                <td>{item.group}</td>
                <td>{item.type}</td>
                <td>{item.use}</td>
                <td>
                  <StatusBadge status={item.status} />
                </td>
                <td>
                  <Button onPress={() => onInspect(item)} size="sm" variant="ghost">
                    Inspect
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function PathsView({ onOpenGroup }: { onOpenGroup: (group: string) => void }) {
  const paths = [
    {
      title: "极端审美 Web 产品",
      group: "极端审美参考",
      steps: ["Mobbin / Refero 定产品结构", "Awwwards / Codrops 找视觉方向", "HeroUI / shadcn / Radix 搭组件", "Playwright / Lighthouse 做验证"],
    },
    {
      title: "个人知识库 / 文档网站",
      group: "个人知识库与文档网站",
      steps: ["Obsidian 做本地母库", "Fumadocs / Nextra 做高定制站", "Pagefind / llms.txt 做 AI 友好入口", "MDX 维护长期内容"],
    },
    {
      title: "AI 全栈工程库",
      group: "待补充方向",
      steps: ["规格和任务拆解", "API / 数据库 / 认证", "RAG / Agent / 评测", "安全、运维、成本和增长"],
    },
  ];

  return (
    <section className="resource-view">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Guides</p>
          <h1>Product Paths</h1>
          <p>把资源按目标串起来，不只是按链接堆起来。</p>
        </div>
      </div>
      <div className="path-grid">
        {paths.map((path) => (
          <Card className="path-card" key={path.title} variant="secondary">
            <Card.Header>
              <Card.Title>{path.title}</Card.Title>
            </Card.Header>
            <Card.Content>
              <ol>
                {path.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </Card.Content>
            <Card.Footer>
              <Button onPress={() => onOpenGroup(path.group)} size="sm" variant="outline">
                打开分类
              </Button>
            </Card.Footer>
          </Card>
        ))}
      </div>
    </section>
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
      <button className={activeType === "all" ? "active" : ""} type="button" onClick={() => onChange("all")}>
        全部类型
      </button>
      {types.map((type) => (
        <button className={activeType === type ? "active" : ""} key={type} type="button" onClick={() => onChange(type)}>
          {type}
        </button>
      ))}
      <span>{count} visible</span>
    </div>
  );
}

function RightRail({
  activeGroup,
  filteredCount,
  groupCounts,
  onBrowse,
}: {
  activeGroup: string;
  filteredCount: number;
  groupCounts: Map<string, number>;
  onBrowse: () => void;
}) {
  return (
    <aside className="right-rail" aria-label="资源库状态">
      <Card className="pro-card" variant="tertiary">
        <Card.Header>
          <span className="pro-pill">ATLAS</span>
          <Card.Title>Build a taste system.</Card.Title>
          <Card.Description>
            204 个资源入口，先服务 UI 审美和文档网站，后续扩展全栈 AI 工程资源。
          </Card.Description>
        </Card.Header>
        <Card.Content className="rail-stats">
          <div>
            <strong>{resources.length}</strong>
            <span>resources</span>
          </div>
          <div>
            <strong>{resourceGroups.length}</strong>
            <span>groups</span>
          </div>
          <div>
            <strong>{filteredCount}</strong>
            <span>visible</span>
          </div>
        </Card.Content>
        <Card.Footer>
          <Button fullWidth onPress={onBrowse} variant="primary">
            Explore Library
          </Button>
        </Card.Footer>
      </Card>

      <Card className="sponsor-card" variant="secondary">
        <Card.Header>
          <Card.Title>Current Focus</Card.Title>
          <Card.Description>{activeGroup === "all" ? "全部资源" : activeGroup}</Card.Description>
        </Card.Header>
        <Card.Content className="mini-list">
          {resourceGroups.slice(2, 6).map((group) => (
            <div key={group.id}>
              <span>{group.title}</span>
              <strong>{groupCounts.get(group.title) ?? 0}</strong>
            </div>
          ))}
        </Card.Content>
      </Card>
    </aside>
  );
}

function ResourceDetail({
  item,
  related,
  onClose,
  onInspect,
}: {
  item: Resource;
  related: Resource[];
  onClose: () => void;
  onInspect: (item: Resource) => void;
}) {
  return (
    <div className="detail-layer" role="presentation" onMouseDown={onClose}>
      <aside
        aria-label="资源详情"
        className="detail-panel"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="detail-header">
          <span className="eyebrow">Resource Inspector</span>
          <Button onPress={onClose} size="sm" variant="ghost">
            Close
          </Button>
        </div>
        <h2>{item.name}</h2>
        <div className="detail-tags">
          <span>{item.group}</span>
          <span>{item.type}</span>
          <StatusBadge status={item.status} />
        </div>
        <section>
          <h3>Use when</h3>
          <p>{item.use}</p>
        </section>
        <section>
          <h3>Decision note</h3>
          <p>
            {item.status === "pending"
              ? "这是待补充方向，适合作为后续资料扩展入口。"
              : "这是已收录资源。使用时先看它所处分类，再和同类型资源比较，不要把它当作唯一答案。"}
          </p>
        </section>
        <section>
          <h3>Related</h3>
          <div className="related-list">
            {related.map((next) => (
              <button key={next.id} type="button" onClick={() => onInspect(next)}>
                <span>{next.name}</span>
                <small>
                  {next.group} / {next.type}
                </small>
              </button>
            ))}
          </div>
        </section>
        <div className="detail-actions">
          {isExternal(item) ? (
            <a className="detail-primary-link" href={item.url} rel="noreferrer" target="_blank">
              打开资源
            </a>
          ) : (
            <Button isDisabled variant="secondary">
              待补充
            </Button>
          )}
        </div>
      </aside>
    </div>
  );
}

function StatusBadge({ status }: { status: Resource["status"] }) {
  return <span className={status === "pending" ? "status pending" : "status"}>{status}</span>;
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="17" viewBox="0 0 24 24" width="17">
      <path
        d="m21 21-4.3-4.3m1.3-5.2a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}
