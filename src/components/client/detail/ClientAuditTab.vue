<script setup lang="ts">
import type { AuditLog } from '@/types'
import { formatDateTime } from '@/utils/format'
import { auditActionLabel } from '@/utils/labels'

interface Props {
  logs: AuditLog[]
}

defineProps<Props>()
</script>

<template>
  <div class="space-y-3">
    <h3 class="font-semibold text-gray-800">稽核紀錄</h3>
    <div v-if="logs.length === 0" class="bg-white border border-gray-200 rounded-app p-8 text-center text-gray-400 text-sm">
      尚無稽核紀錄
    </div>
    <div v-else class="bg-white border border-gray-200 rounded-app overflow-x-auto">
      <table class="w-full min-w-[36rem] text-sm">
        <thead>
          <tr class="bg-gray-50 border-b border-gray-200">
            <th class="px-4 py-2 text-left text-gray-600">時間</th>
            <th class="px-4 py-2 text-left text-gray-600">操作者</th>
            <th class="px-4 py-2 text-left text-gray-600">動作</th>
            <th class="px-4 py-2 text-left text-gray-600">描述</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in logs" :key="log.id" class="border-b border-gray-100">
            <td class="px-4 py-2 text-xs text-gray-500">{{ formatDateTime(log.createdAt) }}</td>
            <td class="px-4 py-2">{{ log.userName ?? '—' }}</td>
            <td class="px-4 py-2"><span class="px-1.5 py-0.5 bg-gray-100 rounded-sm text-xs">{{ auditActionLabel(log.action) }}</span></td>
            <td class="px-4 py-2 text-gray-600">{{ log.description ?? '—' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
