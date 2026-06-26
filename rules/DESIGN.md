---
description: UI 布局、样式、组件视觉、主题与响应式相关任务时查阅（跨浏览器端技术栈 · VibeCoding）
globs:
  - "**/*.vue"
  - "**/*.scss"
  - "**/*.less"
  - "src/**/*.css"
  - "**/layout/**"
  - "**/components/**"
  - "**/pages/**"
alwaysApply: false
---

# 界面设计规范（VibeCoding）

> **用途**：智能体在目标业务仓库中编写 UI 时的**设计规范来源**。  
> **适用范围**：原生 HTML + CSS + JavaScript、Vue 2 / Vue 3、React 18+、Angular 12+ 等浏览器端技术栈。  
> **执行原则**：先识别目标仓库的实际框架与已定稿样式体系，再按对应章节落地；§3 以 **uTools 颜色值转换器** 为参考示例。

---

## 1. 设计定位（通用）

| 维度 | 说明 |
|------|------|
| 视觉风格 | 简洁工具风 · 语义化 Token · 卡片化布局 |
| 深浅色 | 浅色 / 深色 / 跟随系统，同一套语义变量双主题赋值 |
| 设计哲学 | 信息密度适中 · 内容可读优先 · 深浅色一致体验 |
| Token 原则 | 禁止在业务组件硬编码主题色；一律引用 CSS 变量 |

各仓库的具体色值、布局尺寸以 **Token 源码** 与 **预览 HTML** 为准，勿在规范中机械复制裸色值。

---

## 2. CSS 架构与 Token 体系

### 2.1 样式分层（跨框架）

```
rules/VariableFile/     # 设计 Token 与全局重置（推荐集中维护）
  ThemeStyle.css        # 主题色 / 语义变量 / 深浅色
  SystemStyle.css       # 间距 / 字号 / 阴影等系统变量
  ResetStyle.css        # 浏览器重置 + 根节点基础样式
src/ 或 app/            # 框架入口引入上述 CSS
layout/                 # 布局级样式
components/             # 可复用组件（scoped / CSS Modules）
pages/ 或 views/        # 页面级样式
```

| 技术栈 | 全局 CSS 引入方式 | 组件样式隔离 |
|--------|------------------|-------------|
| 原生 HTML/CSS/JS | `<link>` 或 `@import` 于 `index.html` | BEM / 页面级 `<style>` |
| Vue 2 / Vue 3 | 入口 `main.js` / `main.ts` 中 `import` | `<style scoped>` / SCSS scoped |
| React 18+ | `index.jsx` / `main.tsx` 中 `import` | CSS Modules / styled-components |
| Angular 12+ | `angular.json` `styles` 数组 | 组件 `styleUrls` + `:host` |

**禁止**在业务组件中硬编码 `#f4f4f4`、`#303133` 等魔法色；一律引用 CSS 变量。

### 2.2 深浅色切换（通用机制）

| 模式 | 根节点行为 | CSS 选择器 |
|------|-----------|-----------|
| 浅色 | `setAttribute('data-theme', 'light')` 或默认 | `:root` · `[data-theme="light"]` |
| 深色 | `setAttribute('data-theme', 'dark')` | `[data-theme="dark"]` |
| 跟随系统 | `removeAttribute('data-theme')` | `@media (prefers-color-scheme: dark)` 覆盖 `:root:not([data-theme="light"]):not([data-theme="dark"])` |

应用侧示例：`themeMode === 'system'` 时 `document.documentElement.removeAttribute('data-theme')`；否则 `setAttribute('data-theme', mode)`。

**编码规则**：使用 `--bg-*` / `--text-*` / `--accent*` 等语义变量，勿写裸 hex。

```html
<!-- ✅ 原生 HTML -->
<div class="panel" style="background: var(--bg-card); border: 1px solid var(--border-primary)"></div>
```

```vue
<!-- ✅ Vue -->
<div class="panel" :style="{ background: 'var(--bg-card)' }"></div>
```

```jsx
// ✅ React（内联或 CSS Modules 中引用 var）
<div className="panel" style={{ background: 'var(--bg-card)' }} />
```

```scss
// ✅ 任意框架的组件样式
.panel {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
}
```

### 2.3 Token 源码位置

| 文件 | 职责 |
|------|------|
| `rules/VariableFile/ThemeStyle.css` | **语义主题变量**（深浅色 Token 唯一维护处） |
| `rules/VariableFile/SystemStyle.css` | 间距、字号、图标尺寸、复合边框/阴影 |
| `rules/VariableFile/ResetStyle.css` | 全局重置、`html`/`body` 基础样式 |

