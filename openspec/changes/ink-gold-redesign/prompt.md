# 墨金重设计 — Resource Library 完整实施提示词

## 核心理念

**墨色为骨，金光为灯。** 去除所有 teal/purple 色彩，建立纯黑白灰层次体系。金色是光源而非颜料——从特定位置发出，照亮周围，像书房里的铜灯。95% 墨黑 + 5% 暖金。背景中性暖黑（无蓝调），前景纯白到深灰分级。选中态即黑白翻转，不使用彩色高亮。

金色用法铁律：金是光，不是漆。AnimatedGradientText 方向必须是 **金→白**（金是光源端，白是被照亮端）。sidebar cursor 的金线"照亮"旁边文字，active 文字自然变白。品牌标识的微弱金色 box-shadow 像灯在发光。

---

## 一、CSS Design Tokens (`src/styles.css` :root)

### 1.1 语义色彩命名重构

用 ink/muted/line/surface 语义体系替代 primary/accent 命名：

```css
:root {
  color-scheme: dark;

  /* ── Surface 层 ── */
  --surface:          #0a0a0a;    /* 面板主背景（暖黑，去蓝调） */
  --surface-soft:     #141414;    /* 次级背景（卡片、未选中按钮） */
  --surface-raised:   #1c1c1c;    /* 浮起背景（hover 态、弹层） */

  /* ── Ink 层（前景） ── */
  --ink:              #e5e5e5;    /* 主文字、选中态前景 */
  --ink-soft:         #c0c0c0;    /* 次级文字 */
  --ink-raise:        #f5f5f5;    /* 链接、强调文字 */
  --muted:            #8a8a8a;    /* 辅助文字、未激活态 */
  --muted-deep:       #666666;    /* 最弱文字 */
  --faint:            rgba(255, 255, 255, 0.3);

  /* ── Line 层（边框） ── */
  --line:             rgba(255, 255, 255, 0.08);   /* 通用边框 */
  --line-subtle:      rgba(255, 255, 255, 0.06);   /* 微弱分割 */
  --line-strong:      rgba(255, 255, 255, 0.15);   /* 强调边框、hover */

  /* ── Gold 层（光源色，5% 用量） ── */
  --gold:             #c8a96e;    /* 暖金主色（哑光黄铜，饱和度 ~40%，明度 ~70%） */
  --gold-raise:       #e0cfa0;    /* 提亮金（渐变终点、hover） */
  --gold-dim:         #8a7340;    /* 压暗金（低亮度场景） */
  --gold-glow:        rgba(200, 169, 110, 0.15);  /* 金色光晕 */

  /* ── 语义状态色（暖色族，与金同温） ── */
  --status-curated:   #8a9a70;    /* 暖橄榄绿 */
  --status-pending:   #a09070;    /* 暖琥珀灰 */

  /* ── 兼容旧变量（逐步迁移后删除） ── */
  --bg-body:          var(--surface);
  --bg-card:          var(--surface-soft);
  --bg-elevated:      var(--surface-soft);
  --bg-hover:         var(--surface-raised);
  --color-primary:    var(--ink);
  --color-primary-dark:  var(--muted);
  --color-primary-light: var(--ink-raise);
  --color-accent:     var(--ink-soft);
  --color-accent-muted: var(--muted);
  --text-primary:     var(--ink-raise);
  --text-secondary:   var(--ink);
  --text-muted:       var(--muted);
  --text-dimmed:      var(--muted-deep);
  --text-faint:       var(--faint);
  --text-link:        var(--ink-raise);
  --border-primary:   var(--surface-raised);
  --border-secondary: var(--surface-raised);
  --border-subtle:    var(--line-subtle);
  --border-soft:      var(--line);
  --border-contrast:  var(--line-strong);

  /* ── 半透明玻璃 ── */
  --bg-glass:         rgba(12, 10, 8, 0.45);       /* 暖偏移琥珀玻璃 */
  --bg-glass-strong:  rgba(12, 10, 8, 0.85);

  /* ── 同色系阴影 ── */
  --shadow-card:      0 4px 24px rgba(20, 18, 14, 0.8), inset 0 0.5px rgba(255, 255, 255, 0.06);
  --shadow-drop:      0 8px 32px rgba(20, 18, 14, 0.8);

  /* ── 圆角 ── */
  --radius-sm: 10px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 50px;

  /* ── 过渡 ── */
  --transition-fast: 0.15s ease-out;
  --transition-base: 0.2s ease-out;
  --transition-slow: 0.3s ease-out;
  --ease-spring:     cubic-bezier(0.16, 1, 0.3, 1);  /* dampingFraction ≈ 0.78 */

  /* ── 字体 ── */
  --font-display: "Geist", "Bricolage Grotesque", -apple-system, system-ui, sans-serif;
  --font-sans:    "Geist", -apple-system, BlinkMacSystemFont, "Segoe UI",
                   "PingFang SC", "Microsoft YaHei", sans-serif;
  --font-mono:    "Geist Mono", "JetBrains Mono", "SFMono-Regular", ui-monospace, Menlo,
                   monospace;
}
```

