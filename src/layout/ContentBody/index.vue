<script lang="ts" setup>
import { ref, watch, nextTick } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const bodyRef = ref(null);

watch(
  () => route.fullPath,
  () => {
    nextTick(() => {
      const el = bodyRef.value;
      if (el) el.scrollTop = 0;
    });
  }
);
</script>

<template>
  <section ref="bodyRef" class="content-body">
    <slot></slot>
  </section>
</template>

<style lang="scss" scoped>
.content-body {
  flex: 1 1 auto;
  min-height: 0;
  min-width: 0;
  padding: 20px;
  overflow: auto;
  overflow-x: hidden;
  background: var(--bg-card);
}

@media (max-width: 640px) {
  .content-body {
    padding: 14px;
  }
}
</style>
