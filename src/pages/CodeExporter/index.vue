<template>
  <div class="module-codeexport">
    <div class="tab-row">
      <div class="tab-scroll">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="tab-btn"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <section class="panel">
      <div class="panel-header">
        <h3 class="panel-title">代码颜色配置</h3>
        <span class="panel-sub">输入色值和名称，一键生成多语言代码片段</span>
      </div>

      <div class="color-input-section">
        <div
          v-for="(color, idx) in inputColors"
          :key="idx"
          class="color-input-row"
        >
          <input
            type="text"
            v-model="color.name"
            placeholder="变量名（如 primary）"
            class="form-input name-input"
          />
          <input
            type="color"
            v-model="color.color"
            class="color-picker"
          />
          <input
            type="text"
            v-model="color.color"
            placeholder="#FFFFFF"
            class="form-input hex-input"
          />
          <button
            v-if="inputColors.length > 1"
            class="sm-btn danger"
            @click="removeColor(idx)"
          >删除</button>
        </div>
        <button class="secondary-btn add-btn" @click="addColor">+ 添加色值</button>
      </div>

      <div class="options-row">
        <label class="checkbox-label">
          <input type="checkbox" v-model="includeDarkMode" />
          <span>包含深色模式适配</span>
        </label>
        <label class="checkbox-label">
          <input type="checkbox" v-model="includeOpacity" />
          <span>生成透明度变体（50/100）</span>
        </label>
        <label class="checkbox-label">
          <input type="checkbox" v-model="useKebabCase" />
          <span>使用 kebab-case 命名</span>
        </label>
      </div>
    </section>

    <section v-if="activeTab === 'css'" class="panel">
      <div class="code-header">
        <h3 class="panel-title">CSS Variables</h3>
        <button class="primary-btn" @click="copyValue(generatedCode.css, 'CSS 代码')">复制代码</button>
      </div>
      <pre class="code-block"><code>{{ generatedCode.css }}</code></pre>
    </section>

    <section v-if="activeTab === 'scss'" class="panel">
      <div class="code-header">
        <h3 class="panel-title">SCSS / Sass</h3>
        <button class="primary-btn" @click="copyValue(generatedCode.scss, 'SCSS 代码')">复制代码</button>
      </div>
      <pre class="code-block"><code>{{ generatedCode.scss }}</code></pre>
    </section>

    <section v-if="activeTab === 'less'" class="panel">
      <div class="code-header">
        <h3 class="panel-title">LESS</h3>
        <button class="primary-btn" @click="copyValue(generatedCode.less, 'LESS 代码')">复制代码</button>
      </div>
      <pre class="code-block"><code>{{ generatedCode.less }}</code></pre>
    </section>

    <section v-if="activeTab === 'tailwind'" class="panel">
      <div class="code-header">
        <h3 class="panel-title">Tailwind CSS (tailwind.config.js)</h3>
        <button class="primary-btn" @click="copyValue(generatedCode.tailwind, 'Tailwind 配置')">复制代码</button>
      </div>
      <pre class="code-block"><code>{{ generatedCode.tailwind }}</code></pre>
    </section>

    <section v-if="activeTab === 'flutter'" class="panel">
      <div class="code-header">
        <h3 class="panel-title">Flutter / Dart</h3>
        <button class="primary-btn" @click="copyValue(generatedCode.flutter, 'Flutter 代码')">复制代码</button>
      </div>
      <pre class="code-block"><code>{{ generatedCode.flutter }}</code></pre>
    </section>

    <section v-if="activeTab === 'wechat'" class="panel">
      <div class="code-header">
        <h3 class="panel-title">微信小程序 (WXSS / app.json)</h3>
        <button class="primary-btn" @click="copyValue(generatedCode.wechat, '小程序代码')">复制代码</button>
      </div>
      <pre class="code-block"><code>{{ generatedCode.wechat }}</code></pre>
    </section>

    <section v-if="activeTab === 'android'" class="panel">
      <div class="code-header">
        <h3 class="panel-title">Android (colors.xml)</h3>
        <button class="primary-btn" @click="copyValue(generatedCode.android, 'Android 代码')">复制代码</button>
      </div>
      <pre class="code-block"><code>{{ generatedCode.android }}</code></pre>
    </section>

    <section v-if="activeTab === 'ios'" class="panel">
      <div class="code-header">
        <h3 class="panel-title">iOS / Swift (UIColor)</h3>
        <button class="primary-btn" @click="copyValue(generatedCode.ios, 'iOS 代码')">复制代码</button>
      </div>
      <pre class="code-block"><code>{{ generatedCode.ios }}</code></pre>
    </section>

    <section v-if="activeTab === 'json'" class="panel">
      <div class="code-header">
        <h3 class="panel-title">JSON / Design Token</h3>
        <button class="primary-btn" @click="copyValue(generatedCode.json, 'JSON 数据')">复制代码</button>
      </div>
      <pre class="code-block"><code>{{ generatedCode.json }}</code></pre>
    </section>
  </div>
