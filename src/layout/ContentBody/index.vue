<template>
  <section ref="bodyRef" class="content-body">
    <slot></slot>
  </section>
</template>

<script>
export default {
  name: 'ContentBody',
  watch: {
    '$route.fullPath'() {
      this.$nextTick(() => {
        const el = this.$refs.bodyRef;
        if (el) el.scrollTop = 0;
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.content-body {
  flex: 1 1 auto;
  min-height: 0;
  min-width: 0;
  background: var(--bg-card);
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
