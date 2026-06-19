<template>
  <div class="module-palette-detail">
    <div v-if="!group" class="empty-state">
      <div class="empty-text">未找到该分组，可能已被删除</div>
      <button class="primary-btn" @click="goBack">返回列表</button>
    </div>

    <template v-else>
      <div class="detail-summary">共 {{ group.colors.length }} 个色值</div>

      <div v-if="group.colors.length" class="palette-list">
        <div
          v-for="(color, idx) in group.colors"
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
              @blur="saveAll()"
              placeholder="色值名称"
            />
            <div class="palette-hex">{{ color.color }}</div>
          </div>
          <input
            type="text"
            class="palette-note-input"
            v-model="color.note"
            @blur="saveAll()"
            placeholder="备注 / 使用场景"
          />
          <div class="palette-actions-sm">
            <button class="sm-btn" @click="openEditColorDialog(idx, color)">修改色值</button>
            <button class="sm-btn" @click="copyValue(color.color, color.name)">复制</button>
            <button class="sm-btn danger" @click="openDeleteConfirm(idx, color)">删除</button>
          </div>
        </div>
      </div>
      <div v-else class="expand-empty">该分组暂无色值，点击右上角「添加色值」开始创建</div>
    </template>

    <!-- 添加 / 修改色值 -->
    <Dialog
      v-model:visible="dialogAddColor"
      :title="editingColorIndex !== null ? '修改色值' : '添加色值'"
      max-width="480px"
    >
      <div class="dialog-form">
        <div class="form-field">
          <label class="form-label">色值名称</label>
          <input
            type="text"
            v-model="newColorName"
            placeholder="色值名称（如：品牌主色）"
            class="form-input"
          />
        </div>
        <div class="form-field">
          <label class="form-label">选择颜色</label>
          <ColorPicker v-model="newColorValue" class="color-picker-full" />
        </div>
        <div class="form-field">
          <label class="form-label">使用场景<span class="form-optional">（选填）</span></label>
          <input
            type="text"
            v-model="newColorNote"
            placeholder="备注/使用场景（选填）"
            class="form-input"
          />
        </div>
        <div class="dialog-footer">
          <button class="secondary-btn" @click="closeColorDialog">取消</button>
          <button class="primary-btn" @click="saveColor">{{ editingColorIndex !== null ? '确认修改' : '确认添加' }}</button>
        </div>
      </div>
    </Dialog>

    <!-- 删除确认 -->
    <Dialog
      v-model:visible="dialogDeleteConfirm"
      title="删除色值"
      max-width="420px"
      :confirm-on-enter="true"
      @confirm="confirmDeleteColor"
    >
      <div class="dialog-confirm">
        <p class="confirm-text">
          您是否删除「{{ deleteTargetName }}」色值，此过程不可撤销！
        </p>
        <div class="dialog-footer">
          <button class="secondary-btn" @click="dialogDeleteConfirm = false">取消</button>
          <button class="primary-btn danger-btn" @click="confirmDeleteColor">确认删除</button>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script>
import Dialog from '../../components/Dialog.vue';
import ColorPicker from '../../components/ColorPicker.vue';
import { parseColor, copyToClipboard, showToast, getContrastColor as gcc } from '../../utils/colorUtils';
import { loadPalettes, savePalettes } from './paletteStorage.js';

