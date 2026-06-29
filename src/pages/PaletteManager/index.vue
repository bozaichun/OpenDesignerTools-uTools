<script lang="ts" setup>
import { ref, computed, watch, inject, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import DataTable from '../../components/Table.vue';
import Dialog from '../../components/Dialog.vue';
import Input from '../../components/Input.vue';
import Selector from '../../components/Selector.vue';
import Pagination from '../../components/Pagination.vue';
import CodeExportPanel from '../../components/CodeExportPanel.vue';
import Banner from '../../components/Banner.vue';
import DefaultPage from '../../components/DefaultPage.vue';
import { parseColor, copyToClipboard, showToast, getContrastColor as gcc } from '../../utils/colorUtils';
import { loadPalettes, savePalettes as persistPalettes } from './paletteStorage.js';

const router = useRouter();
const setHeaderActions = inject('setHeaderActions');
const clearHeaderActions = inject('clearHeaderActions');

const groups = ref([]);
const activeGroup = ref(null);
const selectedGroupIds = ref(new Set());
const currentPage = ref(1);
const pageSize = ref(10);
const tableColumns = [
  { prop: '_select', label: '', slot: 'select', width: '48px', align: 'center' },
  { prop: 'name', label: '分组名称', slot: 'name', width: '180px' },
  { prop: 'type', label: '分组类型', slot: 'type', width: '100px' },
  { prop: 'swatches', label: '色值预览', slot: 'swatches' },
  { prop: 'count', label: '色值数量', slot: 'count', width: '90px', align: 'center' }
];
const dialogNewGroup = ref(false);
const editingGroupId = ref(null);
const dialogShare = ref(false);
const shareGroupId = ref(null);
const dialogDedup = ref(false);
const dialogDeleteConfirm = ref(false);
const dialogBatchDeleteConfirm = ref(false);
const dialogCodeExport = ref(false);
const codeExportGroupId = ref(null);
const newGroupName = ref('');
const newGroupType = ref('project');
const deleteTargetId = ref(null);
const deleteTargetName = ref('');
const similarityThreshold = ref(5);
const dedupResults = ref([]);
const hasRunDedup = ref(false);
const importJson = ref('');

const currentGroup = computed(() => groups.value.find(g => g.id === activeGroup.value));
const shareTargetGroup = computed(() => {
  if (!shareGroupId.value) return null;
  return groups.value.find((group) => group.id === shareGroupId.value) || null;
});
const codeExportGroup = computed(() => {
  if (!codeExportGroupId.value) return null;
  return groups.value.find((group) => group.id === codeExportGroupId.value) || null;
});
const codeExportColors = computed(() => {
  if (!codeExportGroup.value) return [];
  return codeExportGroup.value.colors.map((color) => ({
    name: color.name,
    color: color.color
  }));
});
const codeExportTitle = computed(() => {
  if (!codeExportGroup.value) return '生成代码';
  return `生成代码 - ${codeExportGroup.value.name}`;
});
const shareLink = computed(() => 'https://color.tools/share/' + (shareTargetGroup.value ? shareTargetGroup.value.id : ''));
const shareJson = computed(() => {
  if (!shareTargetGroup.value) return '';
  return JSON.stringify({
    name: shareTargetGroup.value.name,
    type: shareTargetGroup.value.type,
    colors: shareTargetGroup.value.colors,
    exportedAt: new Date().toISOString()
  }, null, 2);
});
const paginatedGroups = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return groups.value.slice(start, start + pageSize.value);
});
const maxPage = computed(() => Math.max(1, Math.ceil(groups.value.length / pageSize.value)));
const selectedCount = computed(() => selectedGroupIds.value.size);
const multiSelectVisible = computed(() => selectedCount.value > 0);
const isAllPageSelected = computed(() => {
  const list = paginatedGroups.value;
  return list.length > 0 && list.every((group) => selectedGroupIds.value.has(group.id));
});
const isAllPageIndeterminate = computed(() => {
  const list = paginatedGroups.value;
  if (!list.length) return false;
  const selectedInPage = list.filter((group) => selectedGroupIds.value.has(group.id)).length;
  return selectedInPage > 0 && selectedInPage < list.length;
});