---

## 二、Body 背景效果

**`body::before` (点阵) — 暖金微粒：**
```css
background-image: radial-gradient(rgba(200, 169, 110, 0.025) 1px, transparent 1px);
/* 极淡暖金点，肉眼看不出颜色，但整体从"冷黑"变"暖黑" */
```

**`body::after` (环境光晕) — 暖色余晖：**
```css
background:
  radial-gradient(ellipse 60% 40% at 78% 0%, rgba(200, 169, 110, 0.03), transparent 60%),
  radial-gradient(ellipse 40% 40% at 8% 10%, rgba(138, 115, 64, 0.02), transparent 60%);
/* 微弱暖光，像远处灯的余晖 */
```

**`::selection`:**
```css
background: rgba(200, 169, 110, 0.2);
color: #ffffff;
```

---

## 三、Sidebar 侧边栏

**`.brand-mark` 品牌标识 — 金色光源方块：**
```css
background: var(--gold);
color: var(--surface);
font-family: var(--font-mono);
font-size: 12px;
font-weight: 700;
box-shadow: 0 0 14px var(--gold-glow);
/* 金色发光，像一盏小灯 */
```

**`.topbar-mark` 同理：**
```css
background: var(--gold);
color: var(--surface);
box-shadow: 0 0 10px var(--gold-glow);
```

**`.sidebar-cursor` 侧边栏光标 — 金线：**
```css
background: var(--gold);
/* 不用 var(--color-primary)，直接用金 */
```

**选中态 = 黑白翻转：**
```css
.nav-item.active {
  background: var(--ink);
  color: var(--surface);
  border-radius: 8px;
  opacity: 1;
  transform: none; /* 选中态不做 translateX，靠反转本身表达 */
}
```

**`.nav-item .updated-tag` / `.nav-group-head .updated-tag` — 金色微光：**
```css
background: rgba(200, 169, 110, 0.1);
border: 1px solid rgba(200, 169, 110, 0.2);
color: var(--gold);
```

**`.nav-group-head.open .nav-chevron`:**
```css
color: var(--gold);
```

**`.nav-subitem.browse-all`:**
```css
color: var(--gold);
```

**`.surprise-btn:hover` — 金色微光边框：**
```css
border-color: rgba(200, 169, 110, 0.3);
background: rgba(200, 169, 110, 0.06);
```

**`.surprise-btn svg`:**
```css
color: var(--gold);
```

---

## 四、Topbar 顶栏

**`.topbar` 背景 — 暖偏移：**
```css
background: rgba(12, 10, 8, 0.78);
```

**`.search-box:focus-within` — 金色光圈：**
```css
border-color: rgba(200, 169, 110, 0.5);
box-shadow: inset 0 0.5px rgba(255, 255, 255, 0.1), 0 0 0 3px rgba(200, 169, 110, 0.08);
```

**`.search-box input` caret-color：**
```css
caret-color: var(--gold);
```

---

## 五、FlatList 列表视图

**`.docs-badge` — 金色微光：**
```css
border: 1px solid rgba(200, 169, 110, 0.22);
background: rgba(200, 169, 110, 0.08);
color: var(--gold);
```

**`.docs-badge::before` 指示点：**
```css
background: var(--gold);
box-shadow: 0 0 6px var(--gold-glow);
/* 金色小灯点，唯一允许发光的地方 */
```

**`.section-rule` 分隔线 — 金色渐变头：**
```css
background: linear-gradient(
  to right,
  rgba(200, 169, 110, 0.2),
  var(--line-subtle) 35%,
  transparent 80%
);
```

**`.flat-row.focused` — 金色左边框：**
```css
background: rgba(200, 169, 110, 0.06);
box-shadow: inset 2px 0 0 var(--gold);
```

