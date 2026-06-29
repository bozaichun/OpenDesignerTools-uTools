<script lang="ts" setup>
import { computed, ref, watch, onUnmounted } from 'vue';
import {
  THEME_COLOR_FIELDS,
  FUNCTIONAL_COLOR_TYPES,
  FUNCTIONAL_COLOR_FIELDS,
  AUXILIARY_COLOR_FIELDS,
  NEUTRAL_COLOR_FIELDS,
  SHADOW_FIELDS
} from './semanticDesignSpec.js';
import { buildSpecRevealQueue, SPEC_REVEAL_INTERVAL_MS } from './useSpecStreamingReveal.js';
import ColorActionGroup from '../../components/ColorActionGroup.vue';
import { getContrastColor as gcc, parseColor } from '../../utils/colorUtils';

const props = defineProps({
  spec: { type: Object, required: true },
  streaming: { type: Boolean, default: false },
  /** AI 是否仍在生成；生成结束后才允许触发 reveal-complete */
  aiPending: { type: Boolean, default: false }
});

const emit = defineEmits(['reveal-complete', 'reveal-tick']);

const revealedKeys = ref(new Set());
let revealTimer = null;

function isRevealed(key) {
  if (!props.streaming) return true;
  return revealedKeys.value.has(key);
}

function resetRevealState() {
  stopRevealTimer();
  revealedKeys.value = new Set();
}

function stopRevealTimer() {
  if (revealTimer) {
    clearInterval(revealTimer);
    revealTimer = null;
  }
}

function startRevealTimer() {
  if (revealTimer || !props.streaming) return;
  revealTimer = setInterval(tickReveal, SPEC_REVEAL_INTERVAL_MS);
}

function tryEmitRevealComplete() {
  if (!props.streaming || props.aiPending) return;
  const queue = buildSpecRevealQueue(props.spec);
  if (!queue.length) return;
  if (queue.every((key) => revealedKeys.value.has(key))) {
    stopRevealTimer();
    emit('reveal-complete');
  }
}

function tickReveal() {
  if (!props.streaming) return;

  const queue = buildSpecRevealQueue(props.spec);
  const next = queue.find((key) => !revealedKeys.value.has(key));
  if (!next) {
    tryEmitRevealComplete();
    return;
  }

  revealedKeys.value = new Set([...revealedKeys.value, next]);
  emit('reveal-tick');
  tryEmitRevealComplete();
}

watch(
  () => props.streaming,
  (active) => {
    if (active) {
      resetRevealState();
      startRevealTimer();
      tickReveal();
      return;
    }
    resetRevealState();
    revealedKeys.value = new Set(buildSpecRevealQueue(props.spec));
  },
  { immediate: true }
);

watch(
  () => props.spec,
  () => {
    if (!props.streaming) {
      revealedKeys.value = new Set(buildSpecRevealQueue(props.spec));
      return;
    }
    startRevealTimer();
    if (revealedKeys.value.size === 0) tickReveal();
  },
  { deep: true }
);

watch(
  () => props.aiPending,
  () => {
    if (props.streaming) tryEmitRevealComplete();
  }
);

onUnmounted(() => {
  stopRevealTimer();
});

function getContrastColor(hex) {
  const rgb = parseColor(hex);
  if (!rgb) return '#000000';
  return gcc(rgb);
}

function buildFavoriteName(label) {
  return `${props.spec.name || '配色方案'} · ${label}`;
}

function themeColor(key) {
  return props.spec.theme?.[key] || '';
}

function functionalColor(typeKey, fieldKey) {
  return props.spec.functional?.[typeKey]?.[fieldKey] || '';
}

function auxiliaryColor(key) {
  return props.spec.auxiliary?.[key] || '';
}

function neutralColor(mode, key) {
  return props.spec.neutral?.[mode]?.[key] || '';
}

function shadowValue(key) {
  return props.spec.shadows?.[key] || '';
}

const themeFields = computed(() => THEME_COLOR_FIELDS.filter(
  (field) => themeColor(field.key) && isRevealed(`theme:${field.key}`)
));

const functionalTypes = computed(() => FUNCTIONAL_COLOR_TYPES.filter(
  (type) => FUNCTIONAL_COLOR_FIELDS.some(
    (field) => functionalColor(type.key, field.key) && isRevealed(`functional:${type.key}:${field.key}`)
  )
));

const auxiliaryFields = computed(() => AUXILIARY_COLOR_FIELDS.filter(
  (field) => auxiliaryColor(field.key) && isRevealed(`auxiliary:${field.key}`)
));

const neutralLightFields = computed(() => NEUTRAL_COLOR_FIELDS.filter(
  (field) => neutralColor('light', field.key) && isRevealed(`neutral:light:${field.key}`)
));

const neutralDarkFields = computed(() => NEUTRAL_COLOR_FIELDS.filter(
  (field) => neutralColor('dark', field.key) && isRevealed(`neutral:dark:${field.key}`)
));

const shadowFields = computed(() => SHADOW_FIELDS.filter(
  (field) => shadowValue(field.key) && isRevealed(`shadow:${field.key}`)
));

