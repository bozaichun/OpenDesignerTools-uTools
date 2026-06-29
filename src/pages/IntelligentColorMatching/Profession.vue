<script lang="ts" setup>
import { ref, computed, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Selector from '../../components/Selector.vue';
import SemanticHistoryDrawer from './SemanticHistoryDrawer.vue';
import { ADVANCED_TABS, getProfessionHeaderDesc } from './intelligentColorMatchingUtils.js';

const route = useRoute();
const router = useRouter();
const historyDrawerVisible = ref(false);
const semanticInSession = ref(false);
const modeRef = ref(null);

const currentTabKey = computed(() => {
  const tab = ADVANCED_TABS.find((item) => item.routeName === route.name);
  return tab?.key || ADVANCED_TABS[0].key;
});

const isSemanticRoute = computed(() => route.name === 'IcmSemantic');

const headerDesc = computed(() => getProfessionHeaderDesc(route.name));

function handleTabChange(key) {
  const tab = ADVANCED_TABS.find((item) => item.key === key);
  if (tab && tab.routeName !== route.name) {
    router.push({ name: tab.routeName });
  }
}

function openHistoryDrawer() {
  historyDrawerVisible.value = true;
}

async function handleLoadSemanticHistory(session) {
  if (route.name !== 'IcmSemantic') {
    await router.push({ name: 'IcmSemantic' });
  }
  await nextTick();
  modeRef.value?.loadSemanticHistory?.(session);
}

function handleNewSemanticSession() {
  modeRef.value?.startNewSemanticSession?.();
}

function handleSemanticSessionChange(inSession) {
  semanticInSession.value = !!inSession;
}

watch(() => route.name, (name) => {
  if (name !== 'IcmSemantic') {
    semanticInSession.value = false;
  }
});
</script>

<template>
  <div class="icm-profession-layout">
    <!-- 页头左侧：当前专业模块说明（单实例，避免 keep-alive 多 Teleport 叠加） -->
    <Teleport to="#page-header-leading-slot">
      <span v-if="headerDesc" :key="route.name" class="semantic-header-desc">{{ headerDesc }}</span>
    </Teleport>

    <!-- 页头右侧：新会话 / 历史记录 / 专业模式模块切换 -->
    <Teleport to="#intelligent-color-matching-header-slot">
      <div class="icm-header-tools">
        <button
          v-if="isSemanticRoute && semanticInSession"
          class="icm-new-session-btn"
          title="新会话"
          @click="handleNewSemanticSession"
        >
          新会话
        </button>
        <button
          v-if="isSemanticRoute"
          class="icm-history-btn"
          title="历史记录"
          @click="openHistoryDrawer"
        >
          <span class="iconfont icon-Areality-HistoricalRecord"></span>
        </button>
        <Selector
          :model-value="currentTabKey"
          class="header-module-selector"
          :block="false"
          :flex="false"
          @update:model-value="handleTabChange"
        >
          <option v-for="tab in ADVANCED_TABS" :key="tab.key" :value="tab.key">{{ tab.label }}</option>
        </Selector>
      </div>
    </Teleport>

    <SemanticHistoryDrawer
      v-model:visible="historyDrawerVisible"
      @select="handleLoadSemanticHistory"
    />

    <router-view v-slot="{ Component }">
      <keep-alive>
        <component
          :is="Component"
          :key="route.name"
          ref="modeRef"
          @semantic-session-change="handleSemanticSessionChange"
        />
      </keep-alive>
    </router-view>
  </div>
</template>

<style lang="scss" scoped>
.icm-profession-layout {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  width: 100%;
}
</style>