</template>

<script>
import { parseColor, copyToClipboard, showToast } from '../../utils/colorUtils';

function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

function toSnakeCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
}

function toCamelCase(str) {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '')
    .replace(/^(.)/, (c) => c.toLowerCase());
}

function toPascalCase(str) {
  const camel = toCamelCase(str);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

function hexToRgbaTuple(hex) {
  const rgb = parseColor(hex);
  if (!rgb) return { r: 0, g: 0, b: 0, a: 1 };
  return rgb;
}

export default {
  name: 'CodeExporter',
  data() {
    return {
      activeTab: 'css',
      tabs: [
        { key: 'css', label: 'CSS' },
        { key: 'scss', label: 'SCSS' },
        { key: 'less', label: 'LESS' },
        { key: 'tailwind', label: 'Tailwind' },
        { key: 'flutter', label: 'Flutter' },
        { key: 'wechat', label: '小程序' },
        { key: 'android', label: 'Android' },
        { key: 'ios', label: 'iOS' },
        { key: 'json', label: 'JSON' }
      ],
      inputColors: [
        { name: 'primary', color: '#1677FF' },
        { name: 'secondary', color: '#69B1FF' },
        { name: 'success', color: '#52C41A' },
        { name: 'warning', color: '#FAAD14' },
        { name: 'error', color: '#FF4D4F' },
        { name: 'textPrimary', color: '#1F2937' },
        { name: 'textSecondary', color: '#6B7280' },
        { name: 'background', color: '#F8FAFC' }
      ],
      includeDarkMode: true,
      includeOpacity: false,
      useKebabCase: true
    };
  },
  computed: {
    processedColors() {
      return this.inputColors.map(c => {
        const name = this.useKebabCase ? toKebabCase(c.name || 'color') : (c.name || 'color');
        return { ...c, normalizedName: name };
      });
    },
    generatedCode() {
      const colors = this.processedColors;
      const opacityLevels = this.includeOpacity ? [1, 0.5, 0.1] : [1];

      const generateCSS = () => {
        let css = ':root {\n';
        colors.forEach(c => {
          const rgb = hexToRgbaTuple(c.color);
          css += `  --color-${c.normalizedName}: ${c.color.toUpperCase()};\n`;
          css += `  --color-${c.normalizedName}-rgb: ${rgb.r} ${rgb.g} ${rgb.b};\n`;
        });
        css += '};\n\n';
        if (this.includeDarkMode) {
          css += '[data-theme="dark"] {\n';
          colors.forEach(c => {
            const rgb = hexToRgbaTuple(c.color);
            const inverted = this.invertForDark(rgb);
            css += `  --color-${c.normalizedName}: ${inverted};\n`;
          });
          css += '};\n';
        }
        return css;
      };

      const generateSCSS = () => {
        let scss = '// Color Variables\n';
        colors.forEach(c => {
          const name = this.useKebabCase ? c.normalizedName : toCamelCase(c.name || 'color');
          scss += `$color-${name}: ${c.color.toUpperCase()};\n`;
        });
        scss += '\n// Color Map\n$colors: (\n';
        colors.forEach((c, idx) => {
          const name = this.useKebabCase ? c.normalizedName : toCamelCase(c.name || 'color');
          scss += `  '${name}': ${c.color.toUpperCase()}${idx < colors.length - 1 ? ',' : ''}\n`;
        });
        scss += ');\n';
        return scss;
      };

      const generateLESS = () => {
        let less = '// Color Variables\n';
        colors.forEach(c => {
          const name = this.useKebabCase ? c.normalizedName : toCamelCase(c.name || 'color');
          less += `@color-${name}: ${c.color.toUpperCase()};\n`;
        });
        return less;
      };

      const generateTailwind = () => {
        let tw = '/** @type {import(\'tailwindcss\').Config} */\n';
        tw += 'module.exports = {\n';
        tw += '  theme: {\n';
        tw += '    extend: {\n';
        tw += '      colors: {\n';
        colors.forEach(c => {
          const name = this.useKebabCase ? c.normalizedName : toCamelCase(c.name || 'color');
          tw += `        '${name}': '${c.color.toUpperCase()}',\n`;
        });
        tw += '      },\n';
        tw += '    },\n';
        tw += '  },\n';
        tw += '};\n';
        return tw;
      };

      const generateFlutter = () => {
        let flutter = 'import \'package:flutter/material.dart\';\n\n';
        flutter += 'class AppColors {\n';
        flutter += '  AppColors._();\n\n';
        colors.forEach(c => {
          const name = toPascalCase(c.name || 'color');
          const rgb = hexToRgbaTuple(c.color);
          flutter += `  static const Color ${name} = Color(0xFF${rgb.r.toString(16).padStart(2, '0').toUpperCase()}${rgb.g.toString(16).padStart(2, '0').toUpperCase()}${rgb.b.toString(16).padStart(2, '0').toUpperCase()});\n`;
        });
        flutter += '}\n';
        return flutter;
      };

      const generateWechat = () => {
        let wx = '/* app.wxss - Global Color Variables */\n';
        colors.forEach(c => {
          wx += `--color-${c.normalizedName}: ${c.color.toUpperCase()};\n`;
        });
        wx += '\n/* Usage: color: var(--color-primary); */\n';
        return wx;
      };

      const generateAndroid = () => {
        let xml = '<?xml version="1.0" encoding="utf-8"?>\n';
        xml += '<resources>\n';
        colors.forEach(c => {
          const name = toSnakeCase(c.name || 'color');
          xml += `    <color name="${name}">${c.color.toUpperCase()}</color>\n`;
        });
        xml += '</resources>\n';
        return xml;
      };

      const generateiOS = () => {
        let swift = 'import UIKit\n\n';
        swift += 'extension UIColor {\n';
        swift += '    static let appColors = AppColors()\n';
        swift += '}\n\n';
        swift += 'struct AppColors {\n';
        colors.forEach(c => {
          const name = toCamelCase(c.name || 'color');
          const rgb = hexToRgbaTuple(c.color);
          swift += `    let ${name} = UIColor(red: ${(rgb.r / 255).toFixed(4)}, green: ${(rgb.g / 255).toFixed(4)}, blue: ${(rgb.b / 255).toFixed(4)}, alpha: 1.0)\n`;
        });
        swift += '}\n';
        return swift;
      };

      const generateJSON = () => {
        const tokenObj = {
          tokens: {
            colors: {}
          }
        };
        colors.forEach(c => {
          tokenObj.tokens.colors[c.normalizedName] = {
            value: c.color.toUpperCase(),
            type: 'color'
          };
        });
        return JSON.stringify(tokenObj, null, 2) + '\n';
      };

      return {
        css: generateCSS(),
        scss: generateSCSS(),
        less: generateLESS(),
        tailwind: generateTailwind(),
        flutter: generateFlutter(),
        wechat: generateWechat(),
        android: generateAndroid(),
        ios: generateiOS(),
        json: generateJSON()
      };
    }
  },
  methods: {
    addColor() {
      this.inputColors.push({ name: 'newColor', color: '#333333' });
    },
    removeColor(idx) {
      this.inputColors.splice(idx, 1);
    },
    invertForDark(rgb) {
      const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
      if (brightness > 200) {
        return `#${rgb.r.toString(16).padStart(2, '0')}${rgb.g.toString(16).padStart(2, '0')}${rgb.b.toString(16).padStart(2, '0')}`.toUpperCase();
      }
      const factor = 1 + (1 - brightness / 255) * 0.3;
      const r = Math.min(255, Math.round(rgb.r * factor));
      const g = Math.min(255, Math.round(rgb.g * factor));
      const b = Math.min(255, Math.round(rgb.b * factor));
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
    },
    copyValue(value, label) {
      copyToClipboard(value);
      showToast(this, '已复制 ' + label, 'success');
    }
  }
};
</script>

<style lang="scss" scoped>
.module-codeexport { width: 100%; min-width: 0; }

.tab-row {
  display: flex; align-items: center; gap: 8px; margin-bottom: 20px; flex-wrap: wrap;
}
.tab-scroll {
  display: flex; gap: 8px; flex-wrap: wrap; flex: 1 1 auto; min-width: 0;
}
.tab-btn {
  padding: 8px 16px; background: var(--bg-muted); color: var(--text-secondary);
  border: 1px solid var(--border-primary); border-radius: var(--radius-md);
  cursor: pointer; font-size: 13px; font-weight: 500; transition: all 0.15s ease;
  flex-shrink: 0;
  &:hover { background: var(--bg-hover); color: var(--text-primary); }
  &.active { background: var(--accent); color: var(--text-invert); border-color: var(--accent); }
}

.panel {
  background: var(--bg-card); border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg); padding: 20px; margin-bottom: 20px;
}
.panel-header { margin-bottom: 16px; }
.panel-title { font-size: 15px; font-weight: 600; margin: 0 0 4px 0; color: var(--text-primary); }
.panel-sub { font-size: 12px; color: var(--text-tertiary); }