watch(groups, () => {
  if (currentPage.value > maxPage.value) {
    currentPage.value = maxPage.value;
  }
});
watch(pageSize, () => {
  if (currentPage.value > maxPage.value) {
    currentPage.value = maxPage.value;
  }
});

function updateHeaderActions() {
  setHeaderActions([
    { label: '新增分组', onClick: () => openNewGroupDialog() }
  ]);
}
function reloadGroups() {
  groups.value = loadPalettes();
  if (groups.value.length > 0 && !groups.value.find((group) => group.id === activeGroup.value)) {
    activeGroup.value = groups.value[0].id;
  }
  if (groups.value.length === 0) {
    activeGroup.value = null;
  }
}
function getContrastColor(hex) {
  const rgb = parseColor(hex);
  if (!rgb) return '#000000';
  return gcc(rgb);
}
function getGroupIconClass(type) {
  const icons = {
    personal: 'icon-Areality-Individual',
    project: 'icon-Areality-Project',
    brand: 'icon-Areality-Brand'
  };
  return icons[type] || 'icon-Areality-Palette';
}
function getGroupIconColorClass(type) {
  const colors = {
    personal: 'group-icon--personal',
    project: 'group-icon--project',
    brand: 'group-icon--brand'
  };
  return colors[type] || '';
}
function isGroupSelected(id) {
  return selectedGroupIds.value.has(id);
}
function toggleSelectGroup(id) {
  const next = new Set(selectedGroupIds.value);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  selectedGroupIds.value = next;
}
function toggleSelectAllPage() {
  if (isAllPageSelected.value) {
    const next = new Set(selectedGroupIds.value);
    paginatedGroups.value.forEach((group) => next.delete(group.id));
    selectedGroupIds.value = next;
    return;
  }
  const next = new Set(selectedGroupIds.value);
  paginatedGroups.value.forEach((group) => next.add(group.id));
  selectedGroupIds.value = next;
}
function handleCancelMultiSelect() {
  selectedGroupIds.value = new Set();
}
function openBatchDeleteConfirm() {
  dialogBatchDeleteConfirm.value = true;
}
function confirmBatchDeleteGroups() {
  const ids = new Set(selectedGroupIds.value);
  if (!ids.size) return;
  groups.value = groups.value.filter((group) => !ids.has(group.id));
  if (activeGroup.value && ids.has(activeGroup.value)) {
    activeGroup.value = groups.value.length > 0 ? groups.value[0].id : null;
  }
  selectedGroupIds.value = new Set();
  dialogBatchDeleteConfirm.value = false;
  savePalettes();
  showToast(null, `已删除 ${ids.size} 个分组`, 'success');
}
function getGroupTypeLabel(type) {
  const labels = { personal: '个人', project: '项目', brand: '品牌' };
  return labels[type] || type;
}
function openNewGroupDialog() {
  editingGroupId.value = null;
  newGroupName.value = '';
  newGroupType.value = 'project';
  dialogNewGroup.value = true;
}
function openEditGroupDialog(row) {
  editingGroupId.value = row.id;
  newGroupName.value = row.name;
  newGroupType.value = row.type || 'project';
  dialogNewGroup.value = true;
}
function closeGroupDialog() {
  dialogNewGroup.value = false;
  editingGroupId.value = null;
  newGroupName.value = '';
}
function openShareDialog(row) {
  shareGroupId.value = row.id;
  activeGroup.value = row.id;
  importJson.value = '';
  dialogShare.value = true;
}
function openDedupDialog(row) {
  activeGroup.value = row.id;
  dedupResults.value = [];
  hasRunDedup.value = false;
  dialogDedup.value = true;
}
function openCodeExportDialog(row) {
  codeExportGroupId.value = row.id;
  activeGroup.value = row.id;
  dialogCodeExport.value = true;
}
function viewGroup(row) {
  router.push({
    path: '/PaletteManager/viewGroupingDetail',
    query: {
      groupId: row.id,
      name: row.name
    }
  });
}
function openDeleteConfirm(row) {
  deleteTargetId.value = row.id;
  deleteTargetName.value = row.name;
  dialogDeleteConfirm.value = true;
}
function saveGroup() {
  if (!newGroupName.value.trim()) {
    showToast(null, '请输入分组名称', 'error');
    return;
  }
  if (editingGroupId.value) {
    const group = groups.value.find(g => g.id === editingGroupId.value);
    if (!group) return;
    group.name = newGroupName.value.trim();
    group.type = newGroupType.value;
    closeGroupDialog();
    savePalettes();
    showToast(null, '分组修改成功', 'success');
    return;
  }
  const newGroup = {
    id: 'g-' + Date.now(),
    name: newGroupName.value.trim(),
    type: newGroupType.value,
    colors: []
  };
  groups.value.push(newGroup);
  activeGroup.value = newGroup.id;
  closeGroupDialog();
  savePalettes();
  showToast(null, '分组创建成功', 'success');
}
function confirmDeleteGroup() {
  if (!deleteTargetId.value) return;
  const id = deleteTargetId.value;
  groups.value = groups.value.filter(g => g.id !== id);
  if (activeGroup.value === id) {
    activeGroup.value = groups.value.length > 0 ? groups.value[0].id : null;
  }
  deleteTargetId.value = null;
  deleteTargetName.value = '';
  dialogDeleteConfirm.value = false;
  savePalettes();
  showToast(null, '分组已删除', 'success');
}
function savePalettes() {
  persistPalettes(groups.value);
}
function hexToRgbObj(hex) {
  const rgb = parseColor(hex);
  return rgb ? { r: rgb.r, g: rgb.g, b: rgb.b } : { r: 0, g: 0, b: 0 };
}
function colorDistance(c1, c2) {
  const r1 = hexToRgbObj(c1);
  const r2 = hexToRgbObj(c2);
  return Math.sqrt(
    Math.pow(r1.r - r2.r, 2) + Math.pow(r1.g - r2.g, 2) + Math.pow(r1.b - r2.b, 2)
  );
}
function runDedup() {
  hasRunDedup.value = true;
  dedupResults.value = [];

  const allColors = [];
  groups.value.forEach(group => {
    group.colors.forEach((color, idx) => {
      allColors.push({ ...color, groupId: group.id, colorIdx: idx });
    });
  });

  if (allColors.length < 2) return;

  const threshold = (similarityThreshold.value / 100) * 441;
  const visited = new Set();

  for (let i = 0; i < allColors.length; i++) {
    if (visited.has(i)) continue;
    const group = [allColors[i]];
    for (let j = i + 1; j < allColors.length; j++) {
      if (visited.has(j)) continue;
      const dist = colorDistance(allColors[i].color, allColors[j].color);
      if (dist <= threshold) {
        group.push(allColors[j]);
        visited.add(j);
      }
    }
    if (group.length > 1) {
      const maxDist = Math.max(
        ...group.slice(1).map(c => colorDistance(group[0].color, c.color))
      );
      const similarity = Math.round((1 - maxDist / 441) * 100);
      dedupResults.value.push({
        colors: group,
        similarity,
        primaryColor: group[0]
      });
    }
  }
}
function mergeGroup(group) {
  group.colors.slice(1).forEach(c => {
    const targetGroup = groups.value.find(g => g.id === c.groupId);
    if (targetGroup) {
      targetGroup.colors.splice(c.colorIdx, 1);
    }
  });

  savePalettes();
  showToast(null, '已合并相似色值', 'success');
  dedupResults.value = [];
}
function importPalette() {
  try {
    const data = JSON.parse(importJson.value);
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
    groups.value.push(newGroup);
    activeGroup.value = newGroup.id;
    importJson.value = '';
    savePalettes();
    showToast(null, '色板导入成功！', 'success');
  } catch (e) {
    showToast(null, 'JSON 格式错误，请检查', 'error');
  }
}
function copyValue(value, label) {
  copyToClipboard(value);
  showToast(null, '已复制 ' + label, 'success');
}

