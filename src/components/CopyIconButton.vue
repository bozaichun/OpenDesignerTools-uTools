<script lang="ts" setup>
import { ref, onUnmounted } from 'vue';
import { copyToClipboard, showToast } from '../utils/colorUtils';

const props = defineProps({
  value: {
    type: String,
    required: true
  },
  label: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: '复制'
  },
  showToastMsg: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['copied']);

const copied = ref(false);
let resetTimer = null;

function handleCopy() {
  copyToClipboard(props.value);
  if (props.showToastMsg) {
    const displayLabel = props.label || props.value;
    showToast(null, `已复制 ${displayLabel}: ${props.value}`, 'success');
  }
  copied.value = true;
  clearTimeout(resetTimer);
  resetTimer = setTimeout(() => {
    copied.value = false;
  }, 2000);
  emit('copied', props.value);
}

onUnmounted(() => {
  clearTimeout(resetTimer);
});
</script>

<template>
  <button
    type="button"
    class="copy-icon-btn"
    :class="{ 'copy-icon-btn--copied': copied }"
    :title="copied ? '已复制' : title"
    @click.stop="handleCopy"
  >
    <span
      class="iconfont"
      :class="copied ? 'icon-Check' : 'icon-Copy'"
    ></span>
  </button>
</template>

<style lang="scss" scoped>
.copy-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 4px;
  color: var(--text-secondary);
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;

  .iconfont {
    font-size: 11px;
    line-height: 1;
  }

  &:hover {
    background: var(--accent);
    border-color: var(--accent);
    color: var(--text-invert);
  }

  &--copied {
    background: var(--success-bg);
    border-color: var(--success);
    color: var(--success);
  }

  &--copied:hover {
    background: var(--success-bg);
    border-color: var(--success);
    color: var(--success);
  }
}
</style>
