<script lang="ts" setup>
import { computed } from 'vue';
import { truncateSessionTitle } from './intelligentColorMatchingUtils';

const props = defineProps({
  sessionTitle: { type: String, default: '' }
});

defineEmits(['back']);

const displayTitle = computed(() => truncateSessionTitle(props.sessionTitle));
const showTooltip = computed(() => props.sessionTitle.trim().length > 12);
</script>

<template>
  <Teleport to="#page-header-leading-slot">
    <span class="session-back" title="返回首页" @click="$emit('back')">
      <span class="iconfont icon-Back"></span>
    </span>
  </Teleport>

  <Teleport to="#page-header-center-slot">
    <div v-if="sessionTitle" class="session-header-title">
      <span class="session-header-text">{{ displayTitle }}</span>
      <span v-if="showTooltip" class="session-header-tip">{{ sessionTitle }}</span>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
.session-back {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  color: var(--accent);
  cursor: pointer;
  user-select: none;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  transition: all 0.15s ease;
  flex-shrink: 0;

  .iconfont {
    font-size: 16px;
    line-height: 1;
  }

  &:hover {
    background: var(--accent);
    color: var(--text-invert);
    border-color: var(--accent);
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }

  &:active {
    transform: translateY(0);
  }
}

.session-header-title {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  max-width: 100%;
  min-width: 0;
  padding: 4px 12px;
  border-radius: var(--radius-md);
  background: var(--bg-muted);
  border: 1px solid var(--border-primary);
  cursor: default;
}

.session-header-text {
  min-width: 0;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.session-header-tip {
  visibility: hidden;
  opacity: 0;
  position: absolute;
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  width: max-content;
  max-width: min(360px, 70vw);
  padding: 8px 12px;
  background: var(--tooltip-bg);
  color: var(--tooltip-text);
  border-radius: 6px;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.5;
  text-align: left;
  box-shadow: var(--shadow-md);
  pointer-events: none;
  transition: opacity 0.15s ease, visibility 0.15s ease;
}

.session-header-title:hover .session-header-tip {
  visibility: visible;
  opacity: 1;
}
</style>
