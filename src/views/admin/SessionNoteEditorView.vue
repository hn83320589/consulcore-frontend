<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSessionNoteStore } from '@/stores/sessionNoteStore'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import { useClientStore } from '@/stores/clientStore'
import { useLeaveGuard } from '@/composables/useLeaveGuard'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'
import AppButton from '@/components/ui/AppButton.vue'
import SoapEditor from '@/components/session/SoapEditor.vue'
import FreeTextEditor from '@/components/session/FreeTextEditor.vue'
import LockStatusBar from '@/components/session/LockStatusBar.vue'
import PhrasePanel from '@/components/form/PhrasePanel.vue'
import { notifyError } from '@/utils/notifyError'
import type { SessionNoteFormat, SessionNoteType, PhraseCategory } from '@/types'

const route = useRoute()
const router = useRouter()
const store = useSessionNoteStore()
const authStore = useAuthStore()
const uiStore = useUiStore()
const clientStore = useClientStore()

const noteId = computed(() => {
  const raw = route.params.id as string | undefined
  return raw != null ? Number(raw) : undefined
})
const isEdit = computed(() => noteId.value != null)

// ── Form State ──────────────────────────────
const clientProfileId = ref(route.query.clientId != null ? Number(route.query.clientId) : 0)
// 個案姓名不放網址（會留在瀏覽器歷史與 Referer），由 store 或後端取得
const clientName = ref('')
const noteType = ref<SessionNoteType>('session')
const format = ref<SessionNoteFormat>('soap')
const soapS = ref('')
const soapO = ref('')
const soapA = ref('')
const soapP = ref('')
const freeTextContent = ref('')
const saving = ref(false)

const isLocked = computed(() => store.currentNote?.isLocked ?? false)

// ── 未存檔離開保護 ──────────────────────────
function formSnapshot() {
  return JSON.stringify([noteType.value, format.value, soapS.value, soapO.value, soapA.value, soapP.value, freeTextContent.value])
}
const savedSnapshot = ref(formSnapshot())
const isDirty = () => !isLocked.value && formSnapshot() !== savedSnapshot.value
const { leavePending, confirmLeave, cancelLeave } = useLeaveGuard(isDirty)

// ── Editor Refs ─────────────────────────────
const soapEditorRef = ref<InstanceType<typeof SoapEditor> | null>(null)
const freeTextEditorRef = ref<InstanceType<typeof FreeTextEditor> | null>(null)

// ── Phrase Panel ────────────────────────────
const showPhrasePanel = ref(true)
const phraseCategory = ref<PhraseCategory>('general')

function handlePhraseRequest(category?: PhraseCategory) {
  if (category) phraseCategory.value = category
  showPhrasePanel.value = true
}

function handlePhraseInsert(content: string) {
  if (format.value === 'soap' && soapEditorRef.value) {
    soapEditorRef.value.insertAtCursor(phraseCategory.value, content)
  } else if (freeTextEditorRef.value) {
    freeTextEditorRef.value.insertAtCursor(content)
  }
}

// ── Save ────────────────────────────────────
async function handleSave(lock = false) {
  saving.value = true
  try {
    if (isEdit.value && noteId.value != null) {
      await store.updateNote(noteId.value, {
        soapS: format.value === 'soap' ? soapS.value : undefined,
        soapO: format.value === 'soap' ? soapO.value : undefined,
        soapA: format.value === 'soap' ? soapA.value : undefined,
        soapP: format.value === 'soap' ? soapP.value : undefined,
        freeTextContent: format.value === 'free_text' ? freeTextContent.value : undefined,
      })
      if (lock) await store.lockNote(noteId.value)
      savedSnapshot.value = formSnapshot()
      uiStore.showToast(lock ? '已完成並鎖定' : '已暫存', 'success')
    } else {
      const created = await store.createNote({
        clientProfileId: clientProfileId.value,
        type: noteType.value,
        format: format.value,
        soapS: format.value === 'soap' ? soapS.value : undefined,
        soapO: format.value === 'soap' ? soapO.value : undefined,
        soapA: format.value === 'soap' ? soapA.value : undefined,
        soapP: format.value === 'soap' ? soapP.value : undefined,
        freeTextContent: format.value === 'free_text' ? freeTextContent.value : undefined,
      })
      if (lock) await store.lockNote(created.id)
      // 先更新快照再換頁，否則轉到編輯頁會被當成「未存檔離開」
      savedSnapshot.value = formSnapshot()
      uiStore.showToast(lock ? '已建立並鎖定' : '已建立', 'success')
      await router.replace(`/admin/sessions/${created.id}/edit`)
    }
  } catch (e) {
    notifyError(e, '儲存失敗')
  } finally {
    saving.value = false
  }
}

async function handleUnlock() {
  if (noteId.value == null) return
  try {
    await store.unlockNote(noteId.value)
    uiStore.showToast('已解鎖', 'success')
  } catch (e) {
    notifyError(e, '解鎖失敗')
  }
}

function handleCancel() {
  router.back()
}

