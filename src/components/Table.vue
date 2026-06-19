<template>
  <div
    class="data-table"
    :class="{
      'is-stripe': stripe,
      'is-border': border,
      'is-highlight': highlightCurrentRow
    }"
  >
    <table class="data-table__inner">
      <thead>
        <tr>
          <th
            v-for="col in columns"
            :key="col.prop"
            :style="getColStyle(col)"
            :class="['data-table__th', `align-${col.align || 'left'}`]"
          >
            {{ col.label }}
          </th>
          <th
            v-if="hasActionSlot"
            class="data-table__th data-table__th--action"
            :style="{ width: actionWidth }"
          >
            {{ actionLabel }}
          </th>
        </tr>
      </thead>
      <tbody>
        <template v-for="(row, index) in data" :key="getRowKey(row, index)">
          <tr
            :class="getRowClass(row, index)"
            @click="handleRowClick(row, index)"
          >
            <td
              v-for="col in columns"
              :key="col.prop"
              :class="['data-table__td', `align-${col.align || 'left'}`]"
            >
              <slot
                :name="col.slot || col.prop"
                :row="row"
                :index="index"
                :value="row[col.prop]"
              >
                {{ formatCell(row, col) }}
              </slot>
            </td>
            <td v-if="hasActionSlot" class="data-table__td data-table__td--action">
              <slot name="action" :row="row" :index="index" />
            </td>
          </tr>
          <tr
            v-if="hasExpandSlot && isRowExpanded(row, index)"
            class="data-table__tr data-table__tr--expand"
          >
            <td
              :colspan="totalColspan"
              class="data-table__td data-table__td--expand"
            >
              <slot name="expand" :row="row" :index="index" />
            </td>
          </tr>
        </template>
      </tbody>
    </table>
    <div v-if="!data.length" class="data-table__empty">
      {{ emptyText }}
    </div>
  </div>
</template>

<script>
const ROW_STATUS_MAP = {
  success: 'row-status--success',
  warning: 'row-status--warning',
  info: 'row-status--info',
  danger: 'row-status--danger'
};

export default {
  name: 'DataTable',
  props: {
    data: {
      type: Array,
      default: () => []
    },
    columns: {
      type: Array,
      default: () => []
    },
    stripe: {
      type: Boolean,
      default: false
    },
    border: {
      type: Boolean,
      default: false
    },
    highlightCurrentRow: {
      type: Boolean,
      default: false
    },
    currentRow: {
      type: [Object, String, Number],
      default: null
    },
    rowKey: {
      type: String,
      default: ''
    },
    statusKey: {
      type: String,
      default: 'status'
    },
    rowClassName: {
      type: Function,
      default: null
    },
    actionLabel: {
      type: String,
      default: '操作'
    },
    actionWidth: {
      type: String,
      default: '120px'
    },
    emptyText: {
      type: String,
      default: '暂无数据'
    },
    formatter: {
      type: Function,
      default: null
    },
    expandedKeys: {
      type: Array,
      default: () => []
    }
  },
  emits: ['row-click', 'update:currentRow'],
  computed: {
    hasActionSlot() {
      return Boolean(this.$slots.action);
    },
    hasExpandSlot() {
      return Boolean(this.$slots.expand);
    },
    totalColspan() {
      return this.columns.length + (this.hasActionSlot ? 1 : 0);
    }
  },
  methods: {
    getColStyle(col) {
      if (!col.width) return undefined;
      return { width: col.width };
    },
    getRowKey(row, index) {
      if (this.rowKey && row[this.rowKey] != null) {
        return row[this.rowKey];
      }
      return index;
    },
    isCurrentRow(row, index) {
      if (!this.highlightCurrentRow || this.currentRow == null) return false;
      if (typeof this.currentRow === 'object') {
        if (this.rowKey) {
          return this.currentRow[this.rowKey] === row[this.rowKey];
        }
        return this.currentRow === row;
      }
      if (this.rowKey) {
        return this.currentRow === row[this.rowKey];
      }
      return this.currentRow === index;
    },
    getRowClass(row, index) {
      const classes = ['data-table__tr'];

      const status = row[this.statusKey];
      if (status && ROW_STATUS_MAP[status]) {
        classes.push(ROW_STATUS_MAP[status]);
      }

      if (this.isCurrentRow(row, index)) {
        classes.push('is-current');
      }

      if (typeof this.rowClassName === 'function') {
        const custom = this.rowClassName(row, index);
        if (typeof custom === 'string' && custom) {
          classes.push(custom);
        }
      }

      return classes;
    },
    formatCell(row, col) {
      const value = row[col.prop];
      if (typeof col.formatter === 'function') {
        return col.formatter(row, col, value, row[col.prop]);
      }
      if (typeof this.formatter === 'function') {
        return this.formatter(row, col, value);
      }
      return value ?? '';
    },
    handleRowClick(row, index) {
      this.$emit('row-click', row, index);
      if (this.highlightCurrentRow) {
        this.$emit('update:currentRow', row);
      }
    },
    isRowExpanded(row, index) {
      if (!this.expandedKeys.length) return false;
      const key = this.rowKey && row[this.rowKey] != null
        ? row[this.rowKey]
        : index;
      return this.expandedKeys.includes(key);
    }
  }
};
</script>

