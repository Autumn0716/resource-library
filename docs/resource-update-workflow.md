# 资源更新工作流

> 本文档描述这个资源库如何**新增 / 修改 / 删除资源**，以及每一步背后的原因。
> 阅读对象：仓库维护者、投稿者、以及未来想改工作流的自己。

---

## 0. 一眼概览

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   数据源：src/data/resources.json  +  src/data/groups.json              │
│                              ↑                                          │
│                              │                                          │
│      ┌───────────────────────┼───────────────────────┐                  │
│      │                       │                       │                  │
│   路径 A                  路径 B                   路径 C                │
│   GitHub Issue            本地 CLI                 直接改 JSON           │
│   投稿（非技术）          （维护者日常）            （硬核，自负其责）    │
│      │                       │                       │                  │
│      │ approved 标签         │                       │                  │
│      ↓                       │                       │                  │
│   Action 自动生成 PR ────────┴───────→ PR ───────────┘                  │
│                                         ↓                               │
│                              你 Review → Merge                          │
│                                         ↓                               │
│                              Vercel 自动构建部署                         │
│                                         ↓                               │
│                              https://your-domain 上线                    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**一句话原则**：**任何资源变更最终都走 Git PR**，没有后台、没有数据库、没有运行时写入。这是 `bestofjs.org`、`awesome-*`、Claude / Codex / OpenCode 官方文档都在用的 Docs-as-Code 模式。

---

## 1. 为什么是这样的设计

决定这个工作流前对比过五种方案（见项目聊天记录），最终选"**Git-only + Issue 模板 + 自动 PR**"因为：

| 维度 | 为什么选它 |
|---|---|
| **数据量** | 目前 ~200 条，未来不会上万；JSON 文件足够 |
| **修改频率** | 偶尔新增，不是实时 CRUD 场景 |
| **可信度** | Git 历史 = 完整审计链，任何变更都能追溯到人 |
| **运维成本** | 零后端、零数据库、零登录系统；Vercel 免费档够用 |
| **投稿门槛** | 投稿人只要有 GitHub 账号、会填表单；零命令行知识 |
| **灾难恢复** | 丢了服务器不要紧，`git clone` 就能恢复全部内容 |

**反面：什么时候需要升级到前后端？**

- 需要多人同时编辑、实时看到别人改动
- 需要在移动端随手加资源且不想等构建
- 需要对资源做频繁（>每天多次）的数据更新

现在这三条都不成立，所以保持现状。

---

## 2. 三条投稿路径

### 路径 A — GitHub Issue（推荐给外部投稿人）

适合：没写过代码、没 clone 过仓库的人。

**操作步骤**

1. 打开仓库的 **Issues** → **New issue**
2. 选模板「**投稿新资源 / Submit a resource**」
3. 表单有 6 个字段，都按提示填（每个字段都有示例）：
   - 资源名字
   - 资源链接（`#` 表示占位）
   - 所属大分组（下拉选单，只能选现有分组）
   - 小类型标签（自由文本，会变成筛选 chip）
   - 使用场景（1-2 句）
   - 状态（`curated` / `pending`）
4. 提交。issue 会自动带上 `resource-submission` 标签
5. 等维护者审核

**审核结果**

- **通过**：维护者给 issue 加 `approved` 标签 → 触发 Action → 自动开 PR → 合并后上线 → issue 自动关闭
- **不通过**：维护者加 `rejected` 标签并留言说明原因。issue 保留做档案

### 路径 B — 本地 CLI（推荐给维护者自己）

适合：你自己想快速加一条，没必要过 Issue 流程。

**TUI 交互模式**

```bash
bun scripts/add-resource.ts
```

没有资源字段参数时会进入 Ink TUI。TUI 会逐字段提示你填，自动分配资源 id，校验 URL / 分组 / 重复，写入 JSON，并自动调 `fetch-favicons.ts` 抓图标。

键盘操作：

| 按键 | 作用 |
|---|---|
| `↑` / `↓` | 在选项里循环移动；第一项向上会跳到最后一项，最后一项向下会跳到第一项 |
| `Enter` | 确认当前选项或输入 |
| `Esc` | 返回上一步；在第一步退出 |
| `Cmd+X` / `Meta+X` | 清空当前输入框；终端不转发 Command 时可用 `Ctrl+X` 或 `Ctrl+U` |
| `Ctrl+C` | 取消并退出 |
| `E` / `e` | 在新分组 ID 预览页编辑自动生成的 id |

交互模式里的选项不是写死在脚本里：

