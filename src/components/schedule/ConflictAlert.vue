<script setup lang="ts">
export interface Conflict {
  date: string
  time: string
  roomName: string
  therapists: string[]
}

interface Props {
  conflicts: Conflict[]
}

defineProps<Props>()
</script>

<template>
  <div
    v-if="conflicts.length > 0"
    class="bg-red-50 border border-red-200 rounded-app p-4 mb-4"
  >
    <div class="flex items-start gap-2">
      <span class="text-red-500 font-bold">!</span>
      <div>
        <p class="text-sm font-medium text-red-700 mb-2">
          偵測到 {{ conflicts.length }} 個排班衝突
        </p>
        <ul class="space-y-1">
          <li
            v-for="(c, i) in conflicts"
            :key="i"
            class="text-xs text-red-600"
          >
            {{ c.date }} {{ c.time }} — {{ c.roomName }}：{{ c.therapists.join('、') }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
