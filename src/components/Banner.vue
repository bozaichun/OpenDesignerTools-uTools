<template>
  <div class="app-banner">
    <div class="app-banner__content">
      <h3 class="app-banner__title">
        <slot name="title">{{ title }}</slot>
      </h3>
      <p v-if="hasDescription" class="app-banner__description">
        <slot name="description">{{ description }}</slot>
      </p>
      <div v-if="$slots.extra" class="app-banner__extra">
        <slot name="extra"></slot>
      </div>
    </div>
    <div v-if="hasIcon" class="app-banner__icon" aria-hidden="true">
      <slot name="icon">
        <span :class="['iconfont', icon]"></span>
      </slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AppBanner',
  props: {
    title: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: 'icon-Areality-PrintingTool'
    }
  },
  computed: {
    hasDescription() {
      return Boolean(this.description) || Boolean(this.$slots.description);
    },
    hasIcon() {
      return Boolean(this.icon) || Boolean(this.$slots.icon);
    }
  }
};
</script>

<style scoped>
.app-banner {
  box-sizing: border-box;
  height: 168px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 24px 28px;
  margin-bottom: 20px;
  background: var(--accent-soft);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
}

.app-banner__content {
  flex: 1;
  min-width: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.app-banner__title {
  margin: 0 0 10px;
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.3;
}

.app-banner__description {
  margin: 0;
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.7;
  max-width: 640px;
}

.app-banner__extra {
  margin-top: 16px;
}

.app-banner__icon {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border-radius: var(--radius-lg);
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  color: var(--accent);
  box-shadow: var(--shadow-sm);
}

.app-banner__icon .iconfont {
  font-size: 36px;
  line-height: 1;
}

@media (max-width: 640px) {
  .app-banner {
    height: auto;
    min-height: 220px;
    align-items: flex-start;
    padding: 20px;
  }

  .app-banner__title {
    font-size: 20px;
  }

  .app-banner__description {
    font-size: 13px;
  }

  .app-banner__icon {
    width: 56px;
    height: 56px;
  }

  .app-banner__icon .iconfont {
    font-size: 28px;
  }
}
</style>