onMounted(() => {
  reloadGroups();
  updateHeaderActions();
});
onUnmounted(() => {
  clearHeaderActions();
});
</script>

<template>
  <div class="module-palette" :class="{ 'has-multi-bar': multiSelectVisible }">
    <div class="palette-main">
    <Banner
      title="统一管理品牌色与项目色板"
      description="支持个人 / 项目 / 品牌三类分组，自动查重合并、一键生成代码并与团队共享色板"
      mode="url"
      image-url="https://zblogphp-serverless-code-ap-beijing-1304983928.cos.ap-beijing.myqcloud.com/banner/icon/ColorPaletteManagement.png"
    />
    <DataTable
        :data="paginatedGroups"
        :columns="tableColumns"
        :border="true"
        row-key="id"
        action-label="操作"
        action-width="420px"
        empty-text="暂无分组，点击右上角「新增分组」创建"
      >
        <template #empty>
          <DefaultPage text="暂无分组，点击右上角「新增分组」创建" />
        </template>

        <template #select="{ row }">
          <button
            type="button"
            class="row-select-btn"
            :class="{ checked: isGroupSelected(row.id) }"
            title="多选"
            @click.stop="toggleSelectGroup(row.id)"
          >
            <span v-if="isGroupSelected(row.id)" class="iconfont icon-Check"></span>
          </button>
        </template>

        <template #name="{ row }">
          <div class="cell-group-name">
            <span
              class="iconfont group-icon"
              :class="[getGroupIconClass(row.type), getGroupIconColorClass(row.type)]"
            ></span>
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
              :key="c.name || c.color"
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
            <button class="link-btn" @click="openCodeExportDialog(row)">导出</button>
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
    </div>

    <!-- 多选功能区 -->
    <div v-if="multiSelectVisible" class="palette-multi-bar">
      <div class="palette-multi-left">
        <button type="button" class="palette-multi-all" @click="toggleSelectAllPage">
          <span
            class="palette-check-box"
            :class="{
              checked: isAllPageSelected,
              indeterminate: isAllPageIndeterminate
            }"
          >
            <span v-if="isAllPageSelected" class="iconfont icon-Check"></span>
            <span v-else-if="isAllPageIndeterminate" class="palette-check-indeterminate"></span>
          </span>
          全选
        </button>
        <span class="palette-multi-divider" aria-hidden="true"></span>
        <span class="palette-multi-count">已选 {{ selectedCount }} 个分组</span>
      </div>
      <div class="palette-multi-right">
        <button type="button" class="palette-multi-action danger" @click="openBatchDeleteConfirm">
          批量删除
        </button>
        <button type="button" class="palette-multi-action" @click="handleCancelMultiSelect">
          取消
        </button>
      </div>
    </div>

    <!-- 新建 / 修改分组 -->
    <Dialog
      v-model:visible="dialogNewGroup"
      :title="editingGroupId ? '编辑分组' : '新增分组'"
      max-width="480px"
    >
      <div class="dialog-form">
        <div class="form-field">
          <label class="form-label">分组类型</label>
          <Selector v-model="newGroupType">
            <option value="personal">个人</option>
            <option value="project">项目</option>
            <option value="brand">品牌</option>
          </Selector>
        </div>
        <div class="form-field">
          <label class="form-label">分组名称</label>
          <Input
            v-model="newGroupName"
            :placeholder="editingGroupId ? '输入分组名称...' : '输入新分组名称...'"
            @keyup-enter="saveGroup"
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
                :key="c.name || c.color"
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
              <Input
                variant="mono"
                :model-value="shareLink"
                readonly
                :flex="true"
              />
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

    <!-- 批量删除确认 -->
    <Dialog
      v-model:visible="dialogBatchDeleteConfirm"
      title="批量删除分组"
      max-width="420px"
      :confirm-on-enter="true"
      @confirm="confirmBatchDeleteGroups"
    >
      <div class="dialog-confirm">
        <p class="confirm-text">
          您是否删除已选的 {{ selectedCount }} 个分组，此过程不可撤销！
        </p>
        <div class="dialog-footer">
          <button class="secondary-btn" @click="dialogBatchDeleteConfirm = false">取消</button>
          <button class="primary-btn danger-btn" @click="confirmBatchDeleteGroups">确认删除</button>
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

