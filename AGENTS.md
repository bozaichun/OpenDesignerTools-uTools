# AI 应用开发 · 指南（VibeCoding）

本文件为 **AI 辅助前端应用开发** 的全局约定，供智能体与开发者在 VibeCoding 场景下协作时使用。

**适用范围**：原生 HTML + CSS + JavaScript、Vue 2 / Vue 3、React 18+、Angular 12+ 等浏览器端技术栈。智能体须先识别**目标业务仓库**的实际框架与版本，再按对应章节执行；**以该仓库已定稿的实现方式为准**。

---

## 规范文件职责与选用场景

| 规范文件 | 职责 | 何时查阅 |
|---------|------|---------|
| `rules/CodeConduct.md` | AI 编码行为与变更心智（先问再做、最小 diff） | **任何编码任务开始前**；涉及范围判断、是否过度实现时 |
| `rules/CodingSpec.md` | 前端工程与代码规范（多框架差异、事件命名、性能、注释） | **编写或修改业务代码时**；需确认目录结构、命名、生命周期、自检项时 |
| `rules/DESIGN.md` | 界面设计规范（Token · 视觉 · 组件 · 布局模式） | **UI 布局、样式、组件视觉、主题、响应式**相关任务 |
| `rules/VariableFile/ThemeStyle.css` | 标准色板 + 语义主题 Token（深浅色唯一维护处） | **新增/修改颜色、主题变量、深浅色适配**时；禁止在组件内硬编码色值 |
| `rules/VariableFile/SystemStyle.css` | 间距、字号、图标尺寸、复合边框与阴影 | **调整间距、字号层级、阴影、边框线型**时 |
| `rules/VariableFile/ResetStyle.css` | 浏览器重置 + 根节点基础样式 | **全局 reset 或 html/body 基础行为**需变更时（慎改） |

**选用原则**

1. 行为与范围 → `CodeConduct.md`
2. 怎么写代码 → `CodingSpec.md`（按技术栈章节）
3. 长什么样 → `DESIGN.md` + VariableFile CSS
4. 色值与主题 → 只改 `ThemeStyle.css`；尺寸与排版 → `SystemStyle.css`
5. 三者（Conduct / CodingSpec / DESIGN）与 VariableFile 冲突时，以**目标业务仓库已定稿实现**为准

**开发者预览**（非运行时依赖）：`rules/PreView/LightMode.html` · `rules/PreView/DarkMode.html`

---

## 1. 框架识别与编码约定

执行任务前，先确认目标仓库的技术栈，再选用 `CodingSpec.md` 对应章节：

| 技术栈 | 识别信号 | 规范章节 |
|--------|---------|---------|
| 原生 HTML/CSS/JS | 无框架依赖、`index.html` 直引脚本 | §1.1 共性 · §4 样式 · §6 事件命名 |
| Vue 2 | `vue@2`、`Vue.extend` / Options API | CodingSpec §1.2 |
| Vue 3 | `vue@3`、`<script setup>`、`createApp` | CodingSpec §1.3 |
| React 18+ | `react`、`useState` / `useEffect` | CodingSpec §1.4 |
| Angular 12+ | `@Component`、`NgModule`、RxJS | CodingSpec §1.5 |

### 1.1 跨框架共性（摘自 CodingSpec）

- **语言**：TypeScript 优先；公共 API 须有明确类型。各仓库以自身为准；新增代码应跟随所在目录已有风格。
- **目录**：按业务域划分 `pages/`、`components/`、`utils/`；路由集中在 `router/`；避免路径魔法字符串散落。
- **事件命名**：
  - 业务处理函数：`handle` 前缀（`handleSubmit`、`handleOpenDialog`）
  - Vue 对外事件：kebab-case（`@color-copied`）
  - React 回调 prop：`onXxx` camelCase（`onSubmit`）
  - Angular：`@Output() submit = new EventEmitter()`
- **样式**：引用 CSS 变量 / Design Token，禁止在业务组件内硬编码整套色板；Vue 用 `scoped`，React 用 CSS Modules。
- **性能**：列表须提供稳定 `key` / `trackBy`；副作用在卸载时清理（`onUnmounted` / `useEffect cleanup` / `ngOnDestroy`）。
- **注释**：模板用 `<!-- 区块说明 -->`；关键业务逻辑用单行 `// 说明`（见 CodingSpec §13）。

---

## 2. 样式系统概览

涉及 **UI 布局、样式、组件视觉、主题色** 时，遵守 `rules/DESIGN.md`，Token 以 VariableFile 为准。

### 2.1 样式分层

| 层级 | 文件 | 内容 |
|------|------|------|
| 主题 Token | `ThemeStyle.css` | 标准色板（`--primary`、`--success` 等）+ 语义 Token（`--bg-*`、`--text-*`、`--accent*`）+ 深浅色 |
| 系统 Token | `SystemStyle.css` | `--size-*` 间距 · `--fs-*` 字号 · `--wh-*` 图标 · `--line` / `--shadow` 等复合变量 |
| 全局重置 | `ResetStyle.css` | 盒模型、`html`/`body` 基础（`background: var(--bg-primary)` · `color: var(--text-primary)`） |
| 应用补充 | 各仓库入口 CSS（如 `src/main.css`） | 仅放应用级补充，不重复定义 Token |
| 组件私有 | `<style scoped>` / CSS Modules | 引用变量，不写裸色值 |