export default {
  name: 'PaletteManagerDetail',
  components: {
    Dialog,
    ColorPicker
  },
  inject: ['setHeaderActions', 'clearHeaderActions'],
  data() {
    return {
      groups: [],
      group: null,
      dialogAddColor: false,
      dialogDeleteConfirm: false,
      editingColorIndex: null,
      deleteTargetIndex: null,
      deleteTargetName: '',
      newColorName: '',
      newColorValue: '#1677FF',
      newColorNote: ''
    };
  },
  mounted() {
    this.loadGroup();
    this.updateHeaderActions();
  },
  unmounted() {
    this.clearHeaderActions();
  },
  watch: {
    '$route.query.groupId'() {
      this.loadGroup();
    }
  },
  methods: {
    loadGroup() {
      this.groups = loadPalettes();
      const groupId = this.$route.query.groupId;
      this.group = this.groups.find((item) => item.id === groupId) || null;
    },
    updateHeaderActions() {
      if (!this.group) {
        this.clearHeaderActions();
        return;
      }
      this.setHeaderActions([
        { label: '添加色值', onClick: () => this.openAddColorDialog() }
      ]);
    },
    goBack() {
      this.$router.push('/PaletteManager');
    },
    getContrastColor(hex) {
      const rgb = parseColor(hex);
      if (!rgb) return '#000000';
      return gcc(rgb);
    },
    openAddColorDialog() {
      this.editingColorIndex = null;
      this.newColorName = '';
      this.newColorValue = '#1677FF';
      this.newColorNote = '';
      this.dialogAddColor = true;
    },
    openEditColorDialog(idx, color) {
      this.editingColorIndex = idx;
      this.newColorName = color.name;
      this.newColorValue = color.color;
      this.newColorNote = color.note || '';
      this.dialogAddColor = true;
    },
    closeColorDialog() {
      this.dialogAddColor = false;
      this.editingColorIndex = null;
      this.newColorName = '';
      this.newColorValue = '#1677FF';
      this.newColorNote = '';
    },
    saveColor() {
      if (!this.group) return;
      if (!this.newColorName.trim() || !this.newColorValue) {
        showToast(this, '请填写色值名称和色值', 'error');
        return;
      }
      const rgb = parseColor(this.newColorValue);
      if (!rgb) {
        showToast(this, '色值格式无效', 'error');
        return;
      }
      const normalizedHex = '#' + [rgb.r, rgb.g, rgb.b].map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase();
      const colorData = {
        name: this.newColorName.trim(),
        color: normalizedHex,
        note: this.newColorNote.trim()
      };
      if (this.editingColorIndex !== null) {
        this.group.colors[this.editingColorIndex] = colorData;
        this.closeColorDialog();
        this.saveAll();
        showToast(this, '色值修改成功', 'success');
        return;
      }
      this.group.colors.push(colorData);
      this.closeColorDialog();
      this.saveAll();
      showToast(this, '色值添加成功', 'success');
    },
    openDeleteConfirm(idx, color) {
      this.deleteTargetIndex = idx;
      this.deleteTargetName = color.name || color.color;
      this.dialogDeleteConfirm = true;
    },
    confirmDeleteColor() {
      if (!this.group || this.deleteTargetIndex === null) return;
      this.group.colors.splice(this.deleteTargetIndex, 1);
      this.deleteTargetIndex = null;
      this.deleteTargetName = '';
      this.dialogDeleteConfirm = false;
      this.saveAll();
      showToast(this, '色值已删除', 'success');
    },
    saveAll() {
      savePalettes(this.groups);
    },
    copyValue(value, label) {
      copyToClipboard(value);
      showToast(this, '已复制 ' + label, 'success');
    }
  }
};
</script>

<style scoped>
.module-palette-detail {
  width: 100%;
  min-width: 0;
}

.detail-summary {
  margin-bottom: 16px;
  font-size: 12px;
  color: var(--text-tertiary);
}

.expand-empty,
.empty-state {
  padding: 40px 20px;
  text-align: center;
}

.expand-empty {
  font-size: 13px;
  color: var(--text-secondary);
}

.empty-text {
  margin-bottom: 16px;
  font-size: 14px;
  color: var(--text-secondary);
}

.palette-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.palette-item {
  display: grid;
  grid-template-columns: 60px 180px 1fr auto;
  gap: 12px;
  align-items: center;
  padding: 12px;
  background: var(--bg-card);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
}

.palette-swatch {
  width: 60px;
  height: 60px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-primary);
}

.palette-contrast-text {
  font-size: 18px;
  font-weight: 700;
}

.palette-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.palette-name-input {
  background: transparent;
  border: 1px solid transparent;
  padding: 4px 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  border-radius: var(--radius-sm);
}

.palette-name-input:focus {
  outline: none;
  border-color: var(--accent);
  background: var(--bg-muted);
}

.palette-hex {
  font-size: 12px;
  font-family: monospace;
  color: var(--text-secondary);
}

.palette-note-input {
  background: transparent;
  border: 1px solid transparent;
  padding: 4px 6px;
  font-size: 12px;
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
}

.palette-note-input:focus {
  outline: none;
  border-color: var(--accent);
  background: var(--bg-muted);
}

.palette-actions-sm {
  display: flex;
  gap: 6px;
}

.sm-btn {
  padding: 4px 10px;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-sm);
  font-size: 11px;
  cursor: pointer;
  color: var(--text-primary);
}

.sm-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.sm-btn.danger:hover {
  border-color: var(--text-error);
  color: var(--text-error);
}

.dialog-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
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

.form-input {
  padding: 8px 12px;
  background: var(--bg-input);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: 13px;
}

.form-input:focus {
  outline: none;
  border-color: var(--accent);
}

.color-picker-full {
  width: 100%;
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

.danger-btn {
  background: var(--text-error, #ef4444);
  border-color: var(--text-error, #ef4444);
}

.dialog-confirm {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.confirm-text {
  margin: 0;
  font-size: 14px;
  color: var(--text-primary);
  line-height: 1.6;
}

@media (max-width: 768px) {
  .palette-item {
    grid-template-columns: 60px 1fr;
  }

  .palette-note-input,
  .palette-actions-sm {
    grid-column: 1 / -1;
  }
}
</style>
