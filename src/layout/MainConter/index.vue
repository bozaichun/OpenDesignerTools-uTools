<template>
  <main class="main-content">
    <slot></slot>
  </main>
</template>

<script>
export default {
  name: 'MainContent'
};
</script>

<style lang="scss" scoped>
.main-content {
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow: hidden;
}

@media (max-width: 640px) {
  .main-content {
    padding: 12px;
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
