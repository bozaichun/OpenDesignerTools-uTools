<script lang="ts" setup>
import { computed } from 'vue';
import Selector from './Selector.vue';

const props = defineProps({
  total: {
    type: Number,
    default: 0
  },
  currentPage: {
    type: Number,
    default: 1
  },
  pageSize: {
    type: Number,
    default: 10
  },
  mode: {
    type: String,
    default: 'simple',
    validator: (value) => ['simple', 'full'].includes(value)
  },
  pageSizeOptions: {
    type: Array,
    default: () => [10, 20, 50, 100]
  },
  minTotal: {
    type: Number,
    default: 10
  }
});

const emit = defineEmits(['update:currentPage', 'update:pageSize', 'change']);

const shouldShow = computed(() => props.total > props.minTotal);

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)));

const visiblePages = computed(() => {
  const total = totalPages.value;
  const current = props.currentPage;
  const pages = [];
  const delta = 2;
  const range = [];
  let prev = null;

  for (let i = 1; i <= total; i += 1) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      range.push(i);
    }
  }

  range.forEach((page) => {
    if (prev !== null) {
      if (page - prev === 2) {
        pages.push(prev + 1);
      } else if (page - prev > 2) {
        pages.push('ellipsis');
      }
    }
    pages.push(page);
    prev = page;
  });

  return pages;
});

const goToPage = (page) => {
  const nextPage = Math.min(Math.max(1, page), totalPages.value);
  if (nextPage === props.currentPage) return;
  emit('update:currentPage', nextPage);
  emit('change', { currentPage: nextPage, pageSize: props.pageSize });
};

const handlePageSizeChange = (nextSize) => {
  const size = Number(nextSize);
  if (!size || size === props.pageSize) return;
  emit('update:pageSize', nextSize);
  emit('update:currentPage', 1);
  emit('change', { currentPage: 1, pageSize: nextSize });
};
</script>

<template>
  <div
    v-if="shouldShow"
    class="pagination"
    :class="[`is-${mode}`]"
  >
    <div v-if="mode === 'full'" class="pagination__meta">
      <span class="pagination__total">共 {{ total }} 条</span>
      <Selector
        variant="compact"
        :block="false"
        :model-value="pageSize"
        @change="handlePageSizeChange"
      >
        <option
          v-for="size in pageSizeOptions"
          :key="size"
          :value="size"
        >
          {{ size }}条/页
        </option>
      </Selector>
    </div>

    <div class="pagination__pager">
      <button
        type="button"
        class="pagination__btn"
        :class="{ 'is-disabled': currentPage <= 1 }"
        :disabled="currentPage <= 1"
        @click="goToPage(currentPage - 1)"
      >
        <span class="pagination__arrow">&lt;</span>
      </button>

      <template v-for="(page, idx) in visiblePages" :key="idx">
        <span
          v-if="page === 'ellipsis'"
          class="pagination__btn pagination__ellipsis"
        >...</span>
        <button
          v-else
          type="button"
          class="pagination__btn"
          :class="{ 'is-active': page === currentPage }"
          @click="goToPage(page)"
        >
          {{ page }}
        </button>
      </template>

      <button
        type="button"
        class="pagination__btn"
        :class="{ 'is-disabled': currentPage >= totalPages }"
        :disabled="currentPage >= totalPages"
        @click="goToPage(currentPage + 1)"
      >
        <span class="pagination__arrow">&gt;</span>
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.pagination {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pagination.is-simple {
  justify-content: center;
  padding-top: 16px;
}

.pagination.is-full {
  justify-content: space-between;
  padding-top: 16px;
}

.pagination__meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.pagination__total {
  font-size: 13px;
  color: var(--text-secondary);
  white-space: nowrap;
}

.pagination__pager {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.pagination.is-full .pagination__pager {
  margin-left: auto;
}

.pagination__btn {
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-muted);
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1;
  cursor: pointer;
  transition: all 0.15s ease;
}

.pagination__btn:hover:not(.is-disabled):not(.is-active):not(.pagination__ellipsis) {
  color: var(--accent);
  background: var(--accent-soft);
}

.pagination__btn.is-active {
  background: var(--accent);
  color: var(--text-invert);
  font-weight: 600;
}

.pagination__btn.is-disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.pagination__ellipsis {
  cursor: default;
  background: var(--bg-muted);
  color: var(--text-tertiary);
}

.pagination__arrow {
  font-size: 12px;
  line-height: 1;
}

@media (max-width: 640px) {
  .pagination.is-full {
    flex-direction: column;
    align-items: stretch;
  }

  .pagination.is-full .pagination__pager {
    margin-left: 0;
    justify-content: flex-end;
  }
}
</style>
