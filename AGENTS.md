# 颜色值转换器 · Agent 指南

本文件为智能体在 **uTools 颜色值转换器** 插件项目中工作的全局约定。

---

## 项目概览

| 维度 | 说明 |
|------|------|
| 产品类型 | uTools 桌面插件（WebView 内嵌） |
| 产品功能 | HEX / RGB / CMYK 等多格式色值互转 · 图片取色 · 预设色查阅 · 色彩科普 |
| 技术栈 | **Vue 3** + **Vite** + **纯 JavaScript**（非 TS） |
| 构建配置 | `vite.config.js` · `base: './'`（相对路径部署） |
| 插件入口 | `index.html` → `src/main.js` → `src/App.vue` |
| 路由方式 | 通过 `window.utools.onPluginEnter` 获取 `code` 分发，不使用 vue-router |
| Node.js 能力 | `public/preload/services.js`（读/写文件等 Node.js 能力） |
| 深浅色模式 | 通过 `@media (prefers-color-scheme: light/dark)` 自动适配 |

---

## 规范文件职责

智能体在本项目中工作时，须遵守 `rules/` 目录下的三个规范文件：

| 规范文件 | 职责 |
|---------|------|
| `rules/CodeConduct.md` | AI 编码行为与变更心智（先问再做、最小 diff） |
| `rules/CodingSpec.md` | 前端工程与代码规范（框架差异、事件命名、性能） |
| `rules/DESIGN.md` | 界面设计规范（Token · 视觉 · 组件） |

三者同时适用时，以 **本项目已定稿的实现方式** 为准。

> ⚠️ **注意**：本项目不使用 TypeScript、不使用 SCSS、不使用 vue-router/Pinia/Redux。智能体应避免引入上述规范中描述但本项目未实际使用的技术。

---

## 1. 界面设计规范（VibeCoding）

涉及 **UI 布局、样式、组件视觉、主题色、间距、全局组件** 的任务时，智能体**必须**遵守 `rules/DESIGN.md` 的核心原则，但需结合本项目实际技术栈做以下调整：

### 1.1 本项目样式系统

本项目样式系统较为轻量，与 DESIGN.md 描述的完整 Token 架构不同：

| 特性 | 本项目现状 |
|------|-----------|
| CSS 变量 | 仅定义 `--blue`、`--light` 两个基础变量（见 `src/main.css`） |
| 深浅色切换 | 通过 `@media (prefers-color-scheme: light/dark)` 自动适配 |
| 样式预处理器 | **不使用 SCSS**，使用原生 CSS |
| 全局组件 | **无** `CardLayout`、`ProjectTitle` 等全局组件 |
| 图标字体 | **无** iconfont |
| 响应式断点 | 未显式定义，依赖 uTools 窗口尺寸自适应 |

### 1.2 当前样式速查（`src/main.css`）

```css
:root {
  --blue: rgb(88, 164, 246);
  --light: #fff;
}

/* 浅色背景：#f4f4f4 */
/* 深色背景：#303133，文字：#fff */

/* 按钮 */
/* button: 无边框 · --blue 背景 · --light 文字 · line-height 2.5 · opacity .2s 过渡 */
/* button:disabled: grayscale(1) · cursor not-allowed */
/* button:not(:disabled):active: opacity 0.6 */
```

### 1.3 设计 Token 扩展原则

若需扩展样式变量，遵循以下原则：

1. **语义命名优先**：如 `--color-primary`、`--bg-card`、`--text-primary`，而非 `--blue`、`--light`
2. **深浅色一体**：同一语义变量在 light/dark media 块中分别赋值
3. **样式文件**：在 `src/main.css` 中扩展，不新增多余 CSS 文件
4. **禁止硬编码**：新组件/页面中不要直接写 `#303133`、`#f4f4f4` 等魔法色值

### 1.4 视觉风格参考

| 类别 | 浅色 | 深色 |
|------|------|------|
| 背景 | `#f4f4f4` | `#303133` |
| 文字 | 浏览器默认黑色 | `#fff` |
| 滚动条轨道 | `#f4f4f4` | `#303133` |
| 滚动条滑块 | 浏览器默认 | `#666`（边框 `#303133`） |
| 按钮主色 | `rgb(88, 164, 246)` | 同浅色 |

> 💡 **建议**：如后续需要建立完整的设计系统，可参考 `rules/PreView/LightMode.html` 与 `DarkMode.html` 中的 Token 组织方式。

---

## 2. AI 编码行为规范

