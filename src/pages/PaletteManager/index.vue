<template>
  <div class="module-palette">
    <DataTable
        :data="paginatedGroups"
        :columns="tableColumns"
        :border="true"
        row-key="id"
        action-label="操作"
        action-width="420px"
        empty-text="暂无分组，点击右上角「新建分组」创建"
      >
        <template #name="{ row }">
          <div class="cell-group-name">
            <span class="group-icon">{{ getGroupIcon(row.type) }}</span>
            <span>{{ row.name }}</span>
          </div>
        </template>

        <template #type="{ row }">
          {{ getGroupTypeLabel(row.type) }}
        </template>

        <template #swatches="{ row }">
          <div class="group-colors">
            <div
              v-for="(c, idx) in row.colors.slice(0, 10)"
              :key="idx"
              class="group-color-swatch"
              :style="{ background: c.color }"
              :title="c.name"
            ></div>
            <span v-if="row.colors.length > 10" class="group-color-more">
              +{{ row.colors.length - 10 }}
            </span>
            <span v-if="row.colors.length === 0" class="group-color-empty">暂无色值</span>
          </div>
        </template>

        <template #count="{ row }">
          {{ row.colors.length }} 色
        </template>

        <template #action="{ row }">
          <div class="table-actions">
            <button class="link-btn" @click="openEditGroupDialog(row)">编辑</button>
            <button class="link-btn" @click="viewGroup(row)">查看</button>
            <button class="link-btn" @click="openDedupDialog(row)">查重</button>
            <button class="link-btn" @click="openShareDialog(row)">共享</button>
            <button class="link-btn" @click="openCodeExportDialog(row)">生成代码</button>
            <button class="link-btn danger" @click="openDeleteConfirm(row)">删除</button>
          </div>
        </template>
    </DataTable>

    <Pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="groups.length"
      mode="full"
    />

    <!-- 新建 / 修改分组 -->
    <Dialog
      v-model:visible="dialogNewGroup"
      :title="editingGroupId ? '编辑分组' : '新增分组'"
      max-width="480px"
    >
      <div class="dialog-form">
        <div class="form-field">
          <label class="form-label">分组类型</label>
          <select v-model="newGroupType" class="form-select">
            <option value="personal">个人</option>
            <option value="project">项目</option>
            <option value="brand">品牌</option>
          </select>
        </div>
        <div class="form-field">
          <label class="form-label">分组名称</label>
          <input
            type="text"
            v-model="newGroupName"
            :placeholder="editingGroupId ? '输入分组名称...' : '输入新分组名称...'"
            class="form-input"
            @keyup.enter="saveGroup"
          />
        </div>
        <div class="dialog-footer">
          <button class="secondary-btn" @click="closeGroupDialog">取消</button>
          <button class="primary-btn" @click="saveGroup">{{ editingGroupId ? '确认修改' : '确认创建' }}</button>
        </div>
      </div>
    </Dialog>

    <!-- 共享导出 -->
    <Dialog
      v-model:visible="dialogShare"
      title="团队色板共享"
      max-width="720px"
    >
      <div class="dialog-share">
        <p class="dialog-desc">支持色板链接分享，团队同步统一品牌色</p>

        <div v-if="shareTargetGroup" class="share-section">
          <div class="share-preview">
            <div class="share-title">{{ shareTargetGroup.name }}</div>
            <div class="share-colors">
              <div
                v-for="(c, idx) in shareTargetGroup.colors"
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

          <div class="share-link-box">
            <span class="share-link-label">分享链接：</span>
            <div class="share-link-row">
              <input type="text" :value="shareLink" readonly class="share-link-input" />
              <button class="primary-btn" @click="copyValue(shareLink, '分享链接')">复制链接</button>
            </div>
          </div>

          <div class="share-code-box">
            <div class="share-code-title">JSON 格式导出</div>
            <textarea :value="shareJson" readonly class="share-code-textarea"></textarea>
            <button class="secondary-btn" @click="copyValue(shareJson, '色板 JSON')">复制 JSON</button>
          </div>

          <div class="share-hint">
            提示：将 JSON 内容发送给团队成员，他们可在本页面「色板管理」粘贴导入
          </div>

          <div class="import-section">
            <div class="import-title">导入 JSON 色板</div>
            <textarea v-model="importJson" placeholder="在此粘贴色板 JSON 数据..." class="share-code-textarea"></textarea>
            <button class="primary-btn" @click="importPalette">导入色板</button>
          </div>
        </div>

        <div v-else class="empty-state">
          <div class="empty-text">暂无分组，请先创建分组</div>
        </div>
      </div>
    </Dialog>

    <!-- 查重合并 -->
    <Dialog
      v-model:visible="dialogDedup"
      title="色板查重与合并"
      max-width="640px"
    >
      <div class="dialog-dedup">
        <p class="dialog-desc">自动检测重复色值，合并相似色差色，统一品牌色规范</p>

        <div class="dedup-controls">
          <label class="dedup-slider-label">
            相似度阈值：{{ similarityThreshold }}%（越高越严格）
          </label>
          <input type="range" v-model.number="similarityThreshold" min="1" max="20" class="dedup-slider" />
          <button class="primary-btn full-width" @click="runDedup">执行查重</button>
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
      </div>
    </Dialog>

    <!-- 删除确认 -->
    <Dialog
      v-model:visible="dialogDeleteConfirm"
      title="删除分组"
      max-width="420px"
      :confirm-on-enter="true"
      @confirm="confirmDeleteGroup"
    >
      <div class="dialog-confirm">
        <p class="confirm-text">
          您是否删除「{{ deleteTargetName }}」分组，此过程不可撤销！
        </p>
        <div class="dialog-footer">
          <button class="secondary-btn" @click="dialogDeleteConfirm = false">取消</button>
          <button class="primary-btn danger-btn" @click="confirmDeleteGroup">确认删除</button>
        </div>
      </div>
    </Dialog>

    <!-- 生成代码 -->
    <Dialog
      v-model:visible="dialogCodeExport"
      :title="codeExportTitle"
      max-width="900px"
    >
      <div v-if="codeExportGroup" class="dialog-code-export">
        <p v-if="codeExportColors.length === 0" class="dialog-desc">
          该分组暂无色值，请先在分组中添加色值后再生成代码。
        </p>
        <CodeExportPanel
          v-else
          :colors="codeExportColors"
          :export-name="codeExportGroup.name"
        />
      </div>
    </Dialog>
  </div>
