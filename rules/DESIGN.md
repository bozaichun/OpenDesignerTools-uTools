---
description: AI编码开发时，需要遵守的设计准则
globs: *
alwaysApply: true
---

<!-- !!!设计行为准则 -->

# OpenResumeTemplate · 界面设计规范（VibeCoding 参考）

> **用途**：本文件是智能体在本项目中编写 UI / Vue 组件时的**唯一设计规范来源**。  
> **视觉参考**：`rules/PreView/LightMode.html`（浅色）· `rules/PreView/DarkMode.html`（深色）  
> **源码对照**：样式 Token 以 `src/assets/styles/` 为准，全局组件以 `src/components/` 为准。

---

## 1. 设计定位

| 维度 | 说明 |
|------|------|
| 产品类型 | AI 大模型 B 端网页 UI 设计师作品集 |
| 视觉风格 | **晴空蓝 · 纯色 + 渐变色** — 理工 / 计算机 / 技术岗 · 少年感青春 |
| 浅色模式 | 晴空蓝日间风，背景 `#f0f9ff`，卡片白底 |
| 深色模式 | 星空蓝夜间风，背景 `#0a1628`，半透明卡片 + 网格背景 |
| 设计哲学 | 用户至上 · 简洁高效 · 美学追求 · 持续迭代 |

---

## 2. 主题与 CSS 架构

### 2.1 样式文件分层

```
src/assets/styles/
├── index.css              # 全局入口（body、container、grid-12）
├── ThemeVariable.css      # 品牌色 / 功能色 / 页面语义色（--theme-*）
├── SystemVariable.css     # 间距 / 字号 / 圆角 / 阴影 / 边框 Token
└── EyeProtectingColor.css # 护眼色（12 月节气色，禁止随意改动）
```

**引入顺序**（已在 `index.css` 中固定）：`ThemeVariable` → `SystemVariable` → `EyeProtectingColor`。

### 2.2 深浅色切换

- 根节点：`document.documentElement.classList.toggle('dark-mode', isDark)`
- 深色变量定义在 `ThemeVariable.css` 的 `html.dark-mode { ... }` 块内
- **编码规则**：页面/组件样式优先使用 `--theme-*` 语义变量，**禁止**硬编码浅色/深色两套色值

```vue
<!-- ✅ 正确 -->
<div class="card" style="background: var(--theme-card-bg); color: var(--theme-text-primary)">

<!-- ❌ 错误 -->
<div style="background: #ffffff">  <!-- 深色模式下会失效 -->
```

### 2.3 核心语义变量速查

| 类别 | 变量 | 用途 |
|------|------|------|
| 背景 | `--theme-bg` / `--theme-bg-elevated` / `--theme-bg-card` / `--theme-bg-muted` | 页面、浮层、卡片、弱化区 |
| 文本 | `--theme-text-primary` / `--secondary` / `--tertiary` | 标题、正文、辅助说明 |
| 边框 | `--theme-border` / `--theme-border-subtle` | 卡片边框、分隔线 |
| 强调 | `--theme-accent` / `--theme-accent-secondary` | 链接、高亮、图标 |
| 渐变 | `--theme-title-gradient` / `--theme-accent-gradient` / `--theme-cta-gradient` | 标题、按钮、装饰线 |
| 卡片 | `--theme-card-shadow` / `--theme-card-hover-border` / `--theme-card-hover-shadow` | 卡片默认与 hover |
| 导航 | `--theme-nav` / `--theme-nav-hover` / `--theme-nav-active` | 顶栏菜单 |
| RGB 复用 | `--primary-rgb` / `--secondary-rgb` | `rgba(var(--primary-rgb), 0.08)` 等半透明场景 |

---

## 3. 设计 Token 规范

### 3.1 品牌色与功能色

**品牌主色（晴空蓝）**

| Token | 浅色值 | 说明 |
|-------|--------|------|
| `--primary` | `#3b9eff` | 主色 |
| `--primary-hover` | `#6bb5ff` | 悬停 |
| `--primary-active` | `#1e88e5` | 激活 |
| `--primary-bg` | `#eff8ff` | 浅背景 |
| `--primary-border` | `#bae3ff` | 边框 |

