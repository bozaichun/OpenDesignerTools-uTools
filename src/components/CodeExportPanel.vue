<script lang="ts" setup>
import { ref, computed } from 'vue';
import { CODE_EXPORT_TABS, generateExportCode, getTabByKey, sanitizeFileName } from '../utils/codeGenerator';
import { copyToClipboard, showToast } from '../utils/colorUtils';

const props = defineProps({
  colors: {
    type: Array,
    default: () => []
  },
  exportName: {
    type: String,
    default: 'colors'
  }
});

const activeTab = ref('css');
const tabs = CODE_EXPORT_TABS;
const includeDarkMode = ref(true);
const includeOpacity = ref(false);
const useKebabCase = ref(true);

const currentTab = computed(() => getTabByKey(activeTab.value));

const generatedCode = computed(() => generateExportCode(props.colors, {
  includeDarkMode: includeDarkMode.value,
  useKebabCase: useKebabCase.value
}));

const currentCode = computed(() => generatedCode.value[activeTab.value] || '');

const handleCopy = () => {
  if (!currentCode.value) {
    showToast(null, '当前分组暂无色值，无法生成代码', 'error');
    return;
  }
  copyToClipboard(currentCode.value);
  showToast(null, '已复制 ' + currentTab.value.title, 'success');
};

const downloadByBrowser = (fileName) => {
  const blob = new Blob([currentCode.value], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
};

const handleExport = () => {
  if (!currentCode.value) {
    showToast(null, '当前分组暂无色值，无法导出代码', 'error');
    return;
  }
  const fileName = sanitizeFileName(props.exportName) + '.' + currentTab.value.ext;
  if (window.services?.writeCodeFile) {
    const filePath = window.services.writeCodeFile(currentCode.value, fileName);
    if (filePath && window.utools?.shellShowItemInFolder) {
      window.utools.shellShowItemInFolder(filePath);
    }
    showToast(null, '代码已导出到下载目录', 'success');
    return;
  }
  downloadByBrowser(fileName);
  showToast(null, '代码已导出', 'success');
};
</script>

<template>
  <div class="code-export-panel">
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

    <section class="panel">
      <div class="code-header">
        <h3 class="panel-title">{{ currentTab.title }}</h3>
        <div class="code-actions">
          <button class="secondary-btn" @click="handleExport">导出代码</button>
          <button class="primary-btn" @click="handleCopy">复制代码</button>
        </div>
      </div>
      <pre class="code-block"><code>{{ currentCode }}</code></pre>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.code-export-panel {
  width: 100%;
  min-width: 0;
}

.tab-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.tab-scroll {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  flex: 1 1 auto;
  min-width: 0;
}

.tab-btn {
  padding: 8px 16px;
  background: var(--bg-muted);
  color: var(--text-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.tab-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.tab-btn.active {
  background: var(--accent);
  color: var(--text-invert);
  border-color: var(--accent);
}

.options-row {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px dashed var(--border-primary);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text-primary);
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.panel {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: 20px;
}

.panel-title {
  font-size: 15px;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.code-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.primary-btn,
.secondary-btn {
  padding: 8px 18px;
  background: var(--accent);
  color: var(--text-invert);
  border: 1px solid var(--accent);
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.primary-btn:hover,
.secondary-btn:hover {
  opacity: 0.9;
}

.secondary-btn {
  background: var(--bg-card);
  color: var(--text-primary);
  border-color: var(--border-primary);
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
  max-height: 420px;
  overflow-y: auto;
}

.code-block code {
  white-space: pre;
  display: block;
}
</style>
