<script setup lang="ts">
import { ref } from 'vue'
import type { ClientStatus } from '@/types'

interface Props {
  therapists?: { id: string; name: string }[]
}

withDefaults(defineProps<Props>(), {
  therapists: () => [],
})

const emit = defineEmits<{
  search: [params: { keyword: string; status: string; therapistId: string }]
}>()

const keyword = ref('')
const status = ref('')
const therapistId = ref('')

function handleSearch() {
  emit('search', {
    keyword: keyword.value,
    status: status.value,
    therapistId: therapistId.value,
  })
}

const statusOptions: { label: string; value: ClientStatus | '' }[] = [
  { label: '全部狀態', value: '' },
  { label: '待處理', value: 'pending' },
  { label: '進行中', value: 'active' },
  { label: '暫停', value: 'suspended' },
  { label: '結案', value: 'closed' },
]
</script>

<template>
  <div class="flex flex-wrap items-end gap-3">
    <div>
      <label class="block text-xs text-gray-500 mb-1">搜尋</label>
      <input
        v-model="keyword"
        type="text"
        placeholder="姓名或身分證末四碼"
        class="px-3 py-2 border border-gray-300 rounded-app text-sm w-56 focus:outline-hidden focus:ring-2 focus:ring-primary/30"
        @keyup.enter="handleSearch"
      />
    </div>

    <div>
      <label class="block text-xs text-gray-500 mb-1">狀態</label>
      <select
        v-model="status"
        class="px-3 py-2 border border-gray-300 rounded-app text-sm bg-white"
        @change="handleSearch"
      >
        <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
    </div>

    <div v-if="therapists.length > 0">
      <label class="block text-xs text-gray-500 mb-1">心理師</label>
      <select
        v-model="therapistId"
        class="px-3 py-2 border border-gray-300 rounded-app text-sm bg-white"
        @change="handleSearch"
      >
        <option value="">全部</option>
        <option v-for="t in therapists" :key="t.id" :value="t.id">{{ t.name }}</option>
      </select>
    </div>

    <button
      class="px-4 py-2 bg-primary text-white text-sm rounded-app hover:bg-primary-hover"
      @click="handleSearch"
    >
      搜尋
    </button>
  </div>
</template>