const strokeItems = computed(() => (props.spec.strokes || []).filter(
  (stroke) => isRevealed(`stroke:${stroke.key}`)
));

const spacingItems = computed(() => (props.spec.spacing || []).filter(
  (space) => isRevealed(`spacing:${space.key}`)
));

const radiusItems = computed(() => (props.spec.radius || []).filter(
  (radius) => isRevealed(`radius:${radius.key}`)
));

const typographyItems = computed(() => (props.spec.typography || []).filter(
  (_, idx) => isRevealed(`typography:${idx}`)
));

function functionalFields(typeKey) {
  return FUNCTIONAL_COLOR_FIELDS.filter(
    (field) => functionalColor(typeKey, field.key) && isRevealed(`functional:${typeKey}:${field.key}`)
  );
}

const showHeader = computed(() => {
  if (!props.streaming) return props.spec.name || props.spec.description;
  return isRevealed('header:name') || isRevealed('header:desc');
});

const showTheme = computed(() => themeFields.value.length > 0);
const showFunctional = computed(() => functionalTypes.value.length > 0);
const showAuxiliary = computed(() => auxiliaryFields.value.length > 0);
const showNeutralLight = computed(() => neutralLightFields.value.length > 0);
const showNeutralDark = computed(() => neutralDarkFields.value.length > 0);
const showShadows = computed(() => shadowFields.value.length > 0);
const showStrokes = computed(() => strokeItems.value.length > 0);
const showSpacing = computed(() => spacingItems.value.length > 0);
const showRadius = computed(() => radiusItems.value.length > 0);
const showTypography = computed(() => typographyItems.value.length > 0);
</script>