<style lang="scss" scoped>
.module-palette {
  width: 100%;
  min-width: 0;

  &.has-multi-bar {
    display: flex;
    flex-direction: column;
    min-height: 100%;
    margin-bottom: -20px;

    .palette-main {
      flex: 1 1 auto;
    }

    .palette-multi-bar {
      margin-top: auto;
    }
  }
}

.palette-main {
  min-width: 0;
}

.cell-group-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.group-icon {
  font-size: var(--wh-16);
  flex-shrink: 0;
  color: var(--accent);

  &.group-icon--project {
    color: var(--warning);
  }

  &.group-icon--personal {
    color: var(--secondary-text);
  }

  &.group-icon--brand {
    color: var(--accent);
  }
}

.row-select-btn {
  width: 16px;
  height: 16px;
  padding: 0;
  flex-shrink: 0;
  border: 1px solid var(--border-primary);
  border-radius: 3px;
  background: var(--bg-card);
  color: var(--text-invert);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;

  .iconfont {
    font-size: 10px;
    line-height: 1;
  }

  &:hover {
    border-color: var(--accent);
  }

  &.checked {
    background: var(--accent);
    border-color: var(--accent);
  }
}

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
    color: var(--text-error);
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
  background: var(--text-error);
  border-color: var(--text-error);
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

