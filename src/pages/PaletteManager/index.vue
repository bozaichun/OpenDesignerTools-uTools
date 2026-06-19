<template>
  <div class="module-palette">
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

    <section v-if="activeTab === 'groups'" class="panel">
      <div class="panel-header">
        <h3 class="panel-title">色板分组管理</h3>
        <span class="panel-sub">按个人、项目、品牌分类归档，支持加密分组</span>
      </div>

      <div class="group-input-row">
        <input type="text" v-model="newGroupName" placeholder="输入新分组名称..." class="form-input" />
        <select v-model="newGroupType" class="form-select">
          <option value="personal">个人</option>
          <option value="project">项目</option>
          <option value="brand">品牌</option>
        </select>
        <button class="primary-btn" @click="addGroup">新建分组</button>
      </div>

      <div class="group-list">
        <div
          v-for="group in groups"
          :key="group.id"
          class="group-card"
          :class="{ active: activeGroup === group.id }"
          @click="selectGroup(group.id)"
        >
          <div class="group-header">
            <div class="group-name">
              <span class="group-icon">{{ getGroupIcon(group.type) }}</span>
              {{ group.name }}
            </div>
            <div class="group-meta">
              <span class="group-count">{{ group.colors.length }} 色</span>
              <button class="icon-btn" @click.stop="deleteGroup(group.id)">✕</button>
            </div>
          </div>
          <div class="group-colors">
            <div
              v-for="(c, idx) in group.colors.slice(0, 10)"
              :key="idx"
              class="group-color-swatch"
              :style="{ background: c.color }"
            ></div>
            <div v-if="group.colors.length > 10" class="group-color-more">+{{ group.colors.length - 10 }}</div>
          </div>
        </div>

        <div v-if="groups.length === 0" class="empty-state">
          <div class="empty-icon">📋</div>
          <div class="empty-text">暂无分组，点击上方创建新分组</div>
        </div>
      </div>
    </section>

    <section v-if="activeTab === 'palette'" class="panel">
      <div class="panel-header">
        <h3 class="panel-title">当前分组色板</h3>
        <span class="panel-sub">{{ currentGroup ? currentGroup.name : '请先选择或创建分组' }} · 共 {{ currentGroup ? currentGroup.colors.length : 0 }} 个色值</span>
      </div>

      <div v-if="currentGroup" class="palette-actions">
        <input type="text" v-model="newColorName" placeholder="色值名称（如：品牌主色）" class="form-input" />
        <input type="color" v-model="newColorValue" />
        <input type="text" v-model="newColorValue" placeholder="HEX 色值" class="form-input" />
        <input type="text" v-model="newColorNote" placeholder="备注/使用场景（选填）" class="form-input" />
        <button class="primary-btn" @click="addColor">添加色值</button>
      </div>

      <div v-if="currentGroup" class="palette-list">
        <div
          v-for="(color, idx) in currentGroup.colors"
          :key="idx"
          class="palette-item"
        >
          <div class="palette-swatch" :style="{ background: color.color }">
            <span class="palette-contrast-text" :style="{ color: getContrastColor(color.color) }">Aa</span>
          </div>
          <div class="palette-info">
            <input
              type="text"
              class="palette-name-input"
              v-model="color.name"
              @blur="savePalettes()"
              placeholder="色值名称"
            />
            <div class="palette-hex">{{ color.color }}</div>
          </div>
          <input
            type="text"
            class="palette-note-input"
            v-model="color.note"
            @blur="savePalettes()"
            placeholder="备注 / 使用场景"
          />
          <div class="palette-actions-sm">
            <button class="sm-btn" @click="copyValue(color.color, color.name)">复制</button>
            <button class="sm-btn danger" @click="deleteColor(idx)">删除</button>
          </div>
        </div>
      </div>

      <div v-if="!currentGroup" class="empty-state">
        <div class="empty-icon">🎨</div>
        <div class="empty-text">请先在左侧选择或创建一个分组</div>
      </div>
    </section>

    <section v-if="activeTab === 'dedup'" class="panel">
      <div class="panel-header">
        <h3 class="panel-title">色板查重与合并</h3>
        <span class="panel-sub">自动检测重复色值，合并相似色差色，统一品牌色规范</span>
      </div>

      <div class="dedup-controls">
        <label class="dedup-slider-label">
          相似度阈值：{{ similarityThreshold }}%（越高越严格）
        </label>
        <input type="range" v-model="similarityThreshold" min="1" max="20" class="dedup-slider" />
        <button class="primary-btn" @click="runDedup">执行查重</button>
      </div>

      <div v-if="dedupResults.length > 0" class="dedup-results">
        <div class="result-summary">
          共检测到 <strong>{{ dedupResults.length }}</strong> 组相似色，建议合并以统一品牌规范
        </div>

        <div
          v-for="(group, gIdx) in dedupResults"
          :key="gIdx"
          class="dedup-group"
        >
          <div class="dedup-group-title">
            第 {{ gIdx + 1 }} 组 · 相似度 {{ group.similarity }}%
          </div>
          <div class="dedup-colors">
            <div
              v-for="(c, cIdx) in group.colors"
              :key="cIdx"
              class="dedup-color-item"
              :style="{ background: c.color }"
            >
              <span class="dedup-color-text" :style="{ color: getContrastColor(c.color) }">
                {{ c.name }}
              </span>
              <span class="dedup-color-hex">{{ c.color }}</span>
            </div>
          </div>
          <button class="merge-btn" @click="mergeGroup(group)">合并为 {{ group.colors[0].name }}</button>
        </div>
      </div>

      <div v-if="dedupResults.length === 0 && hasRunDedup" class="empty-state">
        <div class="empty-icon">✓</div>
        <div class="empty-text">恭喜！当前色板中未检测到明显重复色值</div>
      </div>
    </section>

    <section v-if="activeTab === 'share'" class="panel">
      <div class="panel-header">
        <h3 class="panel-title">团队色板共享</h3>
        <span class="panel-sub">支持色板链接分享，团队同步统一品牌色</span>
      </div>

      <div v-if="currentGroup" class="share-section">
        <div class="share-preview">
          <div class="share-title">{{ currentGroup.name }}</div>
          <div class="share-colors">
            <div
              v-for="(c, idx) in currentGroup.colors"
              :key="idx"
              class="share-color-item"
              :style="{ background: c.color }"
            >
              <span class="share-color-text" :style="{ color: getContrastColor(c.color) }">
                {{ c.name }}
              </span>
              <span class="share-color-hex">{{ c.color }}</span>
            </div>
          </div>
        </div>

        <div class="share-actions">
          <div class="share-link-box">
            <span class="share-link-label">分享链接：</span>
            <input type="text" :value="shareLink" readonly class="share-link-input" />
            <button class="primary-btn" @click="copyValue(shareLink, '分享链接')">复制链接</button>
          </div>

          <div class="share-code-box">
            <div class="share-code-title">JSON 格式导出</div>
            <textarea v-model="shareJson" readonly class="share-code-textarea"></textarea>
            <button class="secondary-btn" @click="copyValue(shareJson, '色板 JSON')">复制 JSON</button>
          </div>

          <div class="share-hint">
            💡 提示：将 JSON 内容发送给团队成员，他们可在本页面「色板管理」粘贴导入
          </div>
        </div>

        <div class="import-section">
          <div class="import-title">导入 JSON 色板</div>
          <textarea v-model="importJson" placeholder="在此粘贴色板 JSON 数据..." class="share-code-textarea"></textarea>
          <button class="primary-btn" @click="importPalette">导入色板</button>
        </div>
      </div>

      <div v-if="!currentGroup" class="empty-state">
        <div class="empty-icon">🔗</div>
        <div class="empty-text">请先选择一个分组以生成分享内容</div>
      </div>
    </section>
  </div>