涉及 **是否执行任务、改动范围、方案选择** 时，智能体必须遵守 `rules/CodeConduct.md`。

核心心智摘要（详见 CodeConduct.md）：

1. **先思考，再编码**：明确假设、列出多种解读方式、提出更简单方案、不确定时主动提问
2. **简洁优先**：用最少的代码解决问题，不做推测性工作
3. **精准修改**：只动必须动的部分，遵循已有代码风格
4. **目标驱动执行**：定义成功标准，反复验证直到通过

### 2.1 本项目特定注意事项

- **不要引入 TypeScript**：本项目使用纯 JavaScript，`vite.config.js` 未配置 TS 支持
- **不要引入 SCSS**：本项目使用原生 CSS，样式统一在 `src/main.css` 或组件 `<style scoped>` 中
- **不要引入路由库**：路由由 `window.utools.onPluginEnter` 的 `code` 字段分发
- **不要引入状态管理库**：小插件项目，使用 Vue 3 原生 `ref/reactive` 即可
- **base 配置**：`vite.config.js` 中 `base: './'`，静态资源引用需兼容相对路径

---

## 3. 前端工程与代码规范

涉及 **Vue 组件编写、事件命名、性能与资源管理** 时，智能体必须遵守 `rules/CodingSpec.md` 中 **Vue 3 章节** 的内容，但需注意本项目与规范文档的以下差异：

### 3.1 技术栈差异

| 规范文档描述 | 本项目实际 |
|-------------|-----------|
| TypeScript 优先 | **纯 JavaScript** |
| `<script setup lang="ts">` | `<script setup>` 或 `<script setup lang="ts">`（无 TS 工具链支持） |
| Pinia / vuex@4 状态管理 | **无**，使用 Vue 3 原生 `ref/reactive` |
| vue-router@4 路由 | **无**，使用 `window.utools.onPluginEnter` 分发 |
| 多框架兼容（Vue/React/Angular） | **仅 Vue 3** |

### 3.2 Vue 3 组件约定

- **SFC 写法**：优先 `<script setup>`，组件文件命名 **PascalCase**
- **响应式**：`ref` 用于基础类型，`reactive` 用于对象；合理使用 `computed`
- **Props**：在 `<script setup>` 中使用 `defineProps`，建议显式声明 `type` / `required` / `default`
- **Emits**：使用 `defineEmits`，事件名 **kebab-case**
- **逻辑复用**：抽取工具函数到 `src/utils/`，或使用 composables（`useXxx.js`）
- **样式**：组件内使用 `<style scoped>`；全局样式在 `src/main.css`

### 3.3 uTools API 使用规范

本项目的核心特性依赖 uTools 插件 API，智能体需掌握以下要点：

#### 3.3.1 插件入口分发（见 `src/App.vue`）

```javascript
// 获取入口 code 分发到不同组件
window.utools.onPluginEnter((action) => {
  // action.code: 'color_convert_entry' | 'read' | 'write'
  // action.payload: 匹配指令时传入的数据（文件路径、图片数据等）
})

// 插件退出
window.utools.onPluginOut((isKill) => { ... })
```

#### 3.3.2 常用 uTools API

| API | 用途 |
|-----|------|
| `utools.onPluginEnter(callback)` | 监听插件进入，获取入口 code 与 payload |
| `utools.onPluginOut(callback)` | 监听插件退出 |
| `utools.copyText(text)` / `utools.copyImage(path)` | 复制到剪贴板 |
| `utools.hideMainWindow()` / `utools.showMainWindow()` | 控制主窗口显隐 |
| `utools.dbStorage.getItem(key)` / `setItem(key, value)` | 本地持久化存储 |
| `utools.shellShowItemInFolder(path)` | 在文件管理器中显示 |

#### 3.3.3 Node.js preload 能力（`public/preload/services.js`）

uTools preload 脚本运行在 Node.js 环境，可调用文件系统等能力。智能体在编写 preload 相关代码时：

- **仅在 preload 中** 使用 Node.js API（`require('fs')`、`require('path')` 等）
- **渲染进程** 通过 `window.utools` 暴露的方法与 preload 通信
- 新增 Node.js 能力时，在 `public/preload/services.js` 中实现，在 `public/plugin.json` 的 `preload` 字段保持一致

#### 3.3.4 plugin.json 配置

`public/plugin.json` 定义了插件元信息和功能入口（features），新增功能入口时须同步更新：

```json
{
  "code": "功能唯一标识",
  "explain": "功能说明",
  "cmds": ["匹配关键词1", "匹配关键词2"]
}
```

