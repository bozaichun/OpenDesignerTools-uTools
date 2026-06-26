<script lang="ts" setup>
import { ref, watch, onMounted, onBeforeUnmount, nextTick, getCurrentInstance } from 'vue';
import { useRoute } from 'vue-router';

const SCROLL_SELECTOR = '.content-body';

const props = defineProps({
  threshold: {
    type: Number,
    default: 200
  }
});

const instance = getCurrentInstance();
const route = useRoute();
const visible = ref(false);
const scrollTarget = ref(null);

const isScrollable = (el) => {
  if (!el || el.nodeType !== 1) return false;
  const style = window.getComputedStyle(el);
  const overflowY = (style.overflowY || style.overflow || '').toLowerCase();
  return overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay';
};

const getScrollTarget = () => {
  const contentBody = document.querySelector(SCROLL_SELECTOR);
  if (contentBody && isScrollable(contentBody)) {
    return contentBody;
  }

  let el = instance?.proxy?.$el && instance.proxy.$el.parentElement;
  while (el && el.nodeType === 1) {
    if (isScrollable(el)) return el;
    el = el.parentElement;
  }

  return window;
};

const getScrollTop = () => {
  const target = scrollTarget.value || getScrollTarget();
  if (target === window) {
    return window.pageYOffset || document.documentElement.scrollTop || 0;
  }
  return target ? target.scrollTop : 0;
};

const handleScroll = () => {
  visible.value = getScrollTop() > props.threshold;
};

const unbindScrollTarget = () => {
  const target = scrollTarget.value;
  if (!target) return;
  if (target === window) {
    window.removeEventListener('scroll', handleScroll);
  } else {
    target.removeEventListener('scroll', handleScroll);
  }
};

const bindScrollTarget = () => {
  unbindScrollTarget();
  scrollTarget.value = getScrollTarget();
  const target = scrollTarget.value;
  if (target === window) {
    window.addEventListener('scroll', handleScroll, { passive: true });
  } else if (target) {
    target.addEventListener('scroll', handleScroll, { passive: true });
  }
  handleScroll();
};

const scrollToTop = () => {
  const target = getScrollTarget();
  if (!target) return;

  if (target === window) {
    window.scrollTo(0, 0);
  } else {
    target.scrollTop = 0;
  }

  scrollTarget.value = target;
  nextTick(() => {
    handleScroll();
  });
};

watch(() => route.fullPath, () => {
  nextTick(() => {
    bindScrollTarget();
  });
});

onMounted(() => {
  nextTick(() => {
    bindScrollTarget();
  });
});

onBeforeUnmount(() => {
  unbindScrollTarget();
});
</script>

<template>
  <transition name="back-to-top-fade">
    <button
      v-if="visible"
      class="back-to-top-btn"
      title="置顶"
      @click="scrollToTop"
    >
      <span class="iconfont icon-BackTop"></span>
      <span class="back-to-top-text">置顶</span>
    </button>
  </transition>
</template>

<style lang="scss" scoped>
.back-to-top-btn {
  position: fixed;
  right: 32px;
  bottom: 52px;
  width: 44px;
  height: 44px;
  padding: 0;
  background: var(--bg-card);
  color: var(--text-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-md);
  transition: all 0.2s ease;
  z-index: 998;
  overflow: hidden;

  .iconfont {
    font-size: 18px;
    line-height: 1;
    transition: opacity 0.2s ease;
  }

  .back-to-top-text {
    position: absolute;
    font-size: 13px;
    font-weight: 600;
    opacity: 0;
    white-space: nowrap;
    transition: opacity 0.2s ease;
  }

  &:hover {
    background: var(--accent);
    border-color: var(--accent);
    color: #fff;

    .iconfont {
      opacity: 0;
    }

    .back-to-top-text {
      opacity: 1;
      font-size: 10px;
    }
  }
}

.back-to-top-fade-enter-active,
.back-to-top-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.back-to-top-fade-enter-from,
.back-to-top-fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