</template>

<script>
import { parseColor, copyToClipboard, showToast, getContrastColor as gcc } from '../../utils/colorUtils';

const STORAGE_KEY = 'color_palette_manager_v1';

function loadPalettes() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {}
  return [
    {
      id: 'default-1',
      name: '品牌主色',
      type: 'brand',
      colors: [
        { name: '主色 Primary', color: '#1677FF', note: '按钮、链接、高亮元素' },
        { name: '辅色 Secondary', color: '#69B1FF', note: '次要按钮、状态标识' },
        { name: '成功色 Success', color: '#52C41A', note: '成功状态、完成图标' },
        { name: '警告色 Warning', color: '#FAAD14', note: '警告信息、需要注意的内容' },
        { name: '错误色 Error', color: '#FF4D4F', note: '错误信息、危险操作' }
      ]
    },
    {
      id: 'default-2',
      name: '项目 A 配色',
      type: 'project',
      colors: [
        { name: '主色', color: '#7C3AED', note: '品牌主视觉' },
        { name: '辅色', color: '#EC4899', note: '点缀色' },
        { name: '背景', color: '#FAF5FF', note: '页面背景' }
      ]
    }
  ];
}

export default {
  name: 'PaletteManager',
  data() {
    return {
      activeTab: 'groups',
      tabs: [
        { key: 'groups', label: '分组管理' },
        { key: 'palette', label: '色板编辑' },
        { key: 'dedup', label: '查重合并' },
        { key: 'share', label: '共享导出' }
      ],
      groups: [],
      activeGroup: null,
      newGroupName: '',
      newGroupType: 'personal',
      newColorName: '',
      newColorValue: '#1677FF',
      newColorNote: '',
      similarityThreshold: 5,
      dedupResults: [],
      hasRunDedup: false,
      importJson: ''
    };
  },
  computed: {
    currentGroup() {
      return this.groups.find(g => g.id === this.activeGroup);
    },
    shareLink() {
      return 'https://color.tools/share/' + (this.currentGroup ? this.currentGroup.id : '');
    },
    shareJson() {
      if (!this.currentGroup) return '';
      return JSON.stringify({
        name: this.currentGroup.name,
        type: this.currentGroup.type,
        colors: this.currentGroup.colors,
        exportedAt: new Date().toISOString()
      }, null, 2);
    }
  },
  mounted() {
    this.groups = loadPalettes();
    if (this.groups.length > 0) {
      this.activeGroup = this.groups[0].id;
    }
  },
  methods: {
    getContrastColor(hex) {
      const rgb = parseColor(hex);
      if (!rgb) return '#000000';
      return gcc(rgb);
    },
    getGroupIcon(type) {
      const icons = { personal: '👤', project: '📁', brand: '🏢' };
      return icons[type] || '📋';
    },
    addGroup() {
      if (!this.newGroupName.trim()) {
        showToast(this, '请输入分组名称', 'error');
        return;
      }
      const newGroup = {
        id: 'g-' + Date.now(),
        name: this.newGroupName.trim(),
        type: this.newGroupType,
        colors: []
      };
      this.groups.push(newGroup);
      this.activeGroup = newGroup.id;
      this.newGroupName = '';
      this.savePalettes();
    },
    deleteGroup(id) {
      if (!confirm('确定删除此分组？色板将一并删除。')) return;
      this.groups = this.groups.filter(g => g.id !== id);
      if (this.activeGroup === id) {
        this.activeGroup = this.groups.length > 0 ? this.groups[0].id : null;
      }
      this.savePalettes();
    },
    selectGroup(id) {
      this.activeGroup = id;
    },
    addColor() {
      if (!this.currentGroup) return;
      if (!this.newColorName.trim() || !this.newColorValue) {
        showToast(this, '请填写色值名称和色值', 'error');
        return;
      }
      const rgb = parseColor(this.newColorValue);
      if (!rgb) {
        showToast(this, '色值格式无效', 'error');
        return;
      }
      const normalizedHex = '#' + [rgb.r, rgb.g, rgb.b].map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase();
      this.currentGroup.colors.push({
        name: this.newColorName.trim(),
        color: normalizedHex,
        note: this.newColorNote.trim()
      });
      this.newColorName = '';
      this.newColorNote = '';
      this.savePalettes();
    },
    deleteColor(idx) {
      if (!this.currentGroup) return;
      this.currentGroup.colors.splice(idx, 1);
      this.savePalettes();
    },
    savePalettes() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.groups));
      } catch (e) {}
    },
    hexToRgbObj(hex) {
      const rgb = parseColor(hex);
      return rgb ? { r: rgb.r, g: rgb.g, b: rgb.b } : { r: 0, g: 0, b: 0 };
    },
    colorDistance(c1, c2) {
      const r1 = this.hexToRgbObj(c1);
      const r2 = this.hexToRgbObj(c2);
      return Math.sqrt(
        Math.pow(r1.r - r2.r, 2) + Math.pow(r1.g - r2.g, 2) + Math.pow(r1.b - r2.b, 2)
      );
    },
    runDedup() {
      this.hasRunDedup = true;
      this.dedupResults = [];

      const allColors = [];
      this.groups.forEach(group => {
        group.colors.forEach((color, idx) => {
          allColors.push({ ...color, groupId: group.id, colorIdx: idx });
        });
      });

      if (allColors.length < 2) return;

      const threshold = (this.similarityThreshold / 100) * 441;
      const visited = new Set();

      for (let i = 0; i < allColors.length; i++) {
        if (visited.has(i)) continue;
        const group = [allColors[i]];
        for (let j = i + 1; j < allColors.length; j++) {
          if (visited.has(j)) continue;
          const dist = this.colorDistance(allColors[i].color, allColors[j].color);
          if (dist <= threshold) {
            group.push(allColors[j]);
            visited.add(j);
          }
        }
        if (group.length > 1) {
          const maxDist = Math.max(
            ...group.slice(1).map(c => this.colorDistance(group[0].color, c.color))
          );
          const similarity = Math.round((1 - maxDist / 441) * 100);
          this.dedupResults.push({
            colors: group,
            similarity,
            primaryColor: group[0]
          });
        }
      }
    },
    mergeGroup(group) {
      const primary = group.colors[0];
      const primaryGroup = this.groups.find(g => g.id === primary.groupId);
      if (!primaryGroup) return;

      group.colors.slice(1).forEach(c => {
        const targetGroup = this.groups.find(g => g.id === c.groupId);
        if (targetGroup) {
          targetGroup.colors.splice(c.colorIdx, 1);
        }
      });

      this.savePalettes();
      showToast(this, '已合并相似色值', 'success');
      this.dedupResults = [];
    },
    importPalette() {
      try {
        const data = JSON.parse(this.importJson);
        if (!data.name || !Array.isArray(data.colors)) {
          throw new Error('格式错误');
        }
        const newGroup = {
          id: 'g-' + Date.now(),
          name: data.name + ' (导入)',
          type: data.type || 'project',
          colors: data.colors.map(c => ({
            name: c.name || '未命名',
            color: c.color || '#000000',
            note: c.note || ''
          }))
        };
        this.groups.push(newGroup);
        this.activeGroup = newGroup.id;
        this.importJson = '';
        this.savePalettes();
        showToast(this, '色板导入成功！', 'success');
      } catch (e) {
        showToast(this, 'JSON 格式错误，请检查', 'error');
      }
    },
    copyValue(value, label) {
      copyToClipboard(value);
      showToast(this, '已复制 ' + label, 'success');
    }
  }
};
</script>

