---
description: AI 编码开发时，需要遵守的界面设计准则（颜色值转换器 uTools 插件）
globs: *
alwaysApply: true
---

# 颜色值转换器 · 界面设计规范（VibeCoding 参考）

> **用途**：智能体在本项目中编写 UI / Vue 组件时的**设计规范来源**。  
> **视觉参考**：`rules/PreView/LightMode.html`（浅色）· `rules/PreView/DarkMode.html`（深色）  
> **Token 源码**：`src/main.css`（唯一全局 CSS 变量定义处）

---

## 1. 设计定位

| 维度 | 说明 |
|------|------|
| 产品类型 | uTools 桌面插件 · 颜色工具集 |
| 视觉风格 | 简洁工具风 · 蓝系强调色 · 卡片化布局 |
| 浅色模式 | 页面底 `#f4f4f4`，卡片白底，强调 `#3b82f6` |
| 深色模式 | 页面底 `#1a1a1a`，卡片 `#2d2d2d`，强调 `#60a5fa` |
| 设计哲学 | 信息密度适中 · 色值可读优先 · 深浅色一致体验 |

---

## 2. 主题与 CSS 架构

### 2.1 样式分层

```
src/main.css          # 全局 Token + 基础重置（唯一全局变量源）
src/App.vue           # 布局级样式（页头操作按钮等）
src/layout/           # Sidebar · Header · ContentBody
src/components/       # 可复用组件 scoped 样式
src/pages/**          # 页面 scoped 样式（可用 SCSS）
```

**禁止**在业务组件中硬编码 `#f4f4f4`、`#303133` 等魔法色；一律引用 CSS 变量。

### 2.2 深浅色切换

- 根节点：`document.documentElement.setAttribute('data-theme', 'light' | 'dark' | 'system')`
- 浅色：`:root` / `[data-theme="light"]`
- 深色：`[data-theme="dark"]` 或 `@media (prefers-color-scheme: dark)`（system 模式）
- **编码规则**：使用 `--bg-*` / `--text-*` / `--accent*` 语义变量

```vue
<!-- ✅ 正确 -->
<div class="panel" style="background: var(--bg-card); border: 1px solid var(--border-primary)">

<!-- ❌ 错误 -->
<div style="background: #ffffff">
```

### 2.3 核心语义变量（摘自 `src/main.css`）

#### 背景

| 变量 | 浅色 | 深色 | 用途 |
|------|------|------|------|
| `--bg-primary` | `#f4f4f4` | `#1a1a1a` | 应用底层 / 侧栏外背景 |
| `--bg-card` | `#ffffff` | `#2d2d2d` | 卡片、页头、内容区 |
| `--bg-muted` | `#f9f9f9` | `#383838` | 弱化区块、输入区底 |
| `--bg-hover` | `#eaeaea` | `#3f3f3f` | 悬停背景 |
| `--bg-input` | `#ffffff` | `#262626` | 输入框背景 |

#### 文本

| 变量 | 浅色 | 深色 | 用途 |
|------|------|------|------|
| `--text-primary` | `#1a1a1a` | `#f0f0f0` | 标题、主内容 |
| `--text-secondary` | `#555555` | `#b0b0b0` | 正文、说明 |
| `--text-tertiary` | `#888888` | `#777777` | 辅助、占位 |
| `--text-invert` | `#ffffff` | `#1a1a1a` | 强调色按钮文字 |
| `--text-error` | `#dc3545` | `#f87171` | 错误提示 |

#### 边框

| 变量 | 浅色 | 深色 |
|------|------|------|
| `--border-primary` | `#e0e0e0` | `#404040` |
| `--border-strong` | `#c0c0c0` | `#555555` |
| `--border-focus` | `#3b82f6` | `#60a5fa` |

#### 强调色

| 变量 | 浅色 | 深色 | 用途 |
|------|------|------|------|
| `--accent` | `#3b82f6` | `#60a5fa` | 主按钮、选中态、链接 |
| `--accent-hover` | `#2563eb` | `#93c5fd` | 悬停 |
| `--accent-light` | `#dbeafe` | `#1e3a5f` | 浅蓝边框 / 悬停加深 |
| `--accent-soft` | `#eff6ff` | `#1a2d4a` | 次要按钮浅蓝底（如「已收藏」） |

#### 阴影与圆角

| 变量 | 值 |
|------|-----|
| `--shadow-sm` | 轻阴影（卡片默认） |
| `--shadow-md` | 中等阴影（卡片 hover） |
| `--shadow-lg` | 大阴影（弹窗） |
| `--radius-sm` | `4px` |
| `--radius-md` | `8px` |
| `--radius-lg` | `12px` |
| `--radius-pill` | `999px` |

