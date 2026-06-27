<script lang="ts" setup>
import { useRouter } from 'vue-router';
import {
  QUICK_START_STEPS,
  FEATURE_GROUPS,
  USAGE_TIPS
} from '../../data/functionOverview.js';

const router = useRouter();
const quickStartSteps = QUICK_START_STEPS;
const featureGroups = FEATURE_GROUPS;
const usageTips = USAGE_TIPS;

function goToFeature(routeId) {
  router.push('/' + routeId);
}
</script>

<template>
  <div class="module-overview">
    <!-- 页头介绍 -->
    <section class="hero-section">
      <div class="hero-content">
        <h2 class="hero-title">颜色值转换器</h2>
        <p class="hero-desc">
          一站式色值工具集，涵盖格式转换、图片取色、智能配色、色板管理与印刷辅助。
          从左侧导航或下方卡片即可快速进入各功能。
        </p>
      </div>
      <div class="hero-tags">
        <span class="hero-tag">HEX / RGB / CMYK</span>
        <span class="hero-tag">图片取色</span>
        <span class="hero-tag">色板管理</span>
        <span class="hero-tag">本地收藏</span>
      </div>
    </section>

    <!-- 快速开始 -->
    <section class="quick-section">
      <h3 class="section-title">快速开始</h3>
      <div class="quick-grid">
        <div
          v-for="item in quickStartSteps"
          :key="item.step"
          class="quick-card"
          @click="goToFeature(item.routeId)"
        >
          <div class="quick-step">0{{ item.step }}</div>
          <span :class="['iconfont', item.icon, 'quick-icon']"></span>
          <div class="quick-title">{{ item.title }}</div>
          <div class="quick-desc">{{ item.desc }}</div>
          <button class="quick-btn" @click.stop="goToFeature(item.routeId)">
            立即使用
            <span class="iconfont icon-Expand quick-btn-icon"></span>
          </button>
        </div>
      </div>
    </section>

    <section
      v-for="group in featureGroups"
      :key="group.title"
      class="feature-section"
    >
      <h3 class="section-title">{{ group.title }}</h3>
      <div class="feature-grid">
        <div
          v-for="item in group.items"
          :key="item.routeId"
          class="feature-card"
          @click="goToFeature(item.routeId)"
        >
          <div class="feature-card-header">
            <span :class="['iconfont', item.icon, 'feature-icon']"></span>
            <span class="feature-label">{{ item.label }}</span>
          </div>
          <p class="feature-desc">{{ item.desc }}</p>
          <span class="feature-link">
            进入功能
            <span class="iconfont icon-Expand feature-link-icon"></span>
          </span>
        </div>
      </div>
    </section>

    <!-- 使用提示 -->
    <section class="tips-section">
      <h3 class="section-title">使用提示</h3>
      <ul class="tips-list">
        <li v-for="tip in usageTips" :key="tip">{{ tip }}</li>
      </ul>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.module-overview {
  width: 100%;
  min-width: 0;
}

.hero-section {
  background: var(--accent-soft);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: 24px 28px;
  margin-bottom: 28px;
}

.hero-title {
  margin: 0 0 10px;
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.3;
}

.hero-desc {
  margin: 0;
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.7;
  max-width: 640px;
}

.hero-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.hero-tag {
  padding: 4px 12px;
  font-size: 12px;
  color: var(--accent);
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-pill);
  font-weight: 500;
}

.section-title {
  margin: 0 0 14px;
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
}

.quick-section {
  margin-bottom: 28px;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.quick-card {
  position: relative;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  padding: 20px 16px 16px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--accent);
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }
}

.quick-step {
  position: absolute;
  top: 12px;
  right: 14px;
  font-size: 28px;
  font-weight: 800;
  color: var(--accent-soft);
  line-height: 1;
  font-family: 'SF Mono', Consolas, Monaco, monospace;
  opacity: 0.8;
}

.quick-icon {
  font-size: 24px;
  color: var(--accent);
  line-height: 1;
  display: block;
  margin-bottom: 10px;
}

.quick-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 6px;
}

.quick-desc {
  font-size: 12px;
  color: var(--text-tertiary);
  line-height: 1.5;
  margin-bottom: 14px;
  min-height: 36px;
}

.quick-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 12px;
  font-size: 12px;
  font-weight: 500;
  color: var(--accent);
  background: var(--accent-soft);
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: var(--accent);
    color: var(--text-invert);
  }
}

.quick-btn-icon {
  font-size: 10px;
  transform: rotate(-90deg);
}

.feature-section {
  margin-bottom: 24px;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 10px;
}

.feature-card {
  background: var(--bg-muted);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  padding: 14px 16px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--accent);
    background: var(--accent-soft);

    .feature-link {
      color: var(--accent);
    }
  }
}

.feature-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.feature-icon {
  font-size: 18px;
  color: var(--accent);
  line-height: 1;
}

.feature-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.feature-desc {
  margin: 0 0 10px;
  font-size: 12px;
  color: var(--text-tertiary);
  line-height: 1.6;
}

.feature-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  transition: color 0.15s ease;
}

.feature-link-icon {
  font-size: 10px;
  transform: rotate(-90deg);
}

.tips-section {
  background: var(--bg-muted);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  padding: 16px 20px;
}

.tips-list {
  margin: 0;
  padding-left: 18px;
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.8;
}

@media (max-width: 900px) {
  .quick-grid {
    grid-template-columns: 1fr;
  }

  .feature-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .hero-section {
    padding: 18px 16px;
  }

  .hero-title {
    font-size: 18px;
  }
}
</style>