<template>
  <div class="design-spec" :class="{ 'design-spec--streaming': streaming }">
    <!-- 方案标题 -->
    <div v-if="showHeader" class="design-spec-header">
      <div class="design-spec-header-text">
        <div v-if="spec.name && isRevealed('header:name')" class="design-spec-name">{{ spec.name }}</div>
        <div v-if="spec.description && isRevealed('header:desc')" class="design-spec-desc">{{ spec.description }}</div>
      </div>
    </div>

    <!-- 主题色 -->
    <section v-if="showTheme" class="spec-section">
      <h4 class="spec-section-title">主题色</h4>
      <div class="color-chip-grid">
        <div
          v-for="field in themeFields"
          :key="field.key"
          class="color-chip"
          :style="{ background: themeColor(field.key) }"
        >
          <div class="color-chip-text" :style="{ color: getContrastColor(themeColor(field.key)) }">
            <span class="color-chip-label">{{ field.label }}</span>
            <span class="color-chip-hex">{{ themeColor(field.key) }}</span>
          </div>
          <ColorActionGroup
            v-if="!streaming"
            :value="themeColor(field.key)"
            :copy-label="field.label"
            :favorite-name="buildFavoriteName(field.label)"
            variant="on-color"
            class="color-chip-action-group"
          />
        </div>
      </div>
    </section>

    <!-- 功能色 -->
    <section v-if="showFunctional" class="spec-section">
      <h4 class="spec-section-title">功能色</h4>
      <div
        v-for="type in functionalTypes"
        :key="type.key"
        class="spec-subsection"
      >
        <h5 class="spec-subsection-title">{{ type.label }}</h5>
        <div class="color-chip-grid">
          <div
            v-for="field in functionalFields(type.key)"
            :key="`${type.key}-${field.key}`"
            class="color-chip"
            :style="{ background: functionalColor(type.key, field.key) }"
          >
            <div
              class="color-chip-text"
              :style="{ color: getContrastColor(functionalColor(type.key, field.key)) }"
            >
              <span class="color-chip-label">{{ field.label }}</span>
              <span class="color-chip-hex">{{ functionalColor(type.key, field.key) }}</span>
            </div>
            <ColorActionGroup
              v-if="!streaming"
              :value="functionalColor(type.key, field.key)"
              :copy-label="`${type.label}·${field.label}`"
              :favorite-name="buildFavoriteName(`${type.label}·${field.label}`)"
              variant="on-color"
              class="color-chip-action-group"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- 辅助色 -->
    <section v-if="showAuxiliary" class="spec-section">
      <h4 class="spec-section-title">辅助色</h4>
      <div class="color-chip-grid color-chip-grid--6">
        <div
          v-for="field in auxiliaryFields"
          :key="field.key"
          class="color-chip"
          :style="{ background: auxiliaryColor(field.key) }"
        >
          <div class="color-chip-text" :style="{ color: getContrastColor(auxiliaryColor(field.key)) }">
            <span class="color-chip-label">{{ field.label }}</span>
            <span class="color-chip-hex">{{ auxiliaryColor(field.key) }}</span>
          </div>
          <ColorActionGroup
            v-if="!streaming"
            :value="auxiliaryColor(field.key)"
            :copy-label="field.label"
            :favorite-name="buildFavoriteName(field.label)"
            variant="on-color"
            class="color-chip-action-group"
          />
        </div>
      </div>
    </section>

    <!-- 中性色 -->
    <section v-if="showNeutralLight || showNeutralDark" class="spec-section">
      <h4 class="spec-section-title">中性色</h4>
      <div v-if="showNeutralLight" class="spec-subsection">
        <h5 class="spec-subsection-title">浅色模式</h5>
        <div class="neutral-row neutral-row--light">
          <div
            v-for="field in neutralLightFields"
            :key="`light-${field.key}`"
            class="neutral-item"
          >
            <span class="neutral-sample" :style="{ color: neutralColor('light', field.key) }">{{ field.label }}</span>
            <span class="neutral-hex">{{ neutralColor('light', field.key) }}</span>
            <ColorActionGroup
              v-if="!streaming"
              :value="neutralColor('light', field.key)"
              :copy-label="`浅色·${field.label}`"
              :favorite-name="buildFavoriteName(`浅色·${field.label}`)"
              variant="default"
              class="color-chip-action-group color-chip-action-group--inline"
            />
          </div>
        </div>
      </div>
      <div v-if="showNeutralDark" class="spec-subsection">
        <h5 class="spec-subsection-title">深色模式</h5>
        <div class="neutral-row neutral-row--dark">
          <div
            v-for="field in neutralDarkFields"
            :key="`dark-${field.key}`"
            class="neutral-item"
          >
            <span class="neutral-sample" :style="{ color: neutralColor('dark', field.key) }">{{ field.label }}</span>
            <span class="neutral-hex">{{ neutralColor('dark', field.key) }}</span>
            <ColorActionGroup
              v-if="!streaming"
              :value="neutralColor('dark', field.key)"
              :copy-label="`深色·${field.label}`"
              :favorite-name="buildFavoriteName(`深色·${field.label}`)"
              variant="default"
              class="color-chip-action-group color-chip-action-group--inline"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- 阴影 -->
    <section v-if="showShadows" class="spec-section">
      <h4 class="spec-section-title">阴影</h4>
      <div class="shadow-grid">
        <div
          v-for="field in shadowFields"
          :key="field.key"
          class="shadow-item"
        >
          <div class="shadow-preview" :style="{ boxShadow: shadowValue(field.key) }"></div>
          <div class="shadow-meta">
            <span class="shadow-label">{{ field.label }}</span>
            <span class="shadow-value">{{ shadowValue(field.key) }}</span>
            <ColorActionGroup
              v-if="!streaming"
              :value="shadowValue(field.key)"
              :copy-label="field.label"
              variant="default"
              :show-favorite="false"
              class="color-chip-action-group color-chip-action-group--inline"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- 描边 -->
    <section v-if="showStrokes" class="spec-section">
      <h4 class="spec-section-title">描边</h4>
      <div class="stroke-grid">
        <div v-for="stroke in strokeItems" :key="stroke.key" class="stroke-item">
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
    <section v-if="showSpacing" class="spec-section">
      <h4 class="spec-section-title">间距</h4>
      <div class="spacing-grid">
        <div v-for="space in spacingItems" :key="space.key" class="spacing-item">
          <div class="spacing-bar-wrap">
            <div class="spacing-bar" :style="{ width: `${Math.max(space.value, 2)}px` }"></div>
          </div>
          <span class="token-label">{{ space.label }}</span>
          <span class="token-value">{{ space.value }}px</span>
        </div>
      </div>
    </section>

    <!-- 圆角 -->
    <section v-if="showRadius" class="spec-section">
      <h4 class="spec-section-title">圆角</h4>
      <div class="radius-grid">
        <div v-for="radius in radiusItems" :key="radius.key" class="radius-item">
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
    <section v-if="showTypography" class="spec-section">
      <h4 class="spec-section-title">字阶与行高</h4>
      <div class="typography-list">
        <div
          v-for="(item, idx) in typographyItems"
          :key="`${item.size}-${item.lineHeight}-${idx}`"
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

    <div v-if="streaming" class="design-spec-streaming-tail">
      <span class="design-spec-streaming-cursor">|</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.design-spec {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.design-spec--streaming .color-chip,
.design-spec--streaming .neutral-item,
.design-spec--streaming .shadow-item,
.design-spec--streaming .stroke-item,
.design-spec--streaming .spacing-item,
.design-spec--streaming .radius-item,
.design-spec--streaming .typography-item {
  animation: specChunkReveal 0.25s ease both;
}

@keyframes specChunkReveal {
  from { opacity: 0.4; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

.design-spec-streaming-tail {
  padding: 4px 0 8px;
}

.design-spec-streaming-cursor {
  animation: specCursorBlink 1s step-end infinite;
  color: var(--accent);
  font-size: 16px;
  line-height: 1;
}

@keyframes specCursorBlink {
  50% { opacity: 0; }
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
  position: relative;
  min-height: 88px;
  border-radius: var(--radius-md);
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border: 1px solid var(--border-primary);
}

.color-chip-action-group {
  position: absolute;
  top: 4px;
  right: 4px;
  z-index: 1;

  &--inline {
    position: static;
    margin-top: 4px;
  }
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
