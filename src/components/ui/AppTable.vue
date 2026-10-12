<script lang="ts">
export interface TableColumn {
  key: string
  label: string
  width?: string
}
</script>

<!-- 泛型：slot 的 row 直接是資料型別 T，呼叫端不必再強制轉型 -->
<script setup lang="ts" generic="T extends object">
import { ref, computed, watch } from 'vue'
import AppPagination from './AppPagination.vue'

interface Props {
  columns: TableColumn[]
  data: T[]
  loading?: boolean
  emptyText?: string
  pageSize?: number
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  emptyText: '暫無資料',
  pageSize: 15,
})

const currentPage = ref(1)
const totalPages = computed(() => Math.max(1, Math.ceil(props.data.length / props.pageSize)))

const pagedData = computed(() => {
  const start = (currentPage.value - 1) * props.pageSize
  return props.data.slice(start, start + props.pageSize)
})

defineSlots<{
  [name: `cell-${string}`]: (props: { row: T; value: unknown }) => unknown
}>()

// 有 id 就用 id 當 key（排序或分頁變動時 DOM 才不會錯位），沒有才退回 index
function rowKey(row: T, index: number): string | number {
  const id = (row as { id?: unknown }).id
  return typeof id === 'number' || typeof id === 'string' ? id : index
}

function cellValue(row: T, key: string): unknown {
  return (row as Record<string, unknown>)[key]
}

watch(() => props.data.length, () => {
  if (currentPage.value > totalPages.value) currentPage.value = totalPages.value
})

function goPage(page: number) {
  currentPage.value = Math.max(1, Math.min(page, totalPages.value))
}
</script>

<template>
  <div>
    <div class="overflow-x-auto border border-gray-200 rounded-app">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-gray-50 border-b border-gray-200">
            <th
              v-for="col in columns"
              :key="col.key"
              class="px-4 py-3 text-left font-medium text-gray-600 whitespace-nowrap"
              :style="col.width ? { width: col.width } : {}"
            >
              {{ col.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <!-- Loading -->
          <tr v-if="loading">
            <td :colspan="columns.length" class="px-4 py-8 text-center text-gray-400">
              載入中...
            </td>
          </tr>

          <!-- Empty -->
          <tr v-else-if="data.length === 0">
            <td :colspan="columns.length" class="px-4 py-8 text-center text-gray-400">
              {{ emptyText }}
            </td>
          </tr>

          <!-- Rows -->
          <tr
            v-for="(row, index) in pagedData"
            v-else
            :key="rowKey(row, index)"
            class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <td v-for="col in columns" :key="col.key" class="px-4 py-3">
              <slot :name="`cell-${col.key}`" :row="row" :value="cellValue(row, col.key)">
                {{ cellValue(row, col.key) ?? '' }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 前端分頁（資料一次全部載入時） -->
    <AppPagination
      :page="currentPage"
      :page-size="pageSize"
      :total-count="data.length"
      @update:page="goPage"
    />
  </div>
</template>