**`.flat-row-ext:hover` — 金色：**
```css
color: var(--gold);
background: rgba(200, 169, 110, 0.06);
```

**`.meta-pending` — 暖琥珀灰（与金色同温）：**
```css
border: 1px solid rgba(160, 144, 112, 0.2);
background: rgba(160, 144, 112, 0.06);
color: var(--status-pending);
```

**`.meta-pending.meta-back` — 金色微光：**
```css
border-color: rgba(200, 169, 110, 0.2);
background: rgba(200, 169, 110, 0.06);
color: var(--gold);
```

**`.inline-link` — 金色下划线：**
```css
color: var(--ink);
text-decoration-color: rgba(200, 169, 110, 0.3);
```

**`.roadmap-chip:hover` — 金色：**
```css
color: var(--gold);
background: rgba(200, 169, 110, 0.06);
```

---

## 六、GroupView 卡片网格视图

**`.filter-bar button.active` — 黑白反转：**
```css
background: var(--ink);
color: var(--surface);
border-color: transparent;
```

**`.resource-card` — 中性暖黑底：**
```css
background: rgba(20, 18, 16, 0.5) !important;
```

**`.resource-card::after` 鼠标追踪光 — 金色微光：**
```css
background: radial-gradient(
  360px circle at var(--mx, 50%) var(--my, 0%),
  rgba(200, 169, 110, 0.08),
  transparent 40%
);
```

**`.resource-card:hover`：**
```css
border-color: rgba(200, 169, 110, 0.25) !important;
background: rgba(26, 24, 20, 0.72) !important;
```

**`.resource-card.focused`：**
```css
border-color: rgba(200, 169, 110, 0.4) !important;
background: rgba(28, 26, 22, 0.82) !important;
box-shadow: 0 0 0 1px rgba(200, 169, 110, 0.2),
  inset 0 0.5px rgba(255, 255, 255, 0.08) !important;
```

**`.card-actions a` — 金色链接：**
```css
color: var(--gold);
```

**`.crumb-back` — 金色：**
```css
color: var(--gold);
```

**View toggle `.active` — 黑白反转：**
```css
background: var(--ink);
color: var(--surface);
```

---

## 七、Status Badges 状态徽章

**`.status` (curated) — 暖橄榄绿（与金同温）：**
```css
border: 1px solid rgba(138, 154, 112, 0.2);
background: rgba(138, 154, 112, 0.08);
color: var(--status-curated);
```

**`.status.pending` — 暖琥珀灰：**
```css
border-color: rgba(160, 144, 112, 0.2);
background: rgba(160, 144, 112, 0.08);
color: var(--status-pending);
```

**`.status::before` — 去发光，仅实心点：**
```css
box-shadow: none;
/* 仅保留 background: currentColor */
```

---

## 八、AtlasRail 右侧面板

**`.pro-card-wrap::before` 旋转边框 — 金色：**
```css
background: conic-gradient(
  from var(--border-angle),
  transparent 0%,
  rgba(200, 169, 110, 0.25) 10%,
  transparent 20%,
  transparent 50%,
  rgba(200, 169, 110, 0.45) 60%,
  transparent 70%
);
```

**`.pro-card` 背景 — 暖黑+金光晕：**
```css
background:
  radial-gradient(circle at 90% -10%, rgba(200, 169, 110, 0.08), transparent 45%),
  #0e0c0a !important;
```

**`.pro-pill` — 金色微光：**
```css
background: rgba(200, 169, 110, 0.1);
color: var(--gold);
border: 1px solid rgba(200, 169, 110, 0.2);
```

**`.rail-stats div`：**
```css
background: rgba(14, 12, 10, 0.6);
```

---

## 九、ResourceDetail 详情抽屉

**`.detail-layer` 遮罩 — 纯黑：**
```css
background: rgba(0, 0, 0, 0.72);
```

**`.detail-panel` — 暖黑：**
```css
background: rgba(14, 12, 10, 0.95);
```

**`.detail-primary-link` 主按钮 — 金色：**
```css
background: var(--gold);
color: var(--surface);
box-shadow: inset 0 1px rgba(255, 255, 255, 0.2), 0 0 12px var(--gold-glow);
```

**`.related-list button:hover` — 金色边框：**
```css
border-color: rgba(200, 169, 110, 0.3);
```

**`.detail-panel h3` / `.related-label` — 金色：**
```css
color: var(--gold);
```