**辅色（天青）**：`--secondary` `#67e8f9` · `--secondary-hover` · `--secondary-active` · `--secondary-bg` · `--secondary-border`

**功能色**：`--success` · `--warning` · `--info` · `--error`（各含 hover / active / bg / border）

**辅助色**：`--hover` · `--border` `#c8e6ff` · `--divider` `#e0f2fe` · `--bg` · `--white` · `--black`

**文本色（浅色背景）**：`--title` `#1d2129` · `--main-text` `#4e5969` · `--secondary-text` `#86909c` · `--disabled-text`

### 3.2 间距 Token（SystemVariable）

| Token | 值 | 场景 |
|-------|-----|------|
| `--size-line` | 0.5px | 边框线宽 |
| `--size-4` ~ `--size-48` | 4~48px | 强关联 → 单元间距 |
| `--size-100` | 100px | Pill 圆角 |
| `--spacing-xs` ~ `--spacing-xl` | 8~32px | 语义间距（映射 size） |

**常用映射**：元素间距 `--size-8` · 列间距 `--size-12` · 栏目 `--size-16` · 内容边距 `--size-20` · 模块 `--size-24` · 页面边距 `--size-40`

### 3.3 字号 Token

| Token | 值 | 场景 |
|-------|-----|------|
| `--fs-12` | 12px | 辅助文字、标签 |
| `--fs-14` | 14px | 正文（body 默认） |
| `--fs-16` | 16px | 小标题、卡片标题 |
| `--fs-18` | 18px | 中标题、模块标题 |
| `--fs-20` | 20px | 大标题 |
| `--fs-24` ~ `--fs-68` | 24~68px | 特大 / 展示标题 |
| `--font-size-xs` ~ `--font-size-xl` | 语义字号 | 映射 fs token |

**字体栈**（`index.css`）：

```css
font-family: "Inter", "思源黑体", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
```

**特殊字体**：Hero 姓名标题使用 `--font-hero-title`（小标宋，见 `src/assets/fonts/index.css`）

### 3.4 圆角

| Token | 值 |
|-------|-----|
| `--radius-sm` | 4px |
| `--radius-md` | 8px |
| `--radius-lg` | 12px |

### 3.5 阴影

| Token | 说明 |
|-------|------|
| `--shadow` | 基础阴影（卡片、弹窗） |
| `--shadow-top/bottom/left/right` | 方向投影 |
| `--theme-shadow-sm/md/lg` | 品牌色阴影（推荐用于卡片 hover、CTA） |

### 3.6 边框线

| Token | 值 |
|-------|-----|
| `--line` | `solid 0.5px var(--border)` |
| `--solid` | `solid 1px var(--border)` |
| `--dashed` | `dashed 2px var(--border)` |

### 3.7 图标尺寸

| Token | 值 | 场景 |
|-------|-----|------|
| `--wh-12` | 12px | 提示图标、角标 |
| `--wh-16` | 16px | 字体图标、行内图标 |
| `--wh-20` | 20px | 表格图标 |
| `--wh-24` | 24px | 卡片操作 |
| `--wh-32` | 32px | 主操作、FAB |

**图标字体**：`src/assets/iconfont/iconfont.css`，用法 `<i class="iconfont icon-XXX" />`

### 3.8 护眼色（只读）

12 组节气护眼色定义于 `EyeProtectingColor.css`（`--frostJan` ~ `--glowDec`），**禁止随意改动**。仅在需要护眼背景场景引用。

---

## 4. 布局与响应式

### 4.1 页面容器

```html
<div class="container">   <!-- max-width: 1920px; padding: 0 40px -->
<div class="grid-12">     <!-- 12 列网格，gap: 24px -->
```

主内容区（`App.vue`）：桌面 `padding: 32px 40px` · 平板/移动 `24px 16px`

### 4.2 断点（全项目统一）

