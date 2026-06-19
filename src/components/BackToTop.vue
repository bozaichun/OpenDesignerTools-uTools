<template>
  <transition name="back-to-top-fade">
    <button
      v-if="visible"
      class="back-to-top-btn"
      :title="'置顶'"
      @click="scrollToTop"
    >
      <span class="iconfont icon-BackTop"></span>
      <span class="back-to-top-text">置顶</span>
    </button>
  </transition>
</template>

<script>
export default {
  name: 'BackToTop',
  props: {
    threshold: {
      type: Number,
      default: 200
    },
    smooth: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      visible: false,
      scrollTarget: null
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.scrollTarget = this.findScrollTarget();
      const target = this.scrollTarget;
      target.addEventListener('scroll', this.handleScroll);
      this.handleScroll();
    });
  },
  beforeUnmount() {
    const target = this.scrollTarget;
    if (target) {
      target.removeEventListener('scroll', this.handleScroll);
    }
  },
  methods: {
    isScrollable(el) {
      if (!el || el.nodeType !== 1) return false;
      const style = window.getComputedStyle(el);
      const overflow = (style.overflowY || style.overflow || '').toLowerCase();
      return overflow === 'auto' || overflow === 'scroll';
    },
    findScrollTarget() {
      let el = this.$el && this.$el.parentElement;
      while (el && el.nodeType === 1) {
        if (this.isScrollable(el)) return el;
        el = el.parentElement;
      }
      const known = document.querySelector('.content-body, .module-preset, .module-color, .module-image, .module-knowledge');
      if (known && this.isScrollable(known)) return known;
      const body = document.body;
      if (this.isScrollable(body)) return body;
      return window;
    },
    handleScroll() {
      const target = this.scrollTarget;
      let current = 0;
      if (target === window) {
        current = window.pageYOffset || document.documentElement.scrollTop;
      } else {
        current = target ? target.scrollTop : 0;
      }
      this.visible = current > this.threshold;
    },
    scrollToTop() {
      const target = this.scrollTarget;
      if (this.smooth) {
        if (target === window) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (target) {
          target.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else {
        if (target === window) {
          window.scrollTo(0, 0);
        } else if (target) {
          target.scrollTop = 0;
        }
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.back-to-top-btn {
  position: fixed;
  right: 32px;
  bottom: 40px;
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
