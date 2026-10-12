<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  page: number
  pageSize: number
  /** null：總筆數未知，只能依本頁筆數判斷有沒有下一頁 */
  totalCount: number | null
  /** 本頁實際筆數 */
  itemCount: number
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), { disabled: false })
const emit = defineEmits<{ 'update:page': [page: number] }>()

const totalPages = computed(() =>
  props.totalCount === null ? null : Math.max(1, Math.ceil(props.totalCount / props.pageSize)),
)
const hasPrev = computed(() => props.page > 1)
const hasNext = computed(() =>
  totalPages.value === null ? props.itemCount >= props.pageSize : props.page < totalPages.value,
)
const visible = computed(() => hasPrev.value || hasNext.value)

function go(page: number) {
  if (page !== props.page) emit('update:page', page)
}
</script>

<template>
  <div v-if="visible" class="flex items-center justify-between mt-3 px-1">
    <span class="text-xs text-gray-400">
      <template v-if="totalPages !== null">共 {{ totalCount }} 筆，第 {{ page }}/{{ totalPages }} 頁</template>
      <template v-else>第 {{ page }} 頁</template>
    </span>
    <div class="flex items-center gap-1">
      <button
        class="px-2 py-1 text-xs rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
        :disabled="disabled || !hasPrev"
        @click="go(page - 1)"
      >
        ←
      </button>
      <template v-if="totalPages !== null">
        <template v-for="p in totalPages" :key="p">
          <button
            v-if="p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)"
            class="px-2.5 py-1 text-xs rounded border disabled:opacity-40"
            :class="p === page ? 'bg-primary text-white border-primary' : 'border-gray-200 hover:bg-gray-50'"
            :disabled="disabled"
            @click="go(p)"
          >
            {{ p }}
          </button>
          <span v-else-if="p === page - 2 || p === page + 2" class="text-xs text-gray-300">...</span>
        </template>
      </template>
      <button
        class="px-2 py-1 text-xs rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
        :disabled="disabled || !hasNext"
        @click="go(page + 1)"
      >
        →
      </button>
    </div>
  </div>
</template>