| 名称 | 宽度 | 典型布局 |
|------|------|----------|
| 移动端 | ≤ 640px | 1 列 · 底部 Tabbar · 顶栏简化 |
| 平板 | 641 ~ 1024px | 2 列 · 抽屉导航 |
| 网页端 | 1025 ~ 1440px | 3 列 · 顶栏横向导航 |
| 大屏 | ≥ 1441px | 4 列 |

`CardLayout` 的 `cols="auto"` 遵循上述断点自动降级。

---

## 5. 全局基础组件

> 新增 UI 时**优先复用**以下组件，禁止重复实现相同视觉模式。

### 5.1 组件清单

| 组件 | 路径 | 用途 |
|------|------|------|
| `CardLayout` | `src/components/CardLayout.vue` | 响应式卡片网格（wrapper 模式带卡片壳） |
| `ProjectTitle` | `src/components/ProjectTitle.vue` | 一级 / 二级 / 竖线标题 |
| `ModuleTitle` | `src/components/ModuleTitle.vue` | 页面区域内分组标题（18px + 3D 阴影） |
| `Tooltip` | `src/components/Tooltip.vue` | 悬停文字提示 |
| `BackLink` | `src/components/BackLink.vue` | 返回列表链接（pill 按钮） |
| `BackToTop` | `src/components/BackToTop.vue` | 返回顶部 FAB |
| `WorkFlow` | `src/components/WorkFlow.vue` | 工作经历时间线 |
| `WeChatQROverlay` | `src/components/WeChatQROverlay.vue` | 微信公众号二维码弹层 |

### 5.2 布局组件

| 组件 | 路径 | 用途 |
|------|------|------|
| `Header` | `src/layout/Header/index.vue` | 顶栏 LOGO + 导航 + 主题切换 |
| `Footer` | `src/layout/Footer/index.vue` | 版权 + 版本号 + 备案 |
| `MobileTabbar` | `src/layout/Tabbar/MobileTabbar.vue` | 手机端底部导航 |

### 5.3 ProjectTitle 用法

```vue
<!-- 一级标题：页面主标题，26px 渐变居中 -->
<ProjectTitle title="页面标题" />

<!-- 二级标题：左对齐 + 渐变下划线 + 可选英文/序号 -->
<ProjectTitle title="模块名" mode="secondary" title-en="MODULE" :index="1" />

<!-- 竖线标题：左侧 3px 渐变竖线 -->
<ProjectTitle title="分组标题" mode="bar" />
```

### 5.4 CardLayout 用法

```vue
<CardLayout>                    <!-- auto 列 · gap 20 · padding 24 · radius 12 -->
  <MyCard v-for="item in list" />
</CardLayout>

<CardLayout :cols="3" :wrapper="false" :gap="16">  <!-- 仅网格，不包卡片壳 -->
  ...
</CardLayout>
```

### 5.5 卡片样式规范（wrapper 模式默认）

```scss
background: var(--theme-card-bg);
border: 1px solid var(--theme-card-border);
border-radius: var(--radius-lg);        // 默认 12px
backdrop-filter: blur(8px);
&:hover {
  border-color: var(--theme-card-hover-border);
  box-shadow: var(--theme-card-hover-shadow);
}
```

### 5.6 标签 / 徽章

```scss
.tag {
  padding: 2px 10px;
  font-size: var(--fs-12);
  border-radius: 999px;
  background: var(--theme-tag-bg);
  border: 1px solid var(--theme-tag-border);
  color: var(--theme-tag-text);
}
.badge {
  background: var(--theme-badge-bg);
  color: var(--theme-badge-text);
}
```

### 5.7 CTA 按钮

```scss
.btn-cta {
  padding: 10px 24px;
  border: none;
  border-radius: var(--radius-md);
  background: var(--theme-cta-gradient);
  color: #fff;
  box-shadow: var(--theme-cta-shadow);
  &:hover { box-shadow: var(--theme-cta-shadow-hover); }
}
.btn-accent {
  background: var(--theme-accent-btn-bg);
  border: 1px solid var(--theme-accent-btn-border);
  color: var(--theme-accent-btn-color);
}
```

