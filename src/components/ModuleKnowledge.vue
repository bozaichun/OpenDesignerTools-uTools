<template>
  <div class="module-knowledge">
    <div class="knowledge-list">
      <div
        v-for="item in KNOWLEDGE_DATA"
        :key="item.id"
        class="knowledge-card"
        :class="{ expanded: expandedId === item.id }"
      >
        <div class="knowledge-header" @click="toggle(item.id)">
          <div class="knowledge-header-text">
            <h3 class="knowledge-title">{{ item.title }}</h3>
            <p class="knowledge-summary">{{ item.summary }}</p>
          </div>
          <span class="knowledge-expand-icon">▼</span>
        </div>

        <div v-if="expandedId === item.id" class="knowledge-body">
          <!-- RGB 原理的色卡展示 -->
          <div v-if="item.colorDemo" class="color-demo-row">
            <div
              v-for="c in item.colorDemo"
              :key="c.hex"
              class="color-demo-item"
            >
              <div
                class="color-demo-swatch"
                :style="{ background: c.hex }"
              ></div>
              <span class="color-demo-name">{{ c.name }}</span>
            </div>
          </div>

          <!-- 色环展示 -->
          <div v-if="item.colorWheel" class="color-wheel">
            <div
              v-for="cw in item.colorWheel"
              :key="cw.h"
              class="color-wheel-item"
            >
              <div
                class="color-wheel-swatch"
                :style="{ background: 'hsl(' + cw.h + ', 75%, 55%)' }"
              ></div>
              <span class="color-wheel-label">{{ cw.label }} {{ cw.h }}°</span>
            </div>
          </div>

          <!-- 正文 -->
          <div
            v-for="(section, sIdx) in item.sections"
            :key="sIdx"
            class="knowledge-section"
          >
            <h4 class="knowledge-section-title">{{ section.title }}</h4>
            <p class="knowledge-section-content">{{ section.content }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { KNOWLEDGE_DATA } from '../data/knowledge';

export default {
  name: 'ModuleKnowledge',
  data() {
    return {
      KNOWLEDGE_DATA,
      expandedId: null
    };
  },
  methods: {
    toggle(id) {
      this.expandedId = this.expandedId === id ? null : id;
    }
  }
};
</script>

<style lang="scss" scoped>
.module-knowledge {
  width: 100%;
  min-width: 0;
}

.knowledge-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

.knowledge-card {
  background: var(--bg-muted);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: border-color 0.15s ease;

  &.expanded {
    border-color: var(--accent);
  }
}

.knowledge-header {
  padding: 16px 18px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  transition: background 0.15s ease;

  &:hover {
    background: var(--bg-hover);
  }
}

.knowledge-header-text {
  flex: 1;
  min-width: 0;
}

.knowledge-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.knowledge-summary {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
}

.knowledge-expand-icon {
  font-size: 18px;
  color: var(--text-tertiary);
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.knowledge-card.expanded .knowledge-expand-icon {
  transform: rotate(180deg);
}

.knowledge-body {
  padding: 0 18px 18px;
  border-top: 1px dashed var(--border-primary);
}

.knowledge-section {
  margin-top: 16px;
}

.knowledge-section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--accent);
  margin: 0 0 8px 0;
}

.knowledge-section-content {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.8;
  white-space: pre-line;
}

.color-wheel {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
  margin: 12px 0;
}

.color-wheel-item {
  text-align: center;
}

.color-wheel-swatch {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 50%;
  border: 1px solid var(--border-primary);
  margin-bottom: 4px;
  box-shadow: var(--shadow-sm);
}

.color-wheel-label {
  font-size: 11px;
  color: var(--text-tertiary);
}

.color-demo-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin: 12px 0;
}

.color-demo-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-sm);
}

.color-demo-swatch {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid var(--border-primary);
}

.color-demo-name {
  font-size: 11px;
  color: var(--text-secondary);
  font-family: 'SF Mono', Consolas, Monaco, monospace;
}

@media (max-width: 640px) {
  .color-wheel {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (min-width: 1024px) {
  .color-wheel {
    grid-template-columns: repeat(6, 1fr);
  }
}
</style>