#### 字体

| 变量 | 说明 |
|------|------|
| `--font-stack` | 系统 UI 字体栈（PingFang SC / Microsoft YaHei 等） |
| body 默认 | `14px` · `line-height: 1.5` |

色值等宽展示：`font-family: 'SF Mono', Consolas, Monaco, monospace`

---

## 3. 布局结构

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

### 3.1 页头操作按钮（Header Actions）

页面通过 `inject: ['setHeaderActions', 'clearHeaderActions']` 注册右侧操作：

```javascript
// 主按钮（默认蓝底）
this.setHeaderActions([
  { label: '复制 CSS 代码', onClick: () => this.copyCss() }
]);

// 次要按钮（浅蓝底 accent-soft）
this.setHeaderActions([
  { label: '已收藏', onClick: () => {}, secondary: true }
]);

// 仅图标
this.setHeaderActions([
  { label: '打印', icon: 'icon-Areality-PrintingTool', iconOnly: true, onClick: () => {} }
]);
```

样式定义于 `src/App.vue` 的 `.header-action-btn`：
- 默认：`background: var(--accent)`
- `secondary`：`background: var(--accent-soft)` · `color: var(--accent)` · `border-color: var(--accent-light)`

**约定**：页面级主操作（复制代码、收藏、打印等）优先放页头，避免堆在内容区底部。

### 3.2 响应式断点（项目常用）

| 宽度 | 典型调整 |
|------|----------|
| ≤ 640px | 侧栏抽屉 · 内容 padding 14px · 网格 1 列 |
| ≤ 1024px | 双列改单列 |
| > 1024px | 标准桌面布局 |

---

## 4. 全局组件

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

布局：`Sidebar` · `Header` · `ContentBody` · `MainContent`

---

## 5. 常用 UI 模式

### 5.1 面板卡片

```scss
.panel {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: 20px;
}
```

### 5.2 主 / 次按钮

```scss
// 主按钮
.primary-btn {
  background: var(--accent);
  color: var(--text-invert);
  border: 1px solid var(--accent);
  border-radius: var(--radius-md);
}

// 次按钮 / 线框
.secondary-btn, .sm-btn {
  background: var(--bg-card);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
}
```

### 5.3 复制小图标

```html
<button class="copy-icon-btn" title="复制 HEX">
  <span class="iconfont icon-Copy"></span>
</button>
```

尺寸参考：16×16（紧凑行内）· 22×22（卡片内）· 28×28（收藏卡片操作栏）

### 5.4 代码块

```scss
.code-block {
  background: #1e1e2e;  /* 固定深色代码底，深浅模式通用 */
  color: #cdd6f4;
  padding: 20px;
  border-radius: var(--radius-md);
  font-family: 'SF Mono', Consolas, Monaco, monospace;
}
```

### 5.5 色块 + 居中 HEX（我的收藏等）

色块全宽，HEX 居中，文字色用 `getContrastColor()` 计算对比色。

---

## 6. VibeCoding 编码规则

### 6.1 必须做

1. **Token 优先**：颜色、圆角、阴影使用 `main.css` 变量
2. **页头操作**：适合放页头的业务按钮用 `setHeaderActions`，`unmounted` 时 `clearHeaderActions`
3. **深浅色**：新组件在 light / dark 下均需可读
4. **过渡**：`transition: ... 0.15s~0.2s ease`
5. **纯 JS**：不使用 TypeScript（见 AGENTS.md）
6. **组件样式**：`<style lang="scss" scoped>` 或 `<style scoped>`

### 6.2 禁止做

1. 硬编码主题色值（代码块深色底除外）
2. 引入 vue-router / Pinia / SCSS 全局新文件（Token 扩展写在 `main.css`）
3. 重复实现已有 `FavoriteButton`、 `ColorFormatDialog` 等

### 6.3 新建页面 Checklist

- [ ] 区块标题用 `Banner` 或 `ModuleTitle`
- [ ] 主操作考虑页头 `setHeaderActions`
- [ ] 色值复制带 toast：`已复制 #XXXXXX` 或 `已复制 LABEL: value`
- [ ] 收藏走 `favoriteStorage.js`
- [ ] 640px 断点布局正常

---

## 7. 预览文件

| 文件 | 模式 | 说明 |
|------|------|------|
| `rules/PreView/LightMode.html` | 浅色 | `[data-theme="light"]` |
| `rules/PreView/DarkMode.html` | 深色 | `[data-theme="dark"]` |

预览页引用 `../../src/main.css`，与线上一致。

---

*最后同步：`src/main.css` · `src/App.vue` · `src/layout/` · `src/components/`*