**入口引入顺序**（参考）：ThemeStyle → SystemStyle → ResetStyle → 应用级 CSS。

### 2.2 深浅色机制（ThemeStyle.css）

| 模式 | 根节点行为 | 文本 Token |
|------|-----------|-----------|
| 浅色 | `:root` 或 `[data-theme="light"]` | `--title` · `--main-text` · `--secondary-text` · `--disabled-text` |
| 深色 | `[data-theme="dark"]` | 同上变量名，值为深色背景适配色 |
| 跟随系统 | 移除 `data-theme`，由 `@media (prefers-color-scheme: dark)` 覆盖 | 系统为 dark 时与深色列一致 |

语义别名（业务常用）：`--text-primary` → `var(--title)` · `--text-secondary` → `var(--main-text)` · `--text-tertiary` → `var(--secondary-text)`。

应用侧切换示例：`themeMode === 'system'` 时 `document.documentElement.removeAttribute('data-theme')`；否则 `setAttribute('data-theme', mode)`。

### 2.3 系统变量要点（SystemStyle.css）

| 类别 | 变量示例 | 用途 |
|------|---------|------|
| 间距 | `--size-8` · `--size-16` · `--size-24` · `--size-40` | 元素间距、边距、模块间距 |
| 字号 | `--fs-12` · `--fs-14` · `--fs-16` · `--fs-20` | 辅助文字、正文、小标题、大标题 |
| 图标 | `--wh-16` · `--wh-24` · `--wh-32` | 字体图标、操作按钮 |
| 边框/阴影 | `--line` · `--solid` · `--shadow` · `--shadow-bottom` | 引用 `var(--border)`，随主题切换 |

### 2.4 Token 扩展原则

1. **语义命名**：`--bg-card`、`--text-primary`，而非裸 `#ffffff`
2. **深浅色一体**：同一变量名在 light / dark 块中分别赋值
3. **文本优先用标准色板**：`--title` / `--main-text` 系列；语义层 `--text-*` 保持映射
4. **禁止硬编码**主题色值于业务组件

---

## 3. AI 编码行为规范

遵守 `rules/CodeConduct.md` 核心心智：

1. **先思考，再编码**：明确假设、列出解读、不确定时提问
2. **简洁优先**：最少代码解决问题，不做推测性工作
3. **精准修改**：只动必须动的部分，匹配已有风格
4. **目标驱动**：定义成功标准并验证

---

## 4. 各框架落地方式对照

> 在其他仓库（React / Angular / 原生）实现同类业务时，按 CodingSpec 对应章节转换下列模式，勿强行套用 Vue 语法。

| 场景 | Vue 3 | React 18+ | Angular 12+ | 原生 JS |
|------|-------|-----------|-------------|---------|
| 组件定义 | `<script setup>` SFC | 函数组件 + Hooks | `@Component` + 模板 | 函数 + DOM API |
| 路由 | `vue-router` Hash | React Router | `RouterModule` | History / Hash 手写 |
| 状态 | `ref` / `computed` | `useState` / `useMemo` | Service + RxJS | 模块级变量 + 事件 |
| 样式 | SCSS scoped | CSS Modules | 组件 SCSS | CSS 类名 + 变量 |
| 列表渲染 | `v-for` + `:key` | `.map()` + `key` | `*ngFor` + `trackBy` | `forEach` + 模板字符串 |

---

## 5. 业务注释规范（CodingSpec §13）

- **模板**：`<!-- 页头操作区 -->`、`<!-- 生成色卡预览弹框 -->`
- **Script 关键路径**：路由分发、持久化、跨模块协作
- **工具模块**：文件顶部分节说明职责
- **原则**：只注释「做什么 / 为什么」，不重复代码字面含义

---

## 6. 自检清单（提交前 · CodingSpec §12）

- [ ] 事件/回调命名符合框架约定
- [ ] 样式使用项目 Token，无违规硬编码
- [ ] 副作用与监听器已清理
- [ ] 列表渲染已提供稳定 key / trackBy
- [ ] 路由与配置路径无重复魔法字符串
- [ ] 页面模板关键区块已有分区注释
- [ ] 深浅色模式下 UI 均正常（可对照 `rules/PreView/` 预览页）

---

## 7. 开发与调试

| 场景 | 操作 |
|------|------|
| 本地开发 | `npm run dev` → http://localhost:5173 |
| 生产构建 | `npm run build` → `dist/` |
| Token 视觉预览 | 浏览器打开 `rules/PreView/LightMode.html` 或 `DarkMode.html` |
| uTools 调试 | 开发者工具 → 插件开发 → 加载项目目录 |

---

*最后同步：rules/DESIGN.md · rules/CodingSpec.md · rules/CodeConduct.md · rules/VariableFile/ · rules/PreView/*