.code-header {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;
}

.form-input {
  padding: 8px 12px; background: var(--bg-input); border: 1px solid var(--border-primary);
  border-radius: var(--radius-md); color: var(--text-primary); font-size: 13px;
  font-family: 'SF Mono', monospace;
  &:focus { outline: none; border-color: var(--accent); }
}

.color-picker {
  width: 40px; height: 36px; border: 1px solid var(--border-primary);
  border-radius: var(--radius-sm); padding: 2px; background: var(--bg-card); cursor: pointer;
}

.primary-btn, .secondary-btn {
  padding: 8px 18px; background: var(--accent); color: var(--text-invert);
  border: 1px solid var(--accent); border-radius: var(--radius-md);
  font-size: 13px; font-weight: 600; cursor: pointer;
  transition: all 0.15s ease;
  &:hover { opacity: 0.9; }
}
.secondary-btn {
  background: var(--bg-muted); color: var(--text-primary); border-color: var(--border-primary);
}

.sm-btn {
  padding: 6px 12px; background: var(--bg-card);
  border: 1px solid var(--border-primary); border-radius: var(--radius-sm);
  font-size: 12px; cursor: pointer; color: var(--text-primary);
  &:hover { border-color: var(--accent); color: var(--accent); }
  &.danger { &:hover { border-color: #EF4444; color: #EF4444; } }
}

.color-input-section {
  display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;
}
.color-input-row {
  display: grid;
  grid-template-columns: 180px 50px 150px auto;
  gap: 10px;
  align-items: center;
}
.name-input {}
.hex-input {}

.add-btn {
  align-self: flex-start;
}

.options-row {
  display: flex; gap: 20px; flex-wrap: wrap;
  padding-top: 16px; border-top: 1px dashed var(--border-primary);
}
.checkbox-label {
  display: flex; align-items: center; gap: 6px;
  font-size: 13px; color: var(--text-primary); cursor: pointer;
  input[type="checkbox"] {
    width: 16px; height: 16px; cursor: pointer;
  }
}

.code-block {
  background: #1e1e2e;
  color: #cdd6f4;
  padding: 20px;
  border-radius: var(--radius-md);
  font-family: 'SF Mono', 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  line-height: 1.6;
  overflow-x: auto;
  margin: 0;
  max-height: 500px;
  overflow-y: auto;

  code {
    white-space: pre;
    display: block;
  }
}

@media (max-width: 1024px) {
  .color-input-row {
    grid-template-columns: 1fr 50px 1fr auto;
  }
}
@media (max-width: 640px) {
  .color-input-row {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  .color-input-row > * { width: 100%; }
}
</style>