### 5.8 导航项

```scss
.nav-item {
  color: var(--theme-nav);
  &:hover { color: var(--theme-nav-hover); background: var(--theme-nav-bg-hover); }
  &.active { color: var(--theme-nav-active); background: var(--theme-nav-bg-active); }
}
```

---

## 6. VibeCoding 编码规则

智能体在本项目中编写 UI 代码时，**必须**遵守以下规则：

### 6.1 必须做

1. **先读规范**：动手前阅读本文件 + 对应主题的 `rules/PreView/*.html`
2. **Token 优先**：颜色、间距、字号、圆角、阴影一律使用 CSS 变量，不写 magic number（除组件 props 允许的 gap/padding 覆盖）
3. **语义色**：使用 `--theme-*` 而非 `--primary` 直接写背景（功能色按钮除外）
4. **复用组件**：标题、卡片网格、返回链、Tooltip 等场景直接使用全局组件
5. **响应式**：遵循 §4.2 断点，移动端优先测试 ≤640px
6. **深浅色**：新组件必须在 Light / Dark 两种预览下均可读
7. **过渡动画**：背景/边框/颜色变化使用 `transition: ... 0.2s~0.3s ease`
8. **注释**：Vue 文件顶部保留 `业务说明` 块注释（与现有组件一致）
9. **SCSS scoped**：组件样式使用 `<style lang="scss" scoped>`
10. **无障碍**：交互元素加 `aria-label`；装饰元素 `aria-hidden="true"`

### 6.2 禁止做

1. 硬编码 `#ffffff` / `#0a1628` 等主题色（Tooltip 等已有例外除外）
2. 修改 `SystemVariable.css` / `EyeProtectingColor.css`（SystemVariable 由脚本生成）
3. 引入与项目风格冲突的第三方 UI 库组件
4. 自造与 `ProjectTitle` / `CardLayout` 等价的重复组件
5. 忽略 `dark-mode` 导致文字对比度不足
6. 在移动端使用 hover-only 才能触发的关键交互

### 6.3 新建页面 Checklist

- [ ] 使用 `ProjectTitle` 或 `ModuleTitle` 作为区块标题
- [ ] 列表/卡片区域使用 `CardLayout`
- [ ] 所有颜色来自 `--theme-*` / `--size-*` / `--fs-*`
- [ ] 在 `rules/PreView/LightMode.html` / `DarkMode.html` 中找到对应组件示例并对齐视觉
- [ ] 640 / 1024 断点布局正常
- [ ] 深色模式网格背景（`--theme-grid-opacity`）不遮挡内容

### 6.4 文件组织

```
rules/
├── DESIGN.md         # 界面设计规范（本文件）
└── PreView/          # VibeCoding 视觉参考 HTML

src/
├── components/       # 全局可复用组件
├── layout/           # Header / Footer / Tabbar
├── views/            # 页面（按路由分模块）
├── assets/styles/    # 设计 Token（勿手改 SystemVariable）
├── assets/iconfont/  # 图标字体
├── config/pageSet.ts # 页头/页脚/Tabbar 配置
└── data/             # JSON 业务数据
```

---

## 7. 数据与配置

- 设计规范展示页数据：`src/data/designSpec.json`（与 Token 对应，供 `/design-spec` 路由渲染）
- 页面级配置：`src/config/pageSet.ts`（导航、LOGO、备案、二维码等）
- 版本号：`version/build-version.json`（构建时自动递增）

---

## 8. 预览文件说明

| 文件 | 模式 | 说明 |
|------|------|------|
| `rules/PreView/LightMode.html` | 浅色 | 在浏览器打开即可查看 Token 与组件示例 |
| `rules/PreView/DarkMode.html` | 深色 | `<html class="dark-mode">` 激活深色变量 |

预览页引用项目真实 CSS（`../../src/assets/styles/index.css`），确保与线上一致。

---

*最后同步：项目源码 `src/assets/styles/` · `src/components/` · `src/data/designSpec.json`*