- 分组选项实时来自 `src/data/groups.json`
- 类型选项只来自当前选中分组在 `src/data/resources.json` 里已有的 `type`
- 所有选项都会显示编号，便于确认当前选择
- 分组页最后一行是新分组标题的下划线输入框；停在这一行时可以直接输入新分组 title
- 类型页固定包含一个自定义类型输入行；光标停在这一行时，可以直接在下划线输入框里输入新类型
- 如果当前分组没有已有类型，类型页只显示自定义类型的下划线输入框
- 所有需要打字的字段都使用同一种下划线输入框，包括新分组标题、分组 ID 编辑、分组描述、资源名字、URL、用途和自定义类型
- 输入框只保留一层连续下划线；聚焦时末尾竖线光标会闪烁，输入内容会实时替换下划线区域
- 资源名字、URL、用途都是文本输入，不是固定选项
- 状态是固定选项：`curated` / `pending`
- TUI 颜色跟随网站主题：黑色文字、金色强调、灰色弱文本，以及 curated / pending 状态色

TUI 的字段顺序是：

```
分组 → 类型 → 资源名字 → URL → 用途 → 状态 → 最终预览
```

如果需要新增分组，在分组页移动到最后一行的下划线输入框，直接输入 title 并按 `Enter`。新分组会继续要求补充：

- `title`：分组中文标题，例如「服务与账号」
- `id`：脚本会从 title 自动生成，例如「服务与账号」→ `fu-wu-yu-zhang-hao`；可在预览页按 `E/e` 手动编辑
- `description`：分组说明，会显示在章节头部

最终预览页会显示即将写入的 `groups.json` / `resources.json` 内容。按 `Enter` 才会写入；按 `Esc` 返回状态选择。

**执行脚本不会自动 build。**新增资源后仍建议运行：

```bash
bun run build
```

确认 TypeScript 和 Vite 构建都通过，再 commit / push。

**批量模式**（命令行一行搞定）

```bash
bun scripts/add-resource.ts \
  --name   "Motion Primitives" \
  --url    "https://motion-primitives.com" \
  --group  "UI 工程基建" \
  --type   "动效库" \
  --use    "Copy-paste motion components built on framer-motion." \
  --status curated
```

**批量模式新增分组**

当 `--group` 是新分组时，必须同时传 `--group-id` 和 `--group-description`，避免把拼错的分组名误创建成新分组：

```bash
bun scripts/add-resource.ts \
  --name   "示例中转站 API" \
  --url    "https://example.com" \
  --group  "服务与账号" \
  --group-id "services-accounts" \
  --group-description "API 服务、账号平台、支付订阅和相关工具。" \
  --type   "中转站 API" \
  --use    "记录 API 中转服务入口，用于备用接入、测试模型调用或对比服务稳定性。" \
  --status pending
```

**其它标志**

| 标志 | 作用 |
|---|---|
| `--group-id` | 新增分组时必填；已有分组不要传 |
| `--group-description` | 新增分组时必填；已有分组不要传 |
| `--dry-run` | 只打印要写入的内容，不真写 |
| `--skip-favicon` | 不自动抓 favicon（譬如 CI 里跑，网络受限时） |
| `--help` | 显示帮助 + 列出所有现有分组 |

**然后**：`git commit` → `git push` → 开 PR（或者直接 push 到 main，视你的分支策略）。

批量模式主要用于自动化，例如 GitHub Action 从 approved issue 生成 PR。日常手动新增资源优先用 TUI。

### 路径 C — 直接改 JSON（应急 / 批量）

适合：一次要改 20 条；或者要调整字段；或者 CLI 对你来说多此一举。

1. 直接编辑 `src/data/resources.json` 或 `src/data/groups.json`（本地 CLI 已支持新增分组，优先用 CLI）
2. 新增的 id 要是当前最大 id + 1（或用任意独立字符串，但数字 id 是现行惯例）
3. `bun scripts/fetch-favicons.ts --only <新id>` 补图标
4. `bun run build` 本地验证一下 TS 类型 + Vite 构建没报错
5. commit + push + PR

**⚠️ 注意**：不要忘了：
- JSON 字段顺序不影响运行，但**保持和现有条目一致**便于 diff
- 增加新分组要同时编辑 `groups.json`（`id` / `title` / `description` 三个字段都必填）
- `title` 在 `groups.json` 和 `resources.json[].group` 之间必须**严格字符相等**（含中文）

---

## 3. 维护者日常操作

### 日常：审核一条投稿

```
GitHub → Issues 栏 → 点开带 resource-submission 标签的 issue
    ↓
检查：
  · 资源本身质量是否够格（这是主观判断，你说了算）
  · URL 是否可访问、不是恶意链接
  · 分组 / 类型 是否合适
  · 描述是否清晰（可以在评论里要求修改）
    ↓
  · 通过 → 加 approved 标签
  · 不通过 → 加 rejected 标签并评论原因
  · 需要补充 → 在评论里 @ 投稿人问清楚
```

