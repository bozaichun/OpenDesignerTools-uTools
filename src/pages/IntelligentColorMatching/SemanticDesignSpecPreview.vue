<script lang="ts" setup>
import {
  THEME_COLOR_FIELDS,
  FUNCTIONAL_COLOR_TYPES,
  FUNCTIONAL_COLOR_FIELDS,
  AUXILIARY_COLOR_FIELDS,
  NEUTRAL_COLOR_FIELDS,
  SHADOW_FIELDS
} from './semanticDesignSpec.js';
import ColorChipActions from './ColorChipActions.vue';
import { getContrastColor as gcc, parseColor } from '../../utils/colorUtils';

const props = defineProps({
  spec: { type: Object, required: true }
});

function getContrastColor(hex) {
  const rgb = parseColor(hex);
  if (!rgb) return '#000000';
  return gcc(rgb);
}

function buildFavoriteName(label) {
  return `${props.spec.name} · ${label}`;
}
</script>

<template>
  <div class="design-spec">
    <!-- 方案标题 -->
    <div class="design-spec-header">
      <div class="design-spec-header-text">
        <div class="design-spec-name">{{ spec.name }}</div>
        <div v-if="spec.description" class="design-spec-desc">{{ spec.description }}</div>
      </div>
    </div>

    <!-- 主题色 -->
    <section class="spec-section">
      <h4 class="spec-section-title">主题色</h4>
      <div class="color-chip-grid">
        <div
          v-for="field in THEME_COLOR_FIELDS"
          :key="field.key"
          class="color-chip"
          :style="{ background: spec.theme[field.key] }"
        >
          <div class="color-chip-text" :style="{ color: getContrastColor(spec.theme[field.key]) }">
            <span class="color-chip-label">{{ field.label }}</span>
            <span class="color-chip-hex">{{ spec.theme[field.key] }}</span>
          </div>
          <ColorChipActions
            :value="spec.theme[field.key]"
            :label="field.label"
            :favorite-name="buildFavoriteName(field.label)"
          />
        </div>
      </div>
    </section>

    <!-- 功能色 -->
    <section class="spec-section">
      <h4 class="spec-section-title">功能色</h4>
      <div
        v-for="type in FUNCTIONAL_COLOR_TYPES"
        :key="type.key"
        class="spec-subsection"
      >
        <h5 class="spec-subsection-title">{{ type.label }}</h5>
        <div class="color-chip-grid">
          <div
            v-for="field in FUNCTIONAL_COLOR_FIELDS"
            :key="`${type.key}-${field.key}`"
            class="color-chip"
            :style="{ background: spec.functional[type.key][field.key] }"
          >
            <div
              class="color-chip-text"
              :style="{ color: getContrastColor(spec.functional[type.key][field.key]) }"
            >
              <span class="color-chip-label">{{ field.label }}</span>
              <span class="color-chip-hex">{{ spec.functional[type.key][field.key] }}</span>
            </div>
            <ColorChipActions
              :value="spec.functional[type.key][field.key]"
              :label="`${type.label}·${field.label}`"
              :favorite-name="buildFavoriteName(`${type.label}·${field.label}`)"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- 辅助色 -->
    <section class="spec-section">
      <h4 class="spec-section-title">辅助色</h4>
      <div class="color-chip-grid color-chip-grid--6">
        <div
          v-for="field in AUXILIARY_COLOR_FIELDS"
          :key="field.key"
          class="color-chip"
          :style="{ background: spec.auxiliary[field.key] }"
        >
          <div class="color-chip-text" :style="{ color: getContrastColor(spec.auxiliary[field.key]) }">
            <span class="color-chip-label">{{ field.label }}</span>
            <span class="color-chip-hex">{{ spec.auxiliary[field.key] }}</span>
          </div>
          <ColorChipActions
            :value="spec.auxiliary[field.key]"
            :label="field.label"
            :favorite-name="buildFavoriteName(field.label)"
          />
        </div>
      </div>
    </section>

    <!-- 中性色 -->
    <section class="spec-section">
      <h4 class="spec-section-title">中性色</h4>
      <div class="spec-subsection">
        <h5 class="spec-subsection-title">浅色模式</h5>
        <div class="neutral-row neutral-row--light">
          <div
            v-for="field in NEUTRAL_COLOR_FIELDS"
            :key="`light-${field.key}`"
            class="neutral-item"
          >
            <span class="neutral-sample" :style="{ color: spec.neutral.light[field.key] }">{{ field.label }}</span>
            <span class="neutral-hex">{{ spec.neutral.light[field.key] }}</span>
            <ColorChipActions
              :value="spec.neutral.light[field.key]"
              :label="`浅色·${field.label}`"
              :favorite-name="buildFavoriteName(`浅色·${field.label}`)"
              :on-color="false"
            />
          </div>
        </div>
      </div>
      <div class="spec-subsection">
        <h5 class="spec-subsection-title">深色模式</h5>
        <div class="neutral-row neutral-row--dark">
          <div
            v-for="field in NEUTRAL_COLOR_FIELDS"
            :key="`dark-${field.key}`"
            class="neutral-item"
          >
            <span class="neutral-sample" :style="{ color: spec.neutral.dark[field.key] }">{{ field.label }}</span>
            <span class="neutral-hex">{{ spec.neutral.dark[field.key] }}</span>
            <ColorChipActions
              :value="spec.neutral.dark[field.key]"
              :label="`深色·${field.label}`"
              :favorite-name="buildFavoriteName(`深色·${field.label}`)"
              :on-color="false"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- 阴影 -->
    <section class="spec-section">
      <h4 class="spec-section-title">阴影</h4>
      <div class="shadow-grid">
        <div
          v-for="field in SHADOW_FIELDS"
          :key="field.key"
          class="shadow-item"
        >
          <div class="shadow-preview" :style="{ boxShadow: spec.shadows[field.key] }"></div>
          <div class="shadow-meta">
            <span class="shadow-label">{{ field.label }}</span>
            <span class="shadow-value">{{ spec.shadows[field.key] }}</span>
            <ColorChipActions
              :value="spec.shadows[field.key]"
              :label="field.label"
              :on-color="false"
              :show-favorite="false"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- 描边 -->
    <section class="spec-section">
      <h4 class="spec-section-title">描边</h4>
      <div class="stroke-grid">
        <div v-for="stroke in spec.strokes" :key="stroke.key" class="stroke-item">
          <div
            class="stroke-preview"
            :style="{ borderWidth: stroke.value, borderStyle: 'solid', borderColor: 'var(--border-primary)' }"
          ></div>
          <span class="token-label">{{ stroke.label }}</span>
          <span class="token-value">{{ stroke.value }}</span>
        </div>
      </div>
    </section>

    <!-- 间距 -->
    <section class="spec-section">
      <h4 class="spec-section-title">间距</h4>
      <div class="spacing-grid">
        <div v-for="space in spec.spacing" :key="space.key" class="spacing-item">
          <div class="spacing-bar-wrap">
            <div class="spacing-bar" :style="{ width: `${Math.max(space.value, 2)}px` }"></div>
          </div>
          <span class="token-label">{{ space.label }}</span>
          <span class="token-value">{{ space.value }}px</span>
        </div>
      </div>
    </section>

    <!-- 圆角 -->
    <section class="spec-section">
      <h4 class="spec-section-title">圆角</h4>
      <div class="radius-grid">
        <div v-for="radius in spec.radius" :key="radius.key" class="radius-item">
          <div
            class="radius-preview"
            :style="{ borderRadius: `${radius.value}px` }"
          ></div>
          <span class="token-label">{{ radius.label }}</span>
          <span class="token-value">{{ radius.value }}px</span>
        </div>
      </div>
    </section>

    <!-- 字阶与行高 -->
    <section class="spec-section">
      <h4 class="spec-section-title">字阶与行高</h4>
      <div class="typography-list">
        <div
          v-for="(item, idx) in spec.typography"
          :key="idx"
          class="typography-item"
        >
          <span
            class="typography-sample"
            :style="{ fontSize: `${item.size}px`, lineHeight: `${item.lineHeight}px` }"
          >Aa 字阶 {{ item.size }}/{{ item.lineHeight }}</span>
          <span class="token-value">{{ item.size }}/{{ item.lineHeight }}</span>
        </div>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.design-spec {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.design-spec-header-text {
  min-width: 0;
}

.design-spec-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.design-spec-desc {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.spec-section {
  padding-top: 4px;
}

.spec-section-title {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-primary);
}

.spec-subsection {
  margin-bottom: 14px;
  &:last-child { margin-bottom: 0; }
}

.spec-subsection-title {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
}

.color-chip-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
}

