<script setup lang="ts">
import { ref, computed } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import { formatShortDateTime } from '@/utils/format'
import type { ClientMemo, MemoCategory, CreateMemoRequest, UpdateMemoRequest } from '@/types'

interface Props {
  memos: ClientMemo[]
  clientProfileId: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  create: [payload: CreateMemoRequest]
  update: [id: number, payload: UpdateMemoRequest]
  delete: [id: number]
}>()

const categoryLabels: Record<MemoCategory, string> = {
  personality: '個性特質',
  trigger: '觸發因子',
  preference: '偏好',
  family: '家庭',
  other: '其他',
}

const categoryVariants: Record<MemoCategory, 'default' | 'info' | 'warning' | 'success' | 'danger'> = {
  personality: 'info',
  trigger: 'danger',
  preference: 'success',
  family: 'warning',
  other: 'default',
}

const categories: MemoCategory[] = ['personality', 'trigger', 'preference', 'family', 'other']

const memosByCategory = computed(() => {
  const map = new Map<MemoCategory, ClientMemo[]>()
  for (const cat of categories) {
    map.set(cat, props.memos.filter((m) => m.category === cat))
  }
  return map
})

// ── New Memo ────────────────────────────────
const showNew = ref(false)
const newCategory = ref<MemoCategory>('other')
const newContent = ref('')

function handleCreate() {
  if (!newContent.value.trim()) return
  emit('create', {
    clientProfileId: props.clientProfileId,
    category: newCategory.value,
    content: newContent.value,
  })
  newContent.value = ''
  showNew.value = false
}

// ── Edit Memo ───────────────────────────────
const editingId = ref<number | null>(null)
const editContent = ref('')

function startEdit(memo: ClientMemo) {
  editingId.value = memo.id
  editContent.value = memo.content
}

function cancelEdit() {
  editingId.value = null
}

function handleUpdate(id: number) {
  emit('update', id, { content: editContent.value })
  editingId.value = null
}

</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-semibold text-gray-800">備忘錄</h3>
      <AppButton size="sm" @click="showNew = !showNew">
        {{ showNew ? '取消' : '新增' }}
      </AppButton>
    </div>

    <!-- New Memo Form -->
    <div v-if="showNew" class="bg-white border border-gray-200 rounded-app p-4 mb-4">
      <div class="flex gap-2 mb-2">
        <button
          v-for="cat in categories"
          :key="cat"
          class="px-2 py-1 text-xs rounded-full border"
          :class="newCategory === cat
            ? 'bg-primary text-white border-primary'
            : 'bg-white text-gray-600 border-gray-200'"
          @click="newCategory = cat"
        >
          {{ categoryLabels[cat] }}
        </button>
      </div>
      <textarea
        v-model="newContent"
        rows="3"
        class="w-full px-3 py-2 border border-gray-300 rounded-app text-sm mb-2"
        placeholder="輸入備忘..."
      />
      <AppButton size="sm" :disabled="!newContent.trim()" @click="handleCreate">新增</AppButton>
    </div>

    <!-- Memo Groups -->
    <div v-for="cat in categories" :key="cat">
      <template v-if="(memosByCategory.get(cat) ?? []).length > 0">
        <h4 class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 mt-4">
          {{ categoryLabels[cat] }}
        </h4>
        <div class="space-y-2">
          <div
            v-for="memo in memosByCategory.get(cat)"
            :key="memo.id"
            class="bg-white border border-gray-200 rounded-app p-3"
          >
            <div class="flex items-start justify-between mb-1">
              <div class="flex items-center gap-2">
                <span class="text-xs text-gray-500">{{ memo.therapistName }}</span>
                <span class="text-xs text-gray-300">{{ formatShortDateTime(memo.createdAt) }}</span>
                <AppBadge :variant="categoryVariants[memo.category]" class="text-[10px]">
                  {{ categoryLabels[memo.category] }}
                </AppBadge>
              </div>
              <div v-if="memo.isEditable" class="flex gap-1">
                <button
                  v-if="editingId !== memo.id"
                  class="text-xs text-gray-400 hover:text-primary"
                  @click="startEdit(memo)"
                >
                  編輯
                </button>
                <button
                  class="text-xs text-gray-400 hover:text-red-500"
                  @click="emit('delete', memo.id)"
                >
                  刪除
                </button>
              </div>
            </div>

            <!-- Editing -->
            <div v-if="editingId === memo.id">
              <textarea
                v-model="editContent"
                rows="2"
                class="w-full px-2 py-1 border border-gray-300 rounded-sm text-sm mb-2"
              />
              <div class="flex gap-1">
                <AppButton size="sm" @click="handleUpdate(memo.id)">儲存</AppButton>
                <AppButton size="sm" variant="ghost" @click="cancelEdit">取消</AppButton>
              </div>
            </div>

            <!-- Display -->
            <p v-else class="text-sm text-gray-700 whitespace-pre-wrap">{{ memo.content }}</p>
          </div>
        </div>
      </template>
    </div>

    <p v-if="memos.length === 0 && !showNew" class="text-sm text-gray-400 text-center py-6">
      尚無備忘錄
    </p>
  </div>
</template>