参考项目入口引入顺序（`src/main.js`）：

```javascript
import "../rules/VariableFile/ThemeStyle.css";
import "../rules/VariableFile/SystemStyle.css";
import "../rules/VariableFile/ResetStyle.css";
import "./main.css";  // 应用级补充（如 #app）
```

扩展 Token 时：**语义色** 写入 `ThemeStyle.css` 的 light/dark 块；**尺寸/间距** 写入 `SystemStyle.css`；**重置规则** 仅在确有全局需求时改 `ResetStyle.css`。

### 2.4 核心语义变量索引

色值与深浅色赋值以 **`rules/VariableFile/ThemeStyle.css`** 为唯一源码；间距/字号/复合边框以 **`SystemStyle.css`** 为准。视觉对照在浏览器打开 **`rules/PreView/LightMode.html`** · **`DarkMode.html`**（勿将预览 HTML 全文载入 AI 上下文）。

下表仅列**变量名与用途**，不复制 hex。

#### 主题语义（ThemeStyle.css）

| 类别 | 变量 | 用途 |
|------|------|------|
| 背景 | `--bg-primary` · `--bg-card` · `--bg-muted` · `--bg-hover` · `--bg-input` | 页面底、卡片、弱化区、悬停、输入框 |
| 文本 | `--text-primary` · `--text-secondary` · `--text-tertiary` · `--text-invert` · `--text-error` | 标题/正文/辅助/反色/错误（映射 `--title` 等标准色板） |
| 边框 | `--border-primary` · `--border-strong` · `--border-focus` | 常规/强调/焦点边框 |
| 强调 | `--accent` · `--accent-hover` · `--accent-light` · `--accent-soft` | 主按钮与强调态 |
| 阴影/圆角/字体 | `--shadow-sm` · `--shadow-md` · `--shadow-lg` · `--radius-*` · `--font-stack` | 卡片阴影、圆角层级、字体栈 |

#### 系统尺寸（SystemStyle.css）

| 类别 | 变量示例 | 用途 |
|------|---------|------|
| 间距 | `--size-8` · `--size-16` · `--size-24` · `--size-40` | 元素/模块/页面边距 |
| 字号 | `--fs-12` · `--fs-14` · `--fs-16` · `--fs-20` | 辅助/正文/小标题/大标题 |
| 图标 | `--wh-16` · `--wh-24` · `--wh-32` | 图标与操作按钮尺寸 |
| 复合边框/阴影 | `--line` · `--solid` · `--shadow` · `--shadow-bottom` | 引用 `var(--border)`，随主题切换 |

色值等宽展示：`font-family: 'SF Mono', Consolas, Monaco, monospace`

---

## 3. 参考项目：颜色值转换器（Vue 3）

> **按需阅读**：本节路径与 API **仅适用于本仓库**。非 UI 任务、或其他业务仓库，**跳过 §3**；其他项目请抽取模式，勿照搬路径。

### 3.1 视觉参考

| 资源 | 说明 |
|------|------|
| `rules/PreView/LightMode.html` | 浅色预览 · `[data-theme="light"]` |
| `rules/PreView/DarkMode.html` | 深色预览 · `[data-theme="dark"]` |

预览页按与线上一致顺序引入 VariableFile CSS + `src/main.css`。

### 3.2 布局结构

```
┌──────────┬─────────────────────────────────────┐
│ Sidebar  │ Header（标题 + 页头操作 + 设置）      │
│ 导航     ├─────────────────────────────────────┤
│          │ ContentBody（页面内容 scroll）       │
└──────────┴─────────────────────────────────────┘
```

| 区域 | 路径 | 说明 |
|------|------|------|
| 侧栏 | `src/layout/Sidebar/` | 功能导航，宽 200px 左右，可收起 |
| 页头 | `src/layout/Header/` | 高 56px，`PageHeader` + `#actions` 插槽 |
| 内容 | `src/layout/ContentBody/` | `padding: 20px`，滚动容器 |

### 3.3 页头操作按钮（Header Actions · Vue 3）

页面通过 `inject: ['setHeaderActions', 'clearHeaderActions']` 注册右侧操作：

