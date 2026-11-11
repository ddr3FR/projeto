<script setup lang="ts">
import { ref } from 'vue'

export interface Column<T> {
  key: string
  label: string
  sortable?: boolean
  render?: (row: T) => string | number
  class?: string
  width?: string
}

export interface Props<T> {
  columns: Column<T>[]
  rows: T[]
  keyField: keyof T | string
  loading?: boolean
  emptyMessage?: string
  striped?: boolean
  hoverable?: boolean
}

const props = withDefaults(defineProps<Props<any>>(), {
  loading: false,
  emptyMessage: 'Nenhum registro encontrado.',
  striped: true,
  hoverable: true,
})

const emit = defineEmits<{
  (e: 'row-click', row: any): void
  (e: 'sort', key: string): void
}>()

const sortKey = ref<string | null>(null)
const sortDirection = ref<'asc' | 'desc'>('asc')

const handleSort = (key: string) => {
  const column = props.columns.find((c) => c.key === key)
  if (!column?.sortable) return

  if (sortKey.value === key) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDirection.value = 'asc'
  }
  emit('sort', key)
}

const getCellValue = (row: any, column: Column<any>) => {
  if (column.render) {
    return column.render(row)
  }
  return row[column.key]
}

const getSortIcon = (key: string) => {
  if (sortKey.value !== key) return null
  return sortDirection.value === 'asc' ? '▲' : '▼'
}
</script>

<template>
  <div class="table-container">
    <div v-if="loading" class="table-loading" role="status" aria-live="polite">
      <div class="spinner" aria-hidden="true"></div>
      <p>Carregando...</p>
    </div>

    <div v-else-if="rows.length === 0" class="table-empty">
      <p>{{ emptyMessage }}</p>
    </div>

    <table v-else class="table" :class="{ 'table-striped': striped, 'table-hoverable': hoverable }">
      <thead>
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            :class="column.class"
            :style="{ width: column.width, cursor: column.sortable ? 'pointer' : 'auto' }"
            @click="column.sortable ? handleSort(column.key) : null"
          >
            <div class="th-content">
              <span>{{ column.label }}</span>
              <span v-if="column.sortable" class="sort-icon">{{ getSortIcon(column.key) }}</span>
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in rows"
          :key="row[keyField]"
          @click="$emit('row-click', row)"
          :class="{ clickable: true }"
        >
          <td
            v-for="column in columns"
            :key="column.key"
            :class="column.class"
          >
            <slot :name="`cell-${column.key}`" :row="row">
              {{ getCellValue(row, column) }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.table-container {
  overflow-x: auto;
  border: 1px solid #eee;
  border-radius: 8px;
  background: white;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.table th,
.table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.table th {
  background: #fafafa;
  font-weight: 600;
  color: #333;
  white-space: nowrap;
  user-select: none;
}

.th-content {
  display: flex;
  align-items: center;
  gap: 6px;
}

.sort-icon {
  font-size: 10px;
  color: #999;
  transition: color 0.2s;
}

th:hover .sort-icon {
  color: #1976d2;
}

.table-striped tbody tr:nth-child(even) {
  background: #fafafa;
}

.table-hoverable tbody tr {
  cursor: pointer;
  transition: background 0.15s;
}

.table-hoverable tbody tr:hover {
  background: #f5f5f5;
}

.table td {
  color: #333;
}

.table-empty,
.table-loading {
  padding: 40px 20px;
  text-align: center;
  color: #666;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #ddd;
  border-top-color: #1976d2;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 12px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>