<script setup lang="ts">
import { ref, computed, watch } from 'vue'

export interface TableColumn {
  key: string
  label: string
  width?: string
}

interface Props {
  columns: TableColumn[]
  data: Record<string, unknown>[]
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
            :key="index"
            class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <td v-for="col in columns" :key="col.key" class="px-4 py-3">
              <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
                {{ row[col.key] ?? '' }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex items-center justify-between mt-3 px-1">
      <span class="text-xs text-gray-400">
        共 {{ data.length }} 筆，第 {{ currentPage }}/{{ totalPages }} 頁
      </span>
      <div class="flex items-center gap-1">
        <button
          class="px-2 py-1 text-xs rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
          :disabled="currentPage <= 1"
          @click="goPage(currentPage - 1)"
        >
          ←
        </button>
        <template v-for="p in totalPages" :key="p">
          <button
            v-if="p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)"
            class="px-2.5 py-1 text-xs rounded border"
            :class="p === currentPage ? 'bg-primary text-white border-primary' : 'border-gray-200 hover:bg-gray-50'"
            @click="goPage(p)"
          >
            {{ p }}
          </button>
          <span
            v-else-if="p === currentPage - 2 || p === currentPage + 2"
            class="text-xs text-gray-300"
          >
            ...
          </span>
        </template>
        <button
          class="px-2 py-1 text-xs rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
          :disabled="currentPage >= totalPages"
          @click="goPage(currentPage + 1)"
        >
          →
        </button>
      </div>
    </div>
  </div>
</template>