.color-chip-grid--6 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.color-chip {
  min-height: 88px;
  border-radius: var(--radius-md);
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border: 1px solid var(--border-primary);
}

.color-chip-text {
  font-size: 11px;
  line-height: 1.5;
}

.color-chip-label {
  display: block;
  font-weight: 600;
  margin-bottom: 2px;
}

.color-chip-hex {
  font-family: monospace;
  font-size: 10px;
  opacity: 0.9;
}

.neutral-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  padding: 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
}

.neutral-row--light {
  background: #FFFFFF;
}

.neutral-row--dark {
  background: #1A1A1A;
}

.neutral-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 6px 8px;
  border-radius: var(--radius-sm);
}

.neutral-sample {
  font-size: 13px;
  font-weight: 500;
}

.neutral-hex {
  font-family: monospace;
  font-size: 10px;
  color: var(--text-tertiary);
}

.neutral-row--dark .neutral-hex {
  color: #737373;
}

.shadow-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
}

.shadow-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.shadow-preview {
  height: 56px;
  background: var(--bg-card);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
}

.shadow-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.shadow-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
}

.shadow-value {
  font-family: monospace;
  font-size: 9px;
  color: var(--text-tertiary);
  line-height: 1.4;
  word-break: break-all;
}

.stroke-grid,
.radius-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.stroke-preview,
.radius-preview {
  height: 48px;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
}

.radius-preview {
  border-width: 2px;
  border-color: var(--accent);
  background: var(--accent-soft);
}

.stroke-item,
.radius-item,
.spacing-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.token-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
}

.token-value {
  font-family: monospace;
  font-size: 11px;
  color: var(--text-tertiary);
}

.spacing-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.spacing-bar-wrap {
  width: 100%;
  height: 32px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: var(--bg-muted);
  border-radius: var(--radius-sm);
  padding: 4px;
}

.spacing-bar {
  height: 8px;
  min-width: 2px;
  background: var(--accent);
  border-radius: 2px;
}

.typography-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.typography-item {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 12px;
  background: var(--bg-muted);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
}

.typography-sample {
  color: var(--text-primary);
  font-weight: 500;
}

@media (max-width: 1024px) {
  .color-chip-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .color-chip-grid--6 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .shadow-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .stroke-grid, .radius-grid, .spacing-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 640px) {
  .color-chip-grid, .color-chip-grid--6, .shadow-grid,
  .stroke-grid, .radius-grid, .spacing-grid,
  .neutral-row { grid-template-columns: 1fr; }
}
</style>