```javascript
const setHeaderActions = inject('setHeaderActions');
const clearHeaderActions = inject('clearHeaderActions');

function updateHeaderActions() {
  setHeaderActions([
    { label: '复制 CSS 代码', onClick: () => copyCss() },
    { label: '已收藏', onClick: () => {}, secondary: true },
    { label: '打印', icon: 'icon-Areality-PrintingTool', iconOnly: true, onClick: () => {} }
  ]);
}

onMounted(() => updateHeaderActions());
onUnmounted(() => clearHeaderActions());
```

样式定义于 `src/App.vue` 的 `.header-action-btn`：
- 默认：`background: var(--accent)`
- `secondary`：`background: var(--accent-soft)` · `color: var(--accent)` · `border-color: var(--accent-light)`

**约定**：页面级主操作优先放页头，避免堆在内容区底部。

### 3.4 响应式断点

| 宽度 | 典型调整 |
|------|----------|
| ≤ 640px | 侧栏抽屉 · 内容 padding 14px · 网格 1 列 |
| ≤ 1024px | 双列改单列 |
| > 1024px | 标准桌面布局 |

### 3.5 全局组件

| 组件 | 路径 | 用途 |
|------|------|------|
| `Banner` | `src/components/Banner.vue` | 页面顶部说明条 |
| `ColorPicker` | `src/components/ColorPicker.vue` | HEX 输入 + 原生取色 |
| `Dialog` | `src/components/Dialog.vue` | 弹窗 |
| `FavoriteButton` | `src/components/FavoriteButton.vue` | ☆/★ 收藏切换 |
| `ColorFormatDialog` | `src/components/ColorFormatDialog.vue` | 多格式色值弹窗 |
| `ModuleTitle` | `src/components/ModuleTitle.vue` | 区块标题 |
| `Input` / `Selector` | `src/components/` | 表单控件 |
| `Toast` | `src/components/Toast.vue` | 全局提示 |

---

## 4. 常用 UI 模式（跨框架 CSS）

### 4.1 面板卡片

```scss
.panel {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: 20px;
}
```

### 4.2 主 / 次按钮

```scss
.primary-btn {
  background: var(--accent);
  color: var(--text-invert);
  border: 1px solid var(--accent);
  border-radius: var(--radius-md);
}

.secondary-btn, .sm-btn {
  background: var(--bg-card);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
}
```

### 4.3 代码块

```scss
.code-block {
  background: #1e1e2e;  /* 固定深色代码底，深浅模式通用 */
  color: #cdd6f4;
  padding: 20px;
  border-radius: var(--radius-md);
  font-family: 'SF Mono', Consolas, Monaco, monospace;
}
```

### 4.4 过渡动效

交互态统一：`transition: ... 0.15s~0.2s ease`

---

## 5. 各框架样式落地对照

| 场景 | Vue 3（参考项目） | React 18+ | Angular 12+ | 原生 JS |
|------|-------------------|-----------|-------------|---------|
| 全局 Token | `main.js` import VariableFile | `main.tsx` import | `angular.json` styles | `<link>` in HTML |
| 组件样式 | SCSS scoped | CSS Modules | 组件 SCSS + `:host` | 页面 CSS / BEM |
| 主题切换 | `data-theme` on `<html>` | 同左 | 同左 | 同左 |
| 动态样式 | `:style` / class 绑定 | `style` / `className` | `[ngStyle]` / `[class]` | `element.style` / classList |

---

## 6. VibeCoding 编码规则

### 6.1 必须做

1. **Token 优先**：颜色、圆角、阴影使用 VariableFile 变量
2. **深浅色**：新组件在 light / dark 下均需可读
3. **过渡**：`transition: ... 0.15s~0.2s ease`
4. **组件样式隔离**：Vue scoped / React CSS Modules / Angular 组件样式，避免污染全局
5. **框架约定**：业务处理函数 `handle` 前缀；副作用在卸载时清理

### 6.2 禁止做

1. 硬编码主题色值（代码块固定深色底除外）
2. 在业务组件重复定义已在 VariableFile 中的 Token
3. 绕过已定稿的全局 CSS 架构私自引入第二套色板

### 6.3 新建页面 Checklist（参考项目）

- [ ] 区块标题用 `Banner` 或 `ModuleTitle`
- [ ] 主操作考虑页头 `setHeaderActions`，`onUnmounted` 时 `clearHeaderActions`
- [ ] 色值复制带 toast
- [ ] 收藏走 `favoriteStorage.js`
- [ ] 640px 断点布局正常
- [ ] light / dark 下 Token 对比度正常

---

*最后同步：`rules/VariableFile/` · `src/main.js` · `src/main.css` · `src/App.vue` · `AGENTS.md`*