---

## 十、React 组件颜色修改

### 10.1 App.tsx — Sidebar AnimatedGradientText

```tsx
<AnimatedGradientText
  colorFrom="#c8a96e"   /* 金 → 白，金是光源端 */
  colorTo="#e5e5e5"
  speed={2}
>
```

### 10.2 IntroductionHero.tsx — Landing Page

```tsx
// SoftAurora: 暗琥珀余晖（像远处灯的余光）
<SoftAurora
  color1="#3d3020"
  color2="#5a4a30"
  speed={0.5}
  scale={1.2}
  brightness={0.4}
/>

// LiquidEther: 暖灰流体
<LiquidEther
  colors={['#1a1610', '#3d3020', '#5a4a30']}
  mouseForce={20}
  autoDemo={true}
  resolution={0.6}
/>

// GradientText: 金→白渐变标题
<GradientText
  className="text-4xl md:text-6xl font-bold tracking-tighter mb-5"
  colors={['#e5e5e5', '#c8a96e', '#e0cfa0', '#e5e5e5']}
  animationSpeed={5}
>
  AI Builder Atlas
</GradientText>
```

**签名时刻：** Landing hero 就是"走进书房"的瞬间。暗琥珀余晖背景 + 金到白标题，其余页面安静服务内容。

### 10.3 Aurora/Liquid 切换按钮