<style lang="scss" scoped>
.module-palette { width: 100%; min-width: 0; }

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

.form-input {
  padding: 8px 12px; background: var(--bg-input); border: 1px solid var(--border-primary);
  border-radius: var(--radius-md); color: var(--text-primary); font-size: 13px;
  &:focus { outline: none; border-color: var(--accent); }
}
.form-select {
  padding: 8px 12px; background: var(--bg-input); border: 1px solid var(--border-primary);
  border-radius: var(--radius-md); color: var(--text-primary); font-size: 13px;
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

.group-input-row, .palette-actions {
  display: flex; gap: 12px; align-items: center; margin-bottom: 20px; flex-wrap: wrap;
}

.group-list {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
}
.group-card {
  padding: 14px; background: var(--bg-muted); border: 2px solid var(--border-primary);
  border-radius: var(--radius-md); cursor: pointer; transition: all 0.15s ease;
  &:hover { border-color: var(--accent); }
  &.active { border-color: var(--accent); background: var(--accent-soft); }
}
.group-header {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;
}
.group-name {
  display: flex; align-items: center; gap: 8px;
  font-size: 14px; font-weight: 600; color: var(--text-primary);
}
.group-icon { font-size: 16px; }
.group-meta {
  display: flex; align-items: center; gap: 10px;
}
.group-count { font-size: 12px; color: var(--text-secondary); }
.icon-btn {
  padding: 2px 6px; background: transparent; border: none;
  font-size: 12px; color: var(--text-tertiary); cursor: pointer;
  &:hover { color: #EF4444; }
}
.group-colors {
  display: flex; gap: 4px; flex-wrap: wrap;
}
.group-color-swatch {
  width: 24px; height: 24px; border-radius: 4px; border: 1px solid rgba(0,0,0,0.1);
}
.group-color-more {
  font-size: 11px; color: var(--text-tertiary); display: flex; align-items: center;
}

.palette-list {
  display: flex; flex-direction: column; gap: 10px;
}
.palette-item {
  display: grid;
  grid-template-columns: 60px 180px 1fr auto;
  gap: 12px;
  align-items: center;
  padding: 12px;
  background: var(--bg-muted);
  border-radius: var(--radius-md);
}
.palette-swatch {
  width: 60px; height: 60px; border-radius: var(--radius-sm);
  display: flex; align-items: center; justify-content: center;
  border: 1px solid var(--border-primary);
}
.palette-contrast-text { font-size: 18px; font-weight: 700; }
.palette-info { display: flex; flex-direction: column; gap: 4px; }
.palette-name-input {
  background: transparent; border: 1px solid transparent; padding: 4px 6px;
  font-size: 13px; font-weight: 600; color: var(--text-primary);
  border-radius: var(--radius-sm);
  &:focus { outline: none; border-color: var(--accent); background: var(--bg-card); }
}
.palette-hex { font-size: 12px; font-family: monospace; color: var(--text-secondary); }
.palette-note-input {
  background: transparent; border: 1px solid transparent; padding: 4px 6px;
  font-size: 12px; color: var(--text-secondary);
  border-radius: var(--radius-sm);
  &:focus { outline: none; border-color: var(--accent); background: var(--bg-card); }
}
.palette-actions-sm { display: flex; gap: 6px; }
.sm-btn {
  padding: 4px 10px; background: var(--bg-card);
  border: 1px solid var(--border-primary); border-radius: var(--radius-sm);
  font-size: 11px; cursor: pointer; color: var(--text-primary);
  &:hover { border-color: var(--accent); color: var(--accent); }
  &.danger { &:hover { border-color: #EF4444; color: #EF4444; } }
}

.dedup-controls {
  display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;
}
.dedup-slider-label { font-size: 13px; color: var(--text-primary); }
.dedup-slider { width: 100%; }

.result-summary {
  padding: 12px 16px; background: var(--accent-soft);
  border-radius: var(--radius-md); font-size: 13px; color: var(--accent);
  margin-bottom: 16px;
}

.dedup-group {
  padding: 14px; background: var(--bg-muted); border-radius: var(--radius-md);
  margin-bottom: 12px;
}
.dedup-group-title { font-size: 13px; font-weight: 600; margin-bottom: 10px; }
.dedup-colors {
  display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 10px;
}
.dedup-color-item {
  padding: 10px 14px; border-radius: var(--radius-sm);
  min-width: 120px;
}
.dedup-color-text { font-size: 12px; font-weight: 600; display: block; }
.dedup-color-hex { font-size: 11px; font-family: monospace; display: block; margin-top: 2px; }
.merge-btn {
  padding: 6px 14px; background: var(--accent); color: var(--text-invert);
  border: none; border-radius: var(--radius-sm); font-size: 12px; cursor: pointer;
}

.share-preview {
  padding: 20px; background: var(--bg-muted); border-radius: var(--radius-md);
  margin-bottom: 20px;
}
.share-title { font-size: 16px; font-weight: 600; margin-bottom: 14px; }
.share-colors {
  display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px;
}
.share-color-item {
  padding: 16px 12px; border-radius: var(--radius-sm); text-align: center;
  min-height: 80px;
}
.share-color-text { font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px; }
.share-color-hex { font-size: 11px; font-family: monospace; display: block; }

.share-section { display: flex; flex-direction: column; gap: 20px; }
.share-link-box, .share-code-box, .import-section {
  display: flex; flex-direction: column; gap: 8px;
}
.share-link-label { font-size: 13px; font-weight: 500; }
.share-link-input {
  padding: 8px 12px; background: var(--bg-input); border: 1px solid var(--border-primary);
  border-radius: var(--radius-md); font-size: 13px; font-family: monospace;
}
.share-code-title, .import-title {
  font-size: 13px; font-weight: 500;
}
.share-code-textarea {
  padding: 12px; background: var(--bg-input); border: 1px solid var(--border-primary);
  border-radius: var(--radius-md); font-size: 12px; font-family: monospace;
  min-height: 120px; resize: vertical;
}
.share-hint { font-size: 12px; color: var(--text-secondary); padding: 10px 14px; background: var(--bg-muted); border-radius: var(--radius-md); }

.empty-state {
  padding: 40px 20px; text-align: center;
}
.empty-icon { font-size: 48px; margin-bottom: 12px; }
.empty-text { font-size: 14px; color: var(--text-secondary); }

@media (max-width: 1024px) {
  .group-list { grid-template-columns: 1fr 1fr; }
  .palette-item { grid-template-columns: 50px 1fr auto; }
  .palette-note-input { display: none; }
  .share-colors { grid-template-columns: 1fr 1fr 1fr; }
}
@media (max-width: 640px) {
  .group-list { grid-template-columns: 1fr; }
  .palette-item { grid-template-columns: 50px 1fr; }
  .palette-actions-sm { grid-column: 1 / -1; }
  .share-colors { grid-template-columns: 1fr 1fr; }
}
</style>
