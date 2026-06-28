<script lang="ts" setup>
defineEmits(['back']);
</script>

<template>
  <Teleport to="#page-header-leading-slot">
    <span class="session-back" title="返回首页" @click="$emit('back')">
      <span class="iconfont icon-Back"></span>
    </span>
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
</style>
