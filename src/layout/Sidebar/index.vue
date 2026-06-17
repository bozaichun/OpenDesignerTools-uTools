<template>
  <aside class="sidebar" :class="{ collapsed: collapsed }">
    <nav class="sidebar-menu">
      <div
        v-for="item in menuItems"
        :key="item.id"
        class="menu-item"
        :class="{ active: currentTab === item.id }"
        @click="handleItemClick(item)"
        :title="item.label"
      >
        <span class="menu-icon" v-html="item.icon"></span>
        <span class="menu-label">{{ item.label }}</span>
      </div>
    </nav>

    <div class="sidebar-footer">
      <button
        class="collapse-toggle"
        @click="toggleCollapse"
        :title="collapsed ? '展开导航' : '收起导航'"
      >
        <span class="collapse-icon" :class="{ rotated: collapsed }">
          &#10094;
        </span>
        <span class="collapse-label">{{ collapsed ? '展开' : '收起' }}</span>
      </button>
    </div>
  </aside>
</template>

<script>
export default {
  name: 'Sidebar',
  props: {
    currentTab: {
      type: String,
      default: 'knowledge'
    },
    collapsed: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:currentTab', 'toggle-collapse'],
  data() {
    return {
      menuItems: [
        {
          id: 'knowledge',
          label: '色彩知识库',
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z"/><path d="M20 2H8a2 2 0 0 0-2 2v18a2 2 0 0 0 2 2h12V2z"/><path d="M9 6h7M9 10h7M9 14h5"/></svg>'
        },
        {
          id: 'convert',
          label: '颜色转换',
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 1-9 9c-4.97 0-9-4.03-9-9S6.03 3 12 3c2 0 3.9 0.64 5.46 1.73"/><path d="M21 4v5h-5"/><path d="M3 20v-5h5"/></svg>'
        },
        {
          id: 'image',
          label: '图片取色',
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/></svg>'
        }
      ]
    };
  },
  methods: {
    handleItemClick(item) {
      this.$emit('update:currentTab', item.id);
    },
    toggleCollapse() {
      this.$emit('toggle-collapse');
    }
  }
};
</script>

<style lang="scss" scoped>
.sidebar {
  width: 220px;
  flex: 0 0 220px;
  height: 100%;
  min-height: 0;
  background: var(--bg-card);
  border-right: 1px solid var(--border-primary);
  display: flex;
  flex-direction: column;
  transition: flex-basis 0.25s ease, width 0.25s ease;
  overflow: hidden;
}

.sidebar.collapsed {
  flex-basis: 68px;
  width: 68px;
}

.sidebar-menu {
  flex: 1 1 auto;
  min-height: 0;
  min-width: 0;
  padding: 16px 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
  overflow-x: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
  min-width: 0;
  overflow: hidden;

  &:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }

  &.active {
    background: var(--accent);
    color: var(--text-invert);
    box-shadow: var(--shadow-sm);
  }
}

.menu-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  color: inherit;

  :deep(svg) {
    width: 18px;
    height: 18px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
}

.sidebar.collapsed {
  .menu-label {
    opacity: 0;
    visibility: hidden;
    width: 0;
    height: 0;
    margin: 0;
    padding: 0;
    pointer-events: none;
    overflow: hidden;
  }

  .menu-item {
    justify-content: center;
    width: 100%;
    aspect-ratio: 1 / 1;
    padding: 10px;
    overflow: hidden;
    max-width: 52px;
    margin: 0 auto;
  }
}

.sidebar-footer {
  flex: 0 0 auto;
  padding: 12px;
  border-top: 1px solid var(--border-primary);
}

.collapse-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--bg-muted);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
    border-color: var(--border-strong);
  }
}

.collapse-icon {
  display: inline-block;
  transition: transform 0.25s ease;
  font-size: 12px;
  line-height: 1;

  &.rotated {
    transform: rotate(180deg);
  }
}

.sidebar.collapsed {
  .collapse-label {
    display: none;
  }

  .collapse-toggle {
    aspect-ratio: 1 / 1;
    padding: 8px;
    width: auto;
    max-width: 52px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

/* 响应式 */
@media (max-width: 640px) {
  .sidebar {
    width: 100% !important;
    flex: 0 0 auto;
    height: auto;
    border-right: none;
    border-bottom: 1px solid var(--border-primary);
  }

  .sidebar-menu {
    flex-direction: row;
    padding: 8px;
    overflow-x: auto;
    overflow-y: hidden;
    max-height: none;
  }

  .menu-item {
    padding: 8px 12px;
    font-size: 13px;
    flex-shrink: 0;
    aspect-ratio: auto;
    max-width: none;
  }

  .sidebar.collapsed {
    .menu-label {
      opacity: 1;
      pointer-events: auto;
    }

    .menu-item {
      justify-content: flex-start;
      padding: 8px 12px;
      aspect-ratio: auto;
      max-width: none;
    }
  }

  .sidebar-footer {
    display: none;
  }
}
</style>