.dedup-slider {
  width: 100%;
  height: 6px;
  margin: 0;
  -webkit-appearance: none;
  appearance: none;
  border-radius: 999px;
  border: 1px solid var(--border-primary);
  background: var(--bg-muted);
  outline: none;
  cursor: pointer;

  &::-webkit-slider-runnable-track {
    height: 6px;
    border-radius: 999px;
    background: transparent;
  }

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    margin-top: -6px;
    border-radius: 50%;
    border: 2px solid #ffffff;
    background: var(--accent);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.18);
    cursor: pointer;
  }

  &::-moz-range-track {
    height: 6px;
    border-radius: 999px;
    background: var(--bg-muted);
    border: none;
  }

  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 2px solid #ffffff;
    background: var(--accent);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.18);
    cursor: pointer;
  }
}

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
  align-items: center;
}

.share-link-row :deep(.app-input-wrap) {
  min-width: 200px;
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

/* ============ 多选功能区 ============ */
.palette-multi-bar {
  position: sticky;
  bottom: -20px;
  z-index: 20;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-left: -20px;
  margin-right: -20px;
  margin-bottom: -20px;
  padding: 16px 20px;
  background: var(--bg-card);
  border-top: 1px solid var(--border-primary);
  box-shadow: var(--shadow-top);
}

.palette-multi-left {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.palette-multi-all {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--text-primary);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  flex-shrink: 0;
}

.palette-multi-divider {
  width: 1px;
  height: 14px;
  background: var(--error);
  flex-shrink: 0;
}

.palette-multi-count {
  font-size: 12px;
  font-weight: 500;
  color: var(--primary);
  white-space: nowrap;
}

.palette-multi-right {
  display: inline-flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

.palette-multi-action {
  padding: 0;
  border: none;
  background: transparent;
  color: var(--accent);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  flex-shrink: 0;
  transition: opacity 0.15s ease;

  &:hover {
    opacity: 0.85;
  }

  &.danger {
    color: var(--text-error);
  }
}

.palette-check-box {
  width: 16px;
  height: 16px;
  border: 1px solid var(--border-primary);
  border-radius: 3px;
  background: var(--bg-card);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.15s ease;

  .iconfont {
    font-size: 10px;
    line-height: 1;
    color: var(--text-invert);
  }

  &.checked {
    background: var(--accent);
    border-color: var(--accent);
  }

  &.indeterminate {
    border-color: var(--accent);
  }
}

.palette-check-indeterminate {
  width: 8px;
  height: 2px;
  border-radius: 1px;
  background: var(--accent);
}

@media (max-width: 640px) {
  .module-palette.has-multi-bar {
    margin-bottom: -14px;
  }

  .palette-multi-bar {
    bottom: -14px;
    margin-left: -14px;
    margin-right: -14px;
    margin-bottom: -14px;
    padding: 10px 14px;
  }

  .table-actions { flex-direction: column; align-items: flex-start; }
}
</style>
