export type Lang = "en" | "zh";

const translations = {
  en: {
    // Sidebar
    "sidebar.collections": "Collections",
    "sidebar.allResources": "All resources",
    "sidebar.surpriseMe": "Surprise me",
    "sidebar.search": "Search",
    "sidebar.navigate": "Navigate",
    "sidebar.help": "Help",

    // Topbar
    "topbar.search": "Search resources, patterns, tools...",

    // Meta
    "meta.curated": "curated",
    "meta.pending": "pending",
    "meta.visible": "visible",
    "meta.total": "total",
    "meta.groups": "groups",
    "meta.resources": "resources",
    "meta.backTo": "back to",
    "meta.fuzzyMatch": "fuzzy match",
    "meta.shown": "shown",
    "meta.items": "items",
    "meta.viewAsGrid": "view as grid →",
    "meta.viewAsList": "View as",

    // Status
    "status.curated": "curated",
    "status.pending": "pending",
    "status.updated": "Updated",

    // Detail modal
    "detail.reachFor": "Reach for this when",
    "detail.keepInMind": "Keep in mind",
    "detail.pendingNotice": "Planned direction, not yet curated. A signpost for future expansion.",
    "detail.related": "Related",
    "detail.byType": "By type",
    "detail.byGroup": "By group",
    "detail.open": "Open",
    "detail.linkPending": "Link pending",
    "detail.close": "Close",

    // Landing
    "landing.hero": "Where taste meets engineering",
    "landing.subtitle": "hand-picked resources spanning UI components, design systems, motion libraries, and AI tooling — organized for builders who care about craft.",
    "landing.cta": "Start exploring",
    "landing.keyboard": "Keyboard driven · Press ? for shortcuts",
    "landing.designEngineering": "Design-engineering resource library",
    "landing.refineAesthetic": "Refine your aesthetic system",
    "landing.refineDesc": "Bridge the gap between extreme aesthetics and solid engineering. Every entry point is chosen to sharpen visual judgment and raise product quality.",

    // Introduction hero
    "intro.hero": "AI Builder Atlas",
    "intro.desc": "Explore the curated resources library for high-end UI components, engineering foundations, and AI workflow tools.",

    // Roadmap
    "roadmap.label": "Upcoming",
    "roadmap.directions": "Pending directions",
    "roadmap.noMatch": "No matching resources. Try a different keyword, or",
    "roadmap.seePending": "see",
    "roadmap.pendingEntries": "pending entries",

    // Group view
    "group.backToAll": "← all resources",
    "group.allTypes": "All types",
    "group.empty": "No matching resources. Try a different keyword or type.",

    // Help modal
    "help.title": "Keyboard shortcuts",
    "help.focusSearch": "Focus search",
    "help.nextRow": "Next row",
    "help.prevRow": "Previous row",
    "help.openSelected": "Open selected",
    "help.openExternal": "Open external URL",
    "help.surprise": "Surprise me",
    "help.closeBlur": "Close / blur",
    "help.togglePanel": "Toggle this panel",

    // Card
    "card.details": "Details",
    "card.open": "Open →",
    "card.pending": "Pending",

    // Chip
    "chip.browsing": "Browsing",

    // Flat section
    "flat.resources": "resources",

    // Atlas rail
    "rail.atlas": "ATLAS",
    "rail.buildTaste": "Build a taste system.",
    "rail.desc": "resource entries covering UI aesthetics, component libraries, documentation sites, AI development, and quality verification.",
    "rail.press": "Press",
    "rail.toFocusSearch": "to focus search",

    // Empty
    "empty.noMatch": "No matching resources. Try a different keyword, or",
    "empty.tryDifferent": "No matching resources. Try a different keyword or type.",
  },
  zh: {
    // Sidebar
    "sidebar.collections": "分类",
    "sidebar.allResources": "全部资源",
    "sidebar.surpriseMe": "随机推荐",
    "sidebar.search": "搜索",
    "sidebar.navigate": "导航",
    "sidebar.help": "帮助",

    // Topbar
    "topbar.search": "搜索资源、模式、工具...",

    // Meta
    "meta.curated": "已精选",
    "meta.pending": "待补充",
    "meta.visible": "可见",
    "meta.total": "总计",
    "meta.groups": "分组",
    "meta.resources": "资源",
    "meta.backTo": "返回",
    "meta.fuzzyMatch": "模糊匹配",
    "meta.shown": "显示",
    "meta.items": "条目",
    "meta.viewAsGrid": "网格视图 →",
    "meta.viewAsList": "视图",

    // Status
    "status.curated": "已精选",
    "status.pending": "待补充",
    "status.updated": "已更新",

    // Detail modal
    "detail.reachFor": "适用场景",
    "detail.keepInMind": "注意",
    "detail.pendingNotice": "计划中的方向，尚未精选。可视为未来扩展的路标，而非已验证的推荐。",
    "detail.related": "相关资源",
    "detail.byType": "按类型",
    "detail.byGroup": "按分组",
    "detail.open": "打开",
    "detail.linkPending": "链接待补充",
    "detail.close": "关闭",

    // Landing
    "landing.hero": "品味与工程的交汇",
    "landing.subtitle": "精选资源，覆盖 UI 组件、设计系统、动效库和 AI 工具 — 为追求工艺的构建者而组织。",
    "landing.cta": "开始探索",
    "landing.keyboard": "键盘驱动 · 按 ? 查看快捷键",
    "landing.designEngineering": "设计工程资源库",
    "landing.refineAesthetic": "打磨你的审美体系",
    "landing.refineDesc": "弥合极致审美与工程落地之间的鸿沟。每一条目都为磨砺视觉判断力、提升产品品质而甄选。",

    // Introduction hero
    "intro.hero": "AI Builder Atlas",
    "intro.desc": "探索精选资源库，涵盖高端 UI 组件、工程基建和 AI 工作流工具。",

    // Roadmap
    "roadmap.label": "即将推出",
    "roadmap.directions": "待补充方向",
    "roadmap.noMatch": "没有匹配资源。换一个关键词试试，或",
    "roadmap.seePending": "查看",
    "roadmap.pendingEntries": "条待补充",

    // Group view
    "group.backToAll": "← 全部资源",
    "group.allTypes": "全部类型",
    "group.empty": "没有匹配资源。试试不同的关键词或类型。",

    // Help modal
    "help.title": "快捷键",
    "help.focusSearch": "聚焦搜索",
    "help.nextRow": "下一条",
    "help.prevRow": "上一条",
    "help.openSelected": "打开选中",
    "help.openExternal": "打开外部链接",
    "help.surprise": "随机推荐",
    "help.closeBlur": "关闭 / 失焦",
    "help.togglePanel": "切换此面板",

    // Card
    "card.details": "详情",
    "card.open": "打开 →",
    "card.pending": "待补充",

    // Chip
    "chip.browsing": "浏览中",

    // Flat section
    "flat.resources": "资源",

    // Atlas rail
    "rail.atlas": "ATLAS",
    "rail.buildTaste": "构建品味体系。",
    "rail.desc": "资源入口，覆盖 UI 审美、组件库、文档站、AI 开发和质量验证。",
    "rail.press": "按",
    "rail.toFocusSearch": "聚焦搜索",

    // Empty
    "empty.noMatch": "没有匹配资源。换一个关键词试试，或",
    "empty.tryDifferent": "没有匹配资源。试试不同的关键词或类型。",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

export function t(lang: Lang, key: TranslationKey): string {
  return translations[lang][key] ?? translations.en[key] ?? key;
}

export function getTranslations(lang: Lang) {
  return translations[lang];
}
