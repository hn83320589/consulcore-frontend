<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionNoteStore } from '@/stores/sessionNoteStore'
import AppButton from '@/components/ui/AppButton.vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import { formatDateWithYear } from '@/utils/format'

interface Props {
  clientId: number
}

const props = defineProps<Props>()
const router = useRouter()
const sessionNoteStore = useSessionNoteStore()

const clientNotes = computed(() =>
  sessionNoteStore.notes
    .filter((n) => n.clientProfileId === props.clientId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
)

const expandedNoteId = ref<number | null>(null)

function toggleNote(id: number) {
  expandedNoteId.value = expandedNoteId.value === id ? null : id
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="font-semibold text-gray-800">晤談紀錄</h3>
      <AppButton
        size="sm"
        @click="router.push({ path: '/admin/sessions/new', query: { clientId } })"
      >
        新增紀錄
      </AppButton>
    </div>

    <div v-if="clientNotes.length === 0" class="bg-white border border-gray-200 rounded-app p-8 text-center text-gray-400 text-sm">
      尚無晤談紀錄
    </div>
    <div v-else class="space-y-2">
      <div
        v-for="note in clientNotes"
        :key="note.id"
        class="bg-white border border-gray-200 rounded-app overflow-hidden"
      >
        <button
          class="w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-gray-50"
          @click="toggleNote(note.id)"
        >
          <div class="flex items-center gap-3">
            <span class="text-gray-600 font-medium">{{ formatDateWithYear(note.createdAt) }}</span>
            <AppBadge :variant="note.type === 'closure' ? 'warning' : 'default'">
              {{ note.type === 'closure' ? '結案摘要' : '晤談' }}
            </AppBadge>
            <span class="text-xs text-gray-400">{{ note.format === 'soap' ? 'SOAP' : '自由文字' }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span v-if="note.isLocked" class="text-yellow-500 text-xs">🔒</span>
            <span class="text-gray-400">{{ expandedNoteId === note.id ? '▲' : '▼' }}</span>
          </div>
        </button>
        <div v-if="expandedNoteId === note.id" class="px-4 pb-4 border-t border-gray-100">
          <div v-if="note.format === 'soap'" class="space-y-2 mt-3 text-sm">
            <div v-for="soap in [
              { label: 'S', val: note.soapS },
              { label: 'O', val: note.soapO },
              { label: 'A', val: note.soapA },
              { label: 'P', val: note.soapP },
            ]" :key="soap.label">
              <p class="text-xs font-medium text-gray-500 uppercase">{{ soap.label }}</p>
              <p class="text-gray-700 whitespace-pre-wrap">{{ soap.val || '—' }}</p>
            </div>
          </div>
          <div v-else-if="note.freeTextContent" class="mt-3">
            <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ note.freeTextContent }}</p>
          </div>
          <div class="flex gap-2 mt-3">
            <AppButton
              v-if="!note.isLocked"
              size="sm" variant="ghost"
              @click="router.push(`/admin/sessions/${note.id}/edit`)"
            >
              編輯
            </AppButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