### Action 触发后你能看到什么

加完 `approved` 标签 **1-2 分钟内**：

1. 仓库 Actions 栏会出现一个运行中的 workflow（名字 `Resource from issue → PR`）
2. 成功时：
   - 一个新 PR 会被创建，分支名 `resource/issue-<编号>`
   - issue 下会有一条 bot 评论：`Resource submission was batched as PR #N. It will close when merged.`
   - 你审核 PR → merge → Vercel 自动部署 → issue 自动关闭
3. 失败时：
   - Actions 里会看到红色 × 的 run
   - 点进去看 log，最常见的两类错：
     - 投稿人填的字段没过校验（比如 URL 无效、分组名不存在）
     - favicon 抓取网络失败（这类只会 warn，不会让 workflow 红）

### 如何撤销一个已上线的资源

```bash
# 本地
git pull
# 编辑 src/data/resources.json 删掉对应条目
git commit -am "revert: remove <resource-name>"
git push
```

或者在 GitHub 网页上直接编辑 `resources.json`，commit 到 main。Vercel 会重新部署。

---

## 4. 自动化流程细节（给未来改 Action 的自己看）

文件：`.github/workflows/resource-from-issue.yml`

### 触发条件

```yaml
on:
  issues:
    types: [labeled]
```

任何 issue 被打标签都会触发这个 workflow 的监听，但 job 里有 `if:` 过滤：

```yaml
if: >
  github.event.label.name == 'approved' &&
  contains(github.event.issue.labels.*.name, 'resource-submission')
```

所以只有**给 `resource-submission` 类 issue 加 `approved` 标签**才会真跑。打其他标签不会有任何反应（但 Actions 栏会看到一条被 skip 的 run，属正常）。

### 每步都做什么

| 步骤 | Action | 作用 |
|---|---|---|
| Checkout | `actions/checkout@v4` | clone 仓库代码 |
| Set up Bun | `oven-sh/setup-bun@v2` | 安装 Bun runtime |
| Install deps | `bun install --frozen-lockfile` | 装 node_modules |
| Parse issue form | `stefanbuck/github-issue-parser@v3` | 按 Issue Form 模板结构把 issue body 拆成字段变量 |
| Run add-resource CLI | 自己仓库的 `scripts/add-resource.ts` | 写 JSON + 抓 favicon |
| Create pull request | `peter-evans/create-pull-request@v7` | 把 working tree 的所有改动（JSON + 可能的 favicon 文件）打包开 PR |
| Comment on issue | `actions/github-script@v7` | 在 issue 下留言指向 PR |

### 依赖的三方 Actions

全部是业内长期主力项目，短期内不会消失：

- **oven-sh/setup-bun** — Bun 官方出品
- **stefanbuck/github-issue-parser** — v3 活跃维护，广泛用于同类场景
- **peter-evans/create-pull-request** — GitHub Actions 生态里最常用的 PR 自动化，v7 稳定
- **actions/github-script** — 官方出品

### Action 需要的权限

仓库 **Settings → Actions → General → Workflow permissions**：

- ✅ **Read and write permissions**（让 Action 能 push commit）
- ✅ **Allow GitHub Actions to create and approve pull requests**（让 Action 能开 PR）

这两项默认可能是关的，首次启用**必须手动勾**。

---

## 5. 数据结构说明

### `src/data/resources.json` — 资源主表

```json
[
  {
    "id": "0",
    "name": "humanizer",
    "url": "https://github.com/...",
    "group": "学术创作",
    "type": "写作",
    "use": "消除文本中人工智能生成的痕迹...",
    "status": "curated"
  },
  ...
]
```

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | string | 唯一标识。目前是递增数字字符串。不要改已有 id（会失去 favicon 关联） |
| `name` | string | 显示名 |
| `url` | string | 完整 URL 或 `#`（pending 状态的占位） |
| `group` | string | 分组 title，**必须**在 `groups.json` 里存在 |
| `type` | string | 筛选标签，自由文本 |
| `use` | string | 使用场景描述，1-2 句 |
| `status` | `"curated"` / `"pending"` | curated 会展示链接，pending 只显示路标 |

### `src/data/groups.json` — 分组定义

```json
[
  {
    "id": "academic",
    "title": "学术创作",
    "description": "论文写作、科研阅读、润色、翻译..."
  },
  ...
]
```

| 字段 | 说明 |
|---|---|
| `id` | 英文短串，URL-safe；没有对外展示用途，但保留做稳定 key |
| `title` | 中文名，用户可见，也是 `resources.json` 里 `group` 字段的 join key |
| `description` | 分组介绍，会显示在章节头部 |

### `src/data/resources.ts` — 薄包装层

