<template>
  <main class="main-content">
    <slot></slot>
    <BackToTop />
  </main>
</template>

<script>
import BackToTop from '../../components/BackToTop.vue';

export default {
  name: 'MainContent',
  components: { BackToTop }
};
</script>

<style lang="scss" scoped>
.main-content {
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

@media (max-width: 640px) {
  .main-content {
    height: auto;
    flex: 1 1 auto;
  }
}

@media (min-width: 1024px) {
  .main-content {
    max-width: 100%;
  }
}
</style>