cmds 支持的 type：`regex`（正则）、`files`（文件）、`img`（图片）、`over`（拖拽到图标）、`window`（窗口匹配）等。

### 3.4 事件与函数命名

| 场景 | 约定 | 示例 |
|------|------|------|
| 业务处理函数 | 小驼峰 + `handle` 前缀 | `handleConvertColor`、`handlePickColor` |
| Vue emit 事件 | kebab-case | `@color-copied`、`@format-changed` |
| 工具函数 | 小驼峰，语义清晰 | `hexToRgb()`、`getContrastColor()` |
| 常量 | 全大写 + 下划线 | `COLOR_FORMATS`、`PRESET_PALETTES` |

### 3.5 目录与模块边界

本项目当前目录结构：

```
颜色值转换器/
├── src/
│   ├── App.vue              # 主入口 · utools code 分发
│   ├── main.js              # Vue createApp 入口
│   ├── main.css             # 全局样式（CSS 变量 + 深浅色）
│   ├── Hello/index.vue      # 颜色转换主功能
│   ├── Read/index.vue       # 读文件功能（Node.js 能力）
│   └── Write/index.vue      # 写文件功能（Node.js 能力）
├── public/
│   ├── plugin.json          # uTools 插件配置（features 定义）
│   ├── preload/services.js  # Node.js preload 脚本
│   └── logo.png             # 插件图标
├── rules/                   # AI 编码规范（本指南引用）
├── index.html               # HTML 入口
├── vite.config.js           # Vite 配置（base: './'）
└── package.json
```

新增功能时的目录约定：

- **功能组件**：按 feature code 建目录（如 `src/ColorConvert/`、`src/ImagePicker/`）
- **工具函数**：`src/utils/colorUtils.js`、`src/utils/clipboard.js` 等
- **常量**：`src/constants/colorFormats.js`、`src/constants/presets.js` 等
- **数据**：预设色板、色彩科普内容等放在 `src/data/`
- **样式**：`src/main.css` 放全局变量和重置，组件内 `<style scoped>` 放组件私有样式

### 3.6 样式规范

- **全局变量**：在 `src/main.css` 的 `:root` 中扩展语义化 CSS 变量
- **深浅色**：在 `@media (prefers-color-scheme: dark)` 块中为同一语义变量赋值
- **组件样式**：使用 `<style scoped>` 隔离，避免污染全局
- **过渡动画**：颜色/背景/透明度变化使用 `transition: property .2s ease`
- **禁止**：在业务组件中硬编码主题色值，应通过 CSS 变量引用

### 3.7 性能与资源管理

- **响应式合理使用**：颜色转换等纯计算逻辑优先用 `computed`，避免不必要的 `ref`
- **副作用清理**：`watch` 返回清理函数；`addEventListener` 配对 `removeEventListener`
- **图片取色**：注意 Canvas 跨域问题；大图片取色前可先缩放，避免阻塞主线程
- **剪贴板操作**：复制大量色值数据时考虑分批或提示用户

---

## 4. 自检清单（提交前）

- [ ] 代码为 **纯 JavaScript**，未引入 TypeScript 语法或依赖
- [ ] 样式为 **原生 CSS**，未使用 SCSS 语法
- [ ] 路由通过 `window.utools.onPluginEnter` 分发，未引入 vue-router
- [ ] 状态使用 Vue 3 `ref/reactive/computed`，未引入 Pinia/Redux
- [ ] 深浅色模式在 light/dark 下均正常显示
- [ ] Node.js 能力（读写文件等）仅在 `public/preload/` 中使用
- [ ] 新增 feature 已在 `public/plugin.json` 的 `features` 数组中注册
- [ ] Vite `base: './'` 兼容性：静态资源路径不依赖绝对路径
- [ ] 事件/函数命名符合约定（handleXxx / kebab-case emit）
- [ ] 样式通过 CSS 变量引用主题色，无硬编码色值

---

## 5. 开发与调试

| 场景 | 操作 |
|------|------|
| 本地开发 | `npm run dev`，Vite 默认 http://localhost:5173 |
| 生产构建 | `npm run build`，输出到 `dist/` 目录 |
| uTools 调试 | 在 uTools 开发者工具中「插件开发」加载项目目录 |
| 预加载调试 | `public/preload/services.js` 的 Node.js 日志在 uTools 开发者工具 Console 中查看 |

---

*最后同步：src/App.vue · src/main.js · src/main.css · public/plugin.json · public/preload/services.js · vite.config.js*
