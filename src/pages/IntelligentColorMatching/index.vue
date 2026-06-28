<script lang="ts" setup>
import { ref, provide } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const chatInSession = ref(false);

provide('setIcmChatInSession', (active) => {
  chatInSession.value = !!active;
});
</script>

<template>
  <div class="module-intelligent">
    <!-- 页头左侧：模式切换 -->
    <Teleport to="#page-header-leading-slot">
      <div v-if="!chatInSession" class="mode-row">
        <router-link
          :to="{ name: 'BozaiChat' }"
          class="mode-btn"
          :class="{ active: route.name === 'BozaiChat' }"
          title="智能模式"
        >
          <span class="iconfont icon-Areality-AIMode mode-btn-icon"></span>
        </router-link>
        <router-link
          :to="{ name: 'Profession' }"
          class="mode-btn"
          :class="{ active: route.name === 'Profession' }"
          title="专业模式"
        >
          <span class="iconfont icon-Areality-ProfessionalMode mode-btn-icon"></span>
        </router-link>
      </div>
    </Teleport>

    <div class="module-intelligent-body">
      <router-view />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.module-intelligent {
  width: calc(100% + 40px);
  min-width: 0;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 56px - 36px);
  min-height: calc(100vh - 56px - 36px);
  margin: -20px;
  padding: 0 20px;
  box-sizing: border-box;
}
.module-intelligent-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
</style>

<style lang="scss">
.intelligent-color-matching-header-slot .icm-header-tools {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.intelligent-color-matching-header-slot .icm-new-session-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 30px;
  padding: 0 12px;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
  flex-shrink: 0;
  &:hover {
    border-color: var(--accent);
    color: var(--accent);
    background: var(--accent-soft);
  }
}
.intelligent-color-matching-header-slot .icm-history-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  padding: 0;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
  flex-shrink: 0;
  .iconfont { font-size: 16px; line-height: 1; }
  &:hover {
    border-color: var(--accent);
    color: var(--accent);
    background: var(--accent-soft);
  }
}
.page-header-leading-slot .mode-row {
  display: inline-flex;
  gap: 2px;
  background: var(--bg-muted);
  padding: 2px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-primary);
  flex-shrink: 0;
}
.page-header-leading-slot .semantic-header-desc {
  font-size: 12px;
  color: var(--text-tertiary);
  line-height: 1.5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: min(480px, 38vw);
  min-width: 0;
}
.page-header-leading-slot .mode-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all 0.15s ease;
  flex-shrink: 0;
  text-decoration: none;
  .mode-btn-icon {
    font-size: 13px;
    line-height: 1;
  }
  &:hover { color: var(--text-primary); }
  &.active {
    background: var(--accent);
    color: var(--text-invert);
  }
}
</style>
