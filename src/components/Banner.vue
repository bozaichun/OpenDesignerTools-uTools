<script lang="ts" setup>
import { computed, useSlots } from 'vue';

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  /** icon | image | url，默认 iconfont 图标 */
  mode: {
    type: String,
    default: 'icon',
    validator: (value) => ['icon', 'image', 'url'].includes(value)
  },
  icon: {
    type: String,
    default: 'icon-Areality-PrintingTool'
  },
  /** 项目静态图片（Vite import 或 public 路径） */
  image: {
    type: String,
    default: ''
  },
  /** 远程图片链接 */
  imageUrl: {
    type: String,
    default: ''
  }
});

const slots = useSlots();

const hasDescription = computed(() => {
  return Boolean(props.description) || Boolean(slots.description);
});

const hasVisual = computed(() => {
  if (slots.icon) return true;
  if (props.mode === 'icon') return Boolean(props.icon);
  if (props.mode === 'image') return Boolean(props.image);
  if (props.mode === 'url') return Boolean(props.imageUrl);
  return false;
});

const isImageMode = computed(() => props.mode === 'image' || props.mode === 'url');

const visualSrc = computed(() => {
  if (props.mode === 'image') return props.image;
  if (props.mode === 'url') return props.imageUrl;
  return '';
});
</script>

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
    <div
      v-if="hasVisual"
      class="app-banner__icon"
      :class="{ 'app-banner__icon--image': isImageMode }"
      aria-hidden="true"
    >
      <slot name="icon">
        <span v-if="mode === 'icon'" :class="['iconfont', icon]"></span>
        <img
          v-else
          class="app-banner__image"
          :src="visualSrc"
          alt=""
        />
      </slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
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
  width: 110px;
  height: 110px;
  border-radius: var(--radius-lg);
  color: var(--accent);
}

.app-banner__icon .iconfont {
  font-size: 36px;
  line-height: 1;
}

.app-banner__icon--image {
  padding: 6px;
  overflow: hidden;
}

.app-banner__image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
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
