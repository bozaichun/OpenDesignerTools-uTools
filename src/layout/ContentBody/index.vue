<template>
  <section class="content-body">
    <slot></slot>
  </section>
</template>

<script>
export default {
  name: 'ContentBody'
};
</script>

<style lang="scss" scoped>
.content-body {
  flex: 1 1 auto;
  min-height: 0;
  min-width: 0;
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-primary);
  padding: 20px;
  overflow: auto;
  overflow-x: hidden;
}

@media (max-width: 640px) {
  .content-body {
    padding: 14px;
  }
}
</style>