<style scoped>
.data-table {
  width: 100%;
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: 14px;
  line-height: 1.5;
  overflow: hidden;
}

.data-table__inner {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.data-table__th,
.data-table__td {
  padding: 12px 16px;
  text-align: left;
  vertical-align: middle;
  border-bottom: 1px solid var(--border-primary);
  transition: background-color 0.2s ease;
}

.data-table__th {
  font-weight: 600;
  color: var(--text-secondary);
  background: var(--bg-card);
  white-space: nowrap;
}

.data-table__td {
  color: var(--text-primary);
  word-break: break-word;
}

.align-left {
  text-align: left;
}

.align-center {
  text-align: center;
}

.align-right {
  text-align: right;
}

/* 默认状态：仅横向分隔线，无斑马纹 */
.data-table__tr:hover .data-table__td {
  background: var(--bg-hover);
}

/* 斑马纹 */
.data-table.is-stripe .data-table__tr:nth-child(even) .data-table__td {
  background: var(--bg-muted);
}

.data-table.is-stripe .data-table__tr:hover .data-table__td {
  background: var(--bg-hover);
}

.data-table.is-stripe .data-table__tr:nth-child(even):hover .data-table__td {
  background: var(--bg-hover);
}

/* 带边框（网格线） */
.data-table.is-border .data-table__th,
.data-table.is-border .data-table__td {
  border: 1px solid var(--border-primary);
}

.data-table.is-border .data-table__th {
  background: var(--bg-muted);
}

/* 行状态高亮 */
.data-table__tr.is-current .data-table__td {
  background: var(--accent-soft);
}

.data-table.is-stripe .data-table__tr.is-current .data-table__td,
.data-table.is-stripe .data-table__tr.is-current:nth-child(even) .data-table__td {
  background: var(--accent-soft);
}

.data-table__tr.row-status--info .data-table__td {
  background: var(--accent-soft);
}

.data-table__tr.row-status--success .data-table__td {
  background: color-mix(in srgb, #22c55e 12%, var(--bg-card));
}

.data-table__tr.row-status--warning .data-table__td {
  background: color-mix(in srgb, #f59e0b 12%, var(--bg-card));
}

.data-table__tr.row-status--danger .data-table__td {
  background: color-mix(in srgb, var(--text-error) 12%, var(--bg-card));
}

.data-table.is-highlight .data-table__tr {
  cursor: pointer;
}

.data-table__empty {
  padding: 32px 16px;
  text-align: center;
  color: var(--text-tertiary);
  border-bottom: 1px solid var(--border-primary);
}

.data-table__td--action,
.data-table__th--action {
  width: 120px;
}

.data-table__tr--expand .data-table__td--expand {
  padding: 0;
  background: var(--bg-muted);
  border-top: none;
}

.data-table.is-border .data-table__tr--expand .data-table__td--expand {
  border-top: none;
}
</style>
