<script lang="ts" setup>
import { useRouter } from 'vue-router';
import LayoutContainer from '../../components/LayoutContainer.vue';
import GridLayout from '../../components/GridLayout.vue';
import {
  QUICK_START_STEPS,
  MAIN_FEATURES,
  ICM_MODE_FEATURES,
  USAGE_TIPS
} from '../../data/functionOverview.js';

const router = useRouter();
const quickStartSteps = QUICK_START_STEPS;
const mainFeatures = MAIN_FEATURES;
const icmModeFeatures = ICM_MODE_FEATURES;
const usageTips = USAGE_TIPS;

function goToRouteId(routeId) {
  router.push('/' + routeId);
}

function goToRouteName(routeName) {
  router.push({ name: routeName });
}

function handleQuickStart(item) {
  if (item.routeName) {
    goToRouteName(item.routeName);
    return;
  }
  goToRouteId(item.routeId);
}

function handleFeatureClick(item) {
  if (item.routeId === 'IntelligentColorMatching') {
    goToRouteName('BozaiChat');
    return;
  }
  goToRouteId(item.routeId);
}
</script>

<template>
  <LayoutContainer variant="module" tag="div" class="module-overview">
    <!-- 页头介绍 -->
    <section class="hero-section">
      <div class="hero-content">
        <h2 class="hero-title">设计师工具</h2>
        <p class="hero-desc">
          从下方卡片或左侧导航进入对应功能。涵盖色值转换、图片取色、智能配色、色板管理与印刷调色等完整工作流。
        </p>
      </div>
      <div class="hero-tags">
        <span class="hero-tag">格式转换</span>
        <span class="hero-tag">图片取色</span>
        <span class="hero-tag">智能配色</span>
        <span class="hero-tag">色板管理</span>
        <span class="hero-tag">本地收藏</span>
      </div>
    </section>

    <!-- 快速开始 -->
    <section class="quick-section">
      <h3 class="section-title">快速开始</h3>
      <GridLayout class="quick-grid" :cols="3" :cols-tablet="2" :cols-mobile="1">
        <div
          v-for="item in quickStartSteps"
          :key="item.step"
          class="quick-card"
          @click="handleQuickStart(item)"
        >
          <div class="quick-step">0{{ item.step }}</div>
          <span :class="['iconfont', item.icon, 'quick-icon']"></span>
          <div class="quick-title">{{ item.title }}</div>
          <div class="quick-desc">{{ item.desc }}</div>
          <button class="quick-btn" @click.stop="handleQuickStart(item)">
            立即使用
            <span class="iconfont icon-UseImmediately quick-btn-icon"></span>
          </button>
        </div>
      </GridLayout>
    </section>

    <!-- 全部功能：与侧边栏导航一致 -->
    <section class="feature-section">
      <h3 class="section-title">全部功能</h3>
      <GridLayout class="feature-grid" mode="auto-fill" min-col-width="220px">
        <div
          v-for="item in mainFeatures"
          :key="item.routeId"
          class="feature-card"
          @click="handleFeatureClick(item)"
        >
          <div class="feature-card-header">
            <span :class="['iconfont', item.icon, 'feature-icon']"></span>
            <span class="feature-label">{{ item.label }}</span>
          </div>
          <p class="feature-desc">{{ item.desc }}</p>
          <span class="feature-link">
            进入功能
            <span class="iconfont icon-UseImmediately feature-link-icon"></span>
          </span>
        </div>
      </GridLayout>
    </section>

    <!-- 智能配色子模式 -->
    <section class="icm-section">
      <h3 class="section-title">智能配色 · 模式入口</h3>
      <GridLayout class="icm-grid" :cols="5" :cols-tablet="3" :cols-mobile="2">
        <div
          v-for="item in icmModeFeatures"
          :key="item.routeName"
          class="icm-card"
          @click="goToRouteName(item.routeName)"
        >
          <span v-if="item.badge" class="icm-badge">{{ item.badge }}</span>
          <span :class="['iconfont', item.icon, 'icm-icon']"></span>
          <div class="icm-label">{{ item.label }}</div>
          <p class="icm-desc">{{ item.desc }}</p>
        </div>
      </GridLayout>
    </section>

    <!-- 使用提示 -->
    <section class="tips-section">
      <h3 class="section-title">使用提示</h3>
      <ul class="tips-list">
        <li v-for="tip in usageTips" :key="tip">{{ tip }}</li>
      </ul>
    </section>
  </LayoutContainer>
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
  max-width: 720px;
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

.quick-section,
.feature-section,
.icm-section {
  margin-bottom: 28px;
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
  font-size: 12px;
  line-height: 1;
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
  font-size: 12px;
  line-height: 1;
}

.icm-card {
  position: relative;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  padding: 16px 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 132px;

  &:hover {
    border-color: var(--accent);
    box-shadow: var(--shadow-md);
    transform: translateY(-1px);
  }
}

.icm-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 1px 8px;
  font-size: 10px;
  font-weight: 700;
  color: var(--text-invert);
  background: var(--accent);
  border-radius: var(--radius-pill);
}

.icm-icon {
  display: block;
  font-size: 22px;
  color: var(--accent);
  line-height: 1;
  margin-bottom: 10px;
}

.icm-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 6px;
}

.icm-desc {
  margin: 0;
  font-size: 11px;
  color: var(--text-tertiary);
  line-height: 1.5;
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

@media (max-width: 640px) {
  .hero-section {
    padding: 18px 16px;
  }

  .hero-title {
    font-size: 18px;
  }
}
</style>