```ts
import resourcesData from "./resources.json";
import groupsData from "./groups.json";

export type Resource = { ... };
export type ResourceGroup = { ... };

export const resources: Resource[] = resourcesData as Resource[];
export const resourceGroups: ResourceGroup[] = groupsData as ResourceGroup[];
```

**存在的唯一理由**：集中管理 TS 类型。不要往这里加数据。

### `public/icons/<id>.{png,ico,svg}` — 每条资源的 favicon

- `scripts/fetch-favicons.ts` 负责抓取
- 抓取策略：icon.horse → Google s2 → 直连 `<host>/favicon.ico` → 全失败时生成字母 SVG 兜底
- 文件名固定为 `<resource.id>.<ext>`，所以 **id 一旦分配不要改**

---

## 6. 常见问题 / 坑

### Q1. 投稿 issue 写错字段怎么办？

A: 让投稿人自己编辑 issue body 修正，然后再加 `approved`。Action 每次看到 `approved` 标签被加上都会跑（包括加了删、再加）。

### Q2. Action 生成的 PR 里 JSON 格式乱了

A: 可能是 `add-resource.ts` 处理中文引号或特殊字符有边角 case。本地用同样参数跑一遍 `--dry-run` 能复现。**不要手工在 PR 里修 JSON**，修好 `add-resource.ts` 再重跑。

### Q3. 同一个 issue 重复触发了两次 Action

A: 正常，说明 `approved` 标签被加了两次。第二次 run 会失败在"URL 重复"校验上，但第一次的 PR 还在，忽略就行。

### Q4. favicon 在 PR 里没抓到

A: Action 里网络不稳定是常见原因。PR 还是会被正常开出，只是没带新 icon。合并后本地可以跑：

```bash
bun scripts/fetch-favicons.ts --only <该资源id> --force
git commit -am "fix: fetch favicon for <id>"
git push
```

### Q5. 要新增一个大分组怎么办

A: Action 不支持。只能走路径 B 或 C：手工编辑 `groups.json` 加一条，然后才能投稿到那个分组。投稿模板的分组下拉列表**写死**了 9 个分组，新增分组后要同步改 `.github/ISSUE_TEMPLATE/add-resource.yml` 里的 dropdown options。

### Q6. 改了 resources.json 但构建报错

A: 99% 是 JSON 语法坏了（多逗号 / 缺引号 / 未转义的反斜杠）。快速定位：

```bash
bun -e 'JSON.parse(require("fs").readFileSync("src/data/resources.json","utf8"))'
```

报错会指明 `position X`，对照字符位置改。

---

## 7. 首次启用 checklist

把这个仓库推到 GitHub 之后，做一次（**不做 Action 不会跑**）：

- [ ] 仓库 **Settings → Actions → General → Workflow permissions**
  - [ ] 勾 `Read and write permissions`
  - [ ] 勾 `Allow GitHub Actions to create and approve pull requests`
- [ ] 仓库 **Issues → Labels** 创建：
  - [ ] `resource-submission`（绿色或蓝色都行）
  - [ ] `approved`（绿色）
  - [ ] `rejected`（红色）
- [ ] （可选）在 repo description 里加一句 "欢迎投稿"，并把本文件链接到 README
- [ ] 本地 test 一次：自己开一个 issue 投稿测试数据，给自己加 `approved` 标签，看 PR 是否正常生成。成功后把测试 PR 关掉、issue 删掉

---

## 8. 如果以后要改工作流

**最小伤害改动顺序**：

1. 先改 `CONTRIBUTING.md` / 本文档，让规则先说清楚
2. 再改 `.github/ISSUE_TEMPLATE/add-resource.yml`（投稿人看到的界面）
3. 最后改 `.github/workflows/resource-from-issue.yml`（自动化逻辑）和 `scripts/add-resource.ts`（CLI 逻辑）

**需要大改（比如加登录 / 加后台）时**，回顾第 1 节的"反面"条件。如果真的到了那个阶段，参考：

- [Sveltia CMS](https://github.com/sveltia/sveltia-cms) — 最小改动叠加一个 `/admin` 网页，依然走 Git
- [Keystatic](https://keystatic.com/) — React 原生 Git-based CMS，同样不需要数据库
- [Supabase](https://supabase.com) — 真要后端时的零运维首选

---

## 参考

- [bestofjs.org/about](https://bestofjs.org/about) — 2000 条精选项目、一个人维护、纯 JSON + Issue 投稿
- [Astro CMS 官方指南](https://docs.astro.build/en/guides/cms/) — 官方说法："你完全可以不用 CMS"
- [peter-evans/create-pull-request](https://github.com/peter-evans/create-pull-request) — 本工作流最核心的依赖