// ── Init ────────────────────────────────────
onMounted(async () => {
  await store.fetchPhrases()
  if (noteId.value == null && clientProfileId.value) {
    if (clientStore.currentClient?.id !== clientProfileId.value) {
      try {
        await clientStore.fetchClient(clientProfileId.value)
      } catch {
        // 失敗時 httpService 已顯示錯誤訊息；標題只是少了姓名，不影響撰寫紀錄
      }
    }
    clientName.value = clientStore.currentClient?.id === clientProfileId.value ? clientStore.currentClient.name : ''
  }
  if (noteId.value != null) {
    // 先用 store 既有資料，沒有則以單筆 GET 取（支援直接以 URL 進入編輯頁）
    let note =
      store.currentNote?.id === noteId.value
        ? store.currentNote
        : (store.notes.find((n) => n.id === noteId.value) ?? null)
    if (!note) {
      try {
        note = await store.fetchNote(noteId.value)
      } catch {
        note = null
      }
    }
    store.setCurrentNote(note)
    if (note) {
      clientProfileId.value = note.clientProfileId
      clientName.value = note.clientName
      noteType.value = note.type
      format.value = note.format
      soapS.value = note.soapS ?? ''
      soapO.value = note.soapO ?? ''
      soapA.value = note.soapA ?? ''
      soapP.value = note.soapP ?? ''
      freeTextContent.value = note.freeTextContent ?? ''
      savedSnapshot.value = formSnapshot()
    }
  }
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <div>
        <h1 class="text-xl font-bold text-app-text">
          {{ isEdit ? '編輯晤談紀錄' : '新增晤談紀錄' }}
        </h1>
        <p v-if="clientName" class="text-sm text-gray-500 mt-0.5">
          {{ clientName }}
        </p>
      </div>
      <div class="flex items-center gap-2">
        <!-- Type Toggle -->
        <div class="flex border border-gray-200 rounded-app overflow-hidden text-sm">
          <button
            class="px-3 py-1"
            :class="noteType === 'session' ? 'bg-primary text-white' : 'bg-white text-gray-600'"
            @click="noteType = 'session'"
          >
            晤談紀錄
          </button>
          <button
            class="px-3 py-1"
            :class="noteType === 'closure' ? 'bg-primary text-white' : 'bg-white text-gray-600'"
            @click="noteType = 'closure'"
          >
            結案摘要
          </button>
        </div>
      </div>
    </div>

    <!-- Lock Status -->
    <div class="mb-4">
      <LockStatusBar
        :is-locked="isLocked"
        :locked-at="store.currentNote?.lockedAt ?? null"
        :locked-by="store.currentNote?.lockedBy ?? null"
        :can-unlock="authStore.hasPermission('session.lock')"
        @unlock="handleUnlock"
      />
    </div>

    <div class="flex gap-6">
      <!-- Main Editor -->
      <div class="flex-1">
        <!-- Format Toggle -->
        <div class="flex items-center gap-2 mb-4">
          <span class="text-sm text-gray-500">格式：</span>
          <div class="flex border border-gray-200 rounded-app overflow-hidden text-sm">
            <button
              class="px-3 py-1"
              :class="format === 'soap' ? 'bg-primary text-white' : 'bg-white text-gray-600'"
              @click="format = 'soap'"
            >
              SOAP
            </button>
            <button
              class="px-3 py-1"
              :class="format === 'free_text' ? 'bg-primary text-white' : 'bg-white text-gray-600'"
              @click="format = 'free_text'"
            >
              自由文字
            </button>
          </div>
        </div>

        <!-- SOAP Editor -->
        <SoapEditor
          v-if="format === 'soap'"
          ref="soapEditorRef"
          v-model:soap-s="soapS"
          v-model:soap-o="soapO"
          v-model:soap-a="soapA"
          v-model:soap-p="soapP"
          :disabled="isLocked"
          @phrase-request="handlePhraseRequest"
        />

        <!-- Free Text Editor -->
        <FreeTextEditor
          v-else
          ref="freeTextEditorRef"
          :content="freeTextContent"
          :disabled="isLocked"
          @update:content="freeTextContent = $event"
          @phrase-request="handlePhraseRequest('general')"
        />

        <!-- Actions -->
        <div class="flex gap-2 mt-6 pt-4 border-t border-gray-200">
          <AppButton
            :loading="saving"
            :disabled="isLocked"
            variant="secondary"
            @click="handleSave(false)"
          >
            暫存
          </AppButton>
          <AppButton
            :loading="saving"
            :disabled="isLocked"
            @click="handleSave(true)"
          >
            完成並鎖定
          </AppButton>
          <AppButton variant="ghost" @click="handleCancel">取消</AppButton>
        </div>
      </div>

      <!-- Phrase Panel (right sidebar) -->
      <div v-if="showPhrasePanel" class="w-64 flex-shrink-0">
        <PhrasePanel
          :phrases="store.phrases"
          :active-category="phraseCategory"
          @insert="handlePhraseInsert"
          @manage="router.push('/admin/settings')"
        />
      </div>
    </div>

    <ConfirmModal
      :open="leavePending"
      title="尚未儲存"
      message="晤談紀錄有尚未儲存的內容，離開後會遺失。確定要離開嗎？"
      confirm-text="放棄並離開"
      cancel-text="繼續編輯"
      @confirm="confirmLeave"
      @cancel="cancelLeave"
    />
  </div>
</template>