```tsx
className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-mono transition-colors ${
  bgType === "aurora"
    ? "bg-amber-900/20 text-amber-300/80 border border-amber-700/30"
    : "bg-white/5 text-white/40 border border-transparent hover:bg-white/10 hover:text-white/80"
}`}
```

---

## 十一、五态按钮系统

所有交互按钮覆盖 5 个完整状态：

| 状态 | opacity | background | transform | 附加 |
|------|---------|------------|-----------|------|
| Default | 0.65 | transparent | none | — |
| Hover | 1 | `rgba(255,255,255,0.05)` | `translateX(4px)` | cursor: pointer |
| Press | 0.85 | `rgba(255,255,255,0.1)` | `translateX(4px) scale(0.98)` | — |
| Focus | 1 | transparent | none | `box-shadow: 0 0 0 1.5px rgba(255,255,255,0.3)` |
| Disabled | 0.3 | transparent | none | `pointer-events: none` |

选中态（`.active`）不走这套，走**黑白反转**：`background: var(--ink); color: var(--surface);`

---

## 十二、Slide + Blur 三参数过渡

### 12.1 视图切换 fading

```css
.content-column {
  transition: opacity 0.2s ease-out, transform 0.2s ease-out, filter 0.2s ease-out;
}
.content-column.fading {
  opacity: 0;
  transform: translateY(8px);
  filter: blur(4px);
}
```

三个参数同时变化：内容向上滑出 + 模糊 + 淡出，比纯 alpha 更有空间感。

### 12.2 Detail 抽屉滑入

```css
.detail-panel {
  animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes slideInRight {
  from {
    transform: translateX(40px);
    filter: blur(8px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    filter: blur(0);
    opacity: 1;
  }
}
```

### 12.3 右侧面板 fading

```css
.right-rail-wrap.fading {
  opacity: 0;
  transform: translateY(8px);
  filter: blur(4px);
  transition: opacity 0.16s ease-out, transform 0.16s ease-out, filter 0.16s ease-out;
}
```

---

## 十三、滚动与进入动画

### 13.1 Section 进入动画

每个 `.flat-section` 进入视口时淡入上滑：

```css
.flat-section {
  opacity: 0;
  transform: translateY(12px);
  transition: opacity 0.4s ease-out, transform 0.4s ease-out;
}
.flat-section.visible {
  opacity: 1;
  transform: translateY(0);
}
```

IntersectionObserver 批量触发，添加 `.visible` class。

### 13.2 卡片 staggered reveal

网格视图每张卡片进入时延迟 stagger：

```css
.resource-card {
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 0.4s ease-out, transform 0.4s ease-out;
}
.resource-card.visible {
  opacity: 1;
  transform: translateY(0);
}
```

每张卡片延迟 60ms stagger，IntersectionObserver 批量触发。

### 13.3 FlatRow 列表行

```css
.flat-row {
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.3s ease-out, transform 0.3s ease-out;
}
.flat-row.visible {
  opacity: 1;
  transform: translateY(0);
}
```

行级 stagger 30ms。

---

## 十四、Spring 参数统一

| 场景 | CSS 曲线 | 对应 dampingFraction | 时长 |
|------|----------|---------------------|------|
| sidebar-cursor | Framer Motion spring | stiffness=350, damping=30 | — |
| 按钮按压 | `0.15s ease-out` | ~0.7 | 150ms |
| 视图切换 fading | `0.16s ease-out` | ~0.78 | 160ms |
| 抽屉滑入 | `0.3s cubic-bezier(0.16,1,0.3,1)` | ~0.78 | 300ms |
| 卡片 hover 上浮 | `0.3s ease-out` | ~0.8 | 300ms |
| 选中态反转 | `0.2s ease-out` | ~0.8 | 200ms |

---

## 十五、金色用量审计清单

金色**只能**出现在以下位置，其他一律黑白灰：

- [x] 品牌标识 `.brand-mark` / `.topbar-mark` — 背景
- [x] 侧边栏光标 `.sidebar-cursor` — 线色
- [x] 侧边栏选中分类标题 — AnimatedGradientText
- [x] 搜索框焦点光圈 — border + box-shadow
- [x] 搜索框光标 — caret-color
- [x] Docs-badge 小点 + 边框 + 文字
- [x] Section-rule 分隔线渐变头
- [x] 焦点行左边框 `.flat-row.focused`
- [x] 外部链接 hover `.flat-row-ext:hover`
- [x] 浏览全部 `.browse-all` / 返回 `.crumb-back`
- [x] 内联链接下划线 `.inline-link`
- [x] Roadmap chip hover
- [x] 卡片追踪光 `.resource-card::after`
- [x] 卡片 hover/focused 边框
- [x] 详情面板小标题 h3 / related-label
- [x] 详情主按钮 `.detail-primary-link`
- [x] Related hover 边框
- [x] Surprise button hover + svg
- [x] Updated tag
- [x] Pro-card 旋转边框 + 背景光晕 + pill
- [x] Meta-pending.meta-back
- [x] Landing SoftAurora / LiquidEther / GradientText
- [x] 点阵背景微粒（极淡暖金）

**不在清单上的 = 不用金色。**

---

## 十六、实施优先级

1. **CSS tokens** — 改 :root 变量，即刻全局生效 60%
2. **硬编码 teal rgba 值** — grep `45, 212, 191`，替换为对应金/白值
3. **硬编码 purple rgba 值** — grep `168, 85, 247` / `#a855f7` / `#d946ef` / `#c084fc`，替换
4. **React 组件颜色 props** — IntroductionHero + AnimatedGradientText
5. **选中态改黑白反转** — `.nav-item.active` / `.filter-bar button.active` / `.view-toggle button.active`
6. **Slide + Blur 过渡** — `.content-column.fading` + detail panel animation
7. **滚动进入动画** — IntersectionObserver + `.visible` class
8. **Landing 排版微调** — 签名时刻打磨
9. **验证** — /browse 截图对比前后

---

## 十七、设计原则总结

1. **墨色为骨，金光为灯** — 95% 黑白灰，5% 暖金作为光源
2. **金是光不是漆** — 金色从光源位置发出（brand mark、cursor、搜索焦点），照亮周围
3. **选中即翻转** — 选中态=黑白反转，未选中=灰底/透明底+白字
4. **同色系阴影** — 阴影色与背景同族，光晕消失但浮起感保留
5. **同温色族** — 所有语义色（curated 橄榄绿、pending 琥珀灰、金）同暖色温，不引入冷色
6. **五态完整** — Default/Hover/Press/Focus/Disabled 每个状态有明确反馈
7. **Slide+Blur 过渡** — offset + blur + opacity 三参数联动，不是简单 alpha
8. **一个签名时刻** — Landing hero 的暗琥珀余晖 + 金白标题，其余页面安静
9. **金要老不要新** — 哑光黄铜 #c8a96e，不用亮金 #FFD700
10. **暖黑底** — 所有黑色微量暖偏移（#0a0a0a 而非 #0a0c10），背景微暖所有灰自动拉暖
11. **琥珀玻璃** — backdrop-filter 层背景 rgba(12,10,8,...) 而非纯冷黑
12. **微暖点阵** — 点阵微粒 rgba(200,169,110,0.025)，整体从冷黑变暖黑
13. **发光仅在光源** — 只有 brand-mark 小点和 gold-glow 允许 box-shadow 发光，其余去发光