</template>

<script>
import DataTable from '../../components/Table.vue';
import Dialog from '../../components/Dialog.vue';
import Pagination from '../../components/Pagination.vue';
import CodeExportPanel from '../../components/CodeExportPanel.vue';
import { parseColor, copyToClipboard, showToast, getContrastColor as gcc } from '../../utils/colorUtils';
import { loadPalettes, savePalettes } from './paletteStorage.js';

export default {
  name: 'PaletteManager',
  components: {
    DataTable,
    Dialog,
    Pagination,
    CodeExportPanel
  },
  inject: ['setHeaderActions', 'clearHeaderActions'],
  data() {
    return {
      groups: [],
      activeGroup: null,
      currentPage: 1,
      pageSize: 10,
      tableColumns: [
        { prop: 'name', label: '分组名称', slot: 'name', width: '180px' },
        { prop: 'type', label: '分组类型', slot: 'type', width: '100px' },
        { prop: 'swatches', label: '色值预览', slot: 'swatches' },
        { prop: 'count', label: '色值数量', slot: 'count', width: '90px', align: 'center' }
      ],
      dialogNewGroup: false,
      editingGroupId: null,
      dialogShare: false,
      shareGroupId: null,
      dialogDedup: false,
      dialogDeleteConfirm: false,
      dialogCodeExport: false,
      codeExportGroupId: null,
      newGroupName: '',
      newGroupType: 'personal',
      deleteTargetId: null,
      deleteTargetName: '',
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
    shareTargetGroup() {
      if (!this.shareGroupId) return null;
      return this.groups.find((group) => group.id === this.shareGroupId) || null;
    },
    codeExportGroup() {
      if (!this.codeExportGroupId) return null;
      return this.groups.find((group) => group.id === this.codeExportGroupId) || null;
    },
    codeExportColors() {
      if (!this.codeExportGroup) return [];
      return this.codeExportGroup.colors.map((color) => ({
        name: color.name,
        color: color.color
      }));
    },
    codeExportTitle() {
      if (!this.codeExportGroup) return '生成代码';
      return `生成代码 - ${this.codeExportGroup.name}`;
    },
    shareLink() {
      return 'https://color.tools/share/' + (this.shareTargetGroup ? this.shareTargetGroup.id : '');
    },
    shareJson() {
      if (!this.shareTargetGroup) return '';
      return JSON.stringify({
        name: this.shareTargetGroup.name,
        type: this.shareTargetGroup.type,
        colors: this.shareTargetGroup.colors,
        exportedAt: new Date().toISOString()
      }, null, 2);
    },
    paginatedGroups() {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.groups.slice(start, start + this.pageSize);
    },
    maxPage() {
      return Math.max(1, Math.ceil(this.groups.length / this.pageSize));
    }
  },
  watch: {
    groups() {
      if (this.currentPage > this.maxPage) {
        this.currentPage = this.maxPage;
      }
    },
    pageSize() {
      if (this.currentPage > this.maxPage) {
        this.currentPage = this.maxPage;
      }
    }
  },
  mounted() {
    this.reloadGroups();
    this.updateHeaderActions();
  },
  unmounted() {
    this.clearHeaderActions();
  },
  methods: {
    updateHeaderActions() {
      this.setHeaderActions([
        { label: '新增分组', onClick: () => this.openNewGroupDialog() }
      ]);
    },
    reloadGroups() {
      this.groups = loadPalettes();
      if (this.groups.length > 0 && !this.groups.find((group) => group.id === this.activeGroup)) {
        this.activeGroup = this.groups[0].id;
      }
      if (this.groups.length === 0) {
        this.activeGroup = null;
      }
    },
    getContrastColor(hex) {
      const rgb = parseColor(hex);
      if (!rgb) return '#000000';
      return gcc(rgb);
    },
    getGroupIcon(type) {
      const icons = { personal: '👤', project: '📁', brand: '🏢' };
      return icons[type] || '📋';
    },
    getGroupTypeLabel(type) {
      const labels = { personal: '个人', project: '项目', brand: '品牌' };
      return labels[type] || type;
    },
    openNewGroupDialog() {
      this.editingGroupId = null;
      this.newGroupName = '';
      this.newGroupType = 'personal';
      this.dialogNewGroup = true;
    },
    openEditGroupDialog(row) {
      this.editingGroupId = row.id;
      this.newGroupName = row.name;
      this.newGroupType = row.type;
      this.dialogNewGroup = true;
    },
    closeGroupDialog() {
      this.dialogNewGroup = false;
      this.editingGroupId = null;
      this.newGroupName = '';
    },
    openShareDialog(row) {
      this.shareGroupId = row.id;
      this.activeGroup = row.id;
      this.importJson = '';
      this.dialogShare = true;
    },
    openDedupDialog(row) {
      this.activeGroup = row.id;
      this.dedupResults = [];
      this.hasRunDedup = false;
      this.dialogDedup = true;
    },
    openCodeExportDialog(row) {
      this.codeExportGroupId = row.id;
      this.activeGroup = row.id;
      this.dialogCodeExport = true;
    },
    viewGroup(row) {
      this.$router.push({
        path: '/PaletteManager/viewGroupingDetail',
        query: {
          groupId: row.id,
          name: row.name
        }
      });
    },
    openDeleteConfirm(row) {
      this.deleteTargetId = row.id;
      this.deleteTargetName = row.name;
      this.dialogDeleteConfirm = true;
    },
    saveGroup() {
      if (!this.newGroupName.trim()) {
        showToast(this, '请输入分组名称', 'error');
        return;
      }
      if (this.editingGroupId) {
        const group = this.groups.find(g => g.id === this.editingGroupId);
        if (!group) return;
        group.name = this.newGroupName.trim();
        group.type = this.newGroupType;
        this.closeGroupDialog();
        this.savePalettes();
        showToast(this, '分组修改成功', 'success');
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
      this.closeGroupDialog();
      this.savePalettes();
      showToast(this, '分组创建成功', 'success');
    },
    confirmDeleteGroup() {
      if (!this.deleteTargetId) return;
      const id = this.deleteTargetId;
      this.groups = this.groups.filter(g => g.id !== id);
      if (this.activeGroup === id) {
        this.activeGroup = this.groups.length > 0 ? this.groups[0].id : null;
      }
      this.deleteTargetId = null;
      this.deleteTargetName = '';
      this.dialogDeleteConfirm = false;
      this.savePalettes();
      showToast(this, '分组已删除', 'success');
    },
    savePalettes() {
      savePalettes(this.groups);
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

.cell-group-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.group-icon { font-size: 16px; }

.group-colors {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  align-items: center;
}

.group-color-swatch {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.group-color-more,
.group-color-empty {
  font-size: 11px;
  color: var(--text-tertiary);
}

.table-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 10px;
}

.link-btn {
  padding: 0;
  background: none;
  border: none;
  font-size: 13px;
  color: var(--accent);
  cursor: pointer;
  white-space: nowrap;

  &:hover { opacity: 0.8; }

  &.danger {
    color: var(--text-error, #ef4444);
  }
}

.dialog-form,
.dialog-share,
.dialog-dedup,
.dialog-confirm {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dialog-desc {
  margin: 0;
  font-size: 13px;
  color: var(--text-secondary);
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
}

.form-optional {
  font-weight: 400;
  color: var(--text-tertiary);
}

.form-input,
.form-select {
  padding: 8px 12px;
  background: var(--bg-input);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: 13px;
  &:focus { outline: none; border-color: var(--accent); }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 4px;
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
  &:hover { opacity: 0.9; }

  &.full-width { width: 100%; }
}

.secondary-btn {
  background: var(--bg-muted);
  color: var(--text-primary);
  border-color: var(--border-primary);
}

.danger-btn {
  background: var(--text-error, #ef4444);
  border-color: var(--text-error, #ef4444);
}

.confirm-text {
  margin: 0;
  font-size: 14px;
  color: var(--text-primary);
  line-height: 1.6;
}

.dedup-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dedup-slider-label { font-size: 13px; color: var(--text-primary); }
.dedup-slider { width: 100%; }

.result-summary {
  padding: 12px 16px;
  background: var(--accent-soft);
  border-radius: var(--radius-md);
  font-size: 13px;
  color: var(--accent);
}

.dedup-group {
  padding: 14px;
  background: var(--bg-muted);
  border-radius: var(--radius-md);
  margin-bottom: 12px;
}

.dedup-group-title { font-size: 13px; font-weight: 600; margin-bottom: 10px; }

.dedup-colors {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.dedup-color-item {
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  min-width: 120px;
}

.dedup-color-text { font-size: 12px; font-weight: 600; display: block; }
.dedup-color-hex { font-size: 11px; font-family: monospace; display: block; margin-top: 2px; }

.merge-btn {
  padding: 6px 14px;
  background: var(--accent);
  color: var(--text-invert);
  border: none;
  border-radius: var(--radius-sm);
  font-size: 12px;
  cursor: pointer;
}

.share-preview {
  padding: 16px;
  background: var(--bg-muted);
  border-radius: var(--radius-md);
}

.share-title { font-size: 15px; font-weight: 600; margin-bottom: 12px; }

.share-colors {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 8px;
}

.share-color-item {
  padding: 14px 10px;
  border-radius: var(--radius-sm);
  text-align: center;
  min-height: 72px;
}

.share-color-text { font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px; }
.share-color-hex { font-size: 11px; font-family: monospace; display: block; }

.share-link-box,
.share-code-box,
.import-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.share-link-label { font-size: 13px; font-weight: 500; }

.share-link-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.share-link-input {
  flex: 1;
  min-width: 200px;
  padding: 8px 12px;
  background: var(--bg-input);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  font-size: 13px;
  font-family: monospace;
}

.share-code-title,
.import-title {
  font-size: 13px;
  font-weight: 500;
}

.share-code-textarea {
  padding: 12px;
  background: var(--bg-input);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  font-size: 12px;
  font-family: monospace;
  min-height: 100px;
  resize: vertical;
}

.share-hint {
  font-size: 12px;
  color: var(--text-secondary);
  padding: 10px 14px;
  background: var(--bg-muted);
  border-radius: var(--radius-md);
}

.empty-state {
  padding: 24px;
  text-align: center;
}

.empty-icon { font-size: 36px; margin-bottom: 8px; }
.empty-text { font-size: 14px; color: var(--text-secondary); }

@media (max-width: 640px) {
  .table-actions { flex-direction: column; align-items: flex-start; }
}
</style>
