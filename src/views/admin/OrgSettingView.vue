<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useFormBuilderStore } from '@/stores/formBuilderStore'
import { useUiStore } from '@/stores/uiStore'
import AppButton from '@/components/ui/AppButton.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import FormBuilder from '@/components/form/FormBuilder.vue'
import FormRenderer from '@/components/form/FormRenderer.vue'
import type {
  FormTemplateResponse,
  FormSectionResponse,
  CreateFormSectionRequest,
} from '@/types'

const formStore = useFormBuilderStore()
const uiStore = useUiStore()

// ── 範本列表 ─────────────────────────────────
const selectedId = ref<number | null>(null)
const selected = computed(() =>
  formStore.templates.find((t) => t.id === selectedId.value) ?? null,
)

// ── 編輯狀態 ─────────────────────────────────
const draftName = ref('')
const draftSections = ref<CreateFormSectionRequest[]>([])
const saving = ref(false)

// 系統預設不可直接編輯，需先複製（契約 7.8）
const isEditable = computed(() => selected.value != null && !selected.value.isSystemDefault)

// Response 巢狀結構 → Builder 用的請求結構
function toBuilderSections(sections: FormSectionResponse[]): CreateFormSectionRequest[] {
  return sections.map((s) => ({
    title: s.title,
    sortOrder: s.sortOrder,
    isRequired: s.isRequired,
    fields: s.fields.map((f) => ({
      label: f.label,
      fieldType: f.fieldType,
      options: f.options ?? null,
      isRequired: f.isRequired,
      sortOrder: f.sortOrder,
      placeholder: f.placeholder ?? null,
      validationRules: f.validationRules ?? null,
    })),
  }))
}

// Builder 請求結構 → Renderer 預覽用的 Response 結構（合成假 id）
const previewSections = computed<FormSectionResponse[]>(() =>
  draftSections.value.map((s, sIdx) => ({
    id: sIdx,
    title: s.title,
    sortOrder: s.sortOrder,
    isRequired: s.isRequired ?? false,
    fields: (s.fields ?? []).map((f, fIdx) => ({
      id: sIdx * 1000 + fIdx,
      label: f.label,
      fieldType: f.fieldType ?? 'text',
      options: f.options ?? null,
      isRequired: f.isRequired,
      sortOrder: f.sortOrder,
      placeholder: f.placeholder ?? null,
      validationRules: f.validationRules ?? null,
    })),
  })),
)

function selectTemplate(t: FormTemplateResponse) {
  selectedId.value = t.id
  draftName.value = t.name
  draftSections.value = toBuilderSections(t.sections)
}

function onBuilderUpdate(sections: CreateFormSectionRequest[]) {
  draftSections.value = sections
}

// ── 動作 ─────────────────────────────────────
async function handleNew() {
  saving.value = true
  try {
    const created = await formStore.createTemplate({
      name: '新表單範本',
      type: 'custom',
      sections: [],
    })
    selectTemplate(created)
    uiStore.showToast('已建立新範本', 'success')
  } catch {
    uiStore.showToast('建立失敗', 'error')
  } finally {
    saving.value = false
  }
}

async function handleClone(t: FormTemplateResponse) {
  saving.value = true
  try {
    const cloned = await formStore.cloneTemplate(t.id)
    selectTemplate(cloned)
    uiStore.showToast('已複製為可編輯範本', 'success')
  } catch {
    uiStore.showToast('複製失敗', 'error')
  } finally {
    saving.value = false
  }
}

async function handleSave() {
  if (!selected.value) return
  saving.value = true
  try {
    await formStore.updateTemplate(selected.value.id, {
      name: draftName.value,
      sections: draftSections.value,
    })
    uiStore.showToast('範本已儲存', 'success')
  } catch (e: unknown) {
    // 契約：系統預設或已有填答紀錄的範本不可改結構，後端回 400
    uiStore.showToast(e instanceof Error ? e.message : '儲存失敗', 'error')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await formStore.fetchTemplates()
  if (formStore.templates.length > 0) {
    selectTemplate(formStore.templates[0]!)
  }
})
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-xl font-bold text-app-text">機構設定</h1>
      <p class="text-sm text-gray-500 mt-1">表單範本管理（初診評估、自訂表單）</p>
    </div>

    <div class="grid grid-cols-4 gap-6">
      <!-- 範本列表 -->
      <div class="col-span-1 space-y-2">
        <AppButton class="w-full" :loading="saving" @click="handleNew">+ 新增範本</AppButton>
        <button
          v-for="t in formStore.templates"
          :key="t.id"
          class="w-full text-left px-3 py-2.5 rounded-app border text-sm transition-colors"
          :class="
            t.id === selectedId
              ? 'border-primary bg-blue-50 text-primary font-medium'
              : 'border-gray-200 hover:bg-gray-50 text-gray-700'
          "
          @click="selectTemplate(t)"
        >
          <div class="flex items-center justify-between gap-2">
            <span class="truncate">{{ t.name }}</span>
            <AppBadge v-if="t.isSystemDefault" variant="default">系統</AppBadge>
          </div>
          <div class="text-xs text-gray-400 mt-0.5">v{{ t.version }} · {{ t.type }}</div>
        </button>
        <p v-if="formStore.templates.length === 0" class="text-sm text-gray-400 py-4 text-center">
          尚無表單範本
        </p>
      </div>

      <!-- 編輯區 -->
      <div class="col-span-3">
        <div v-if="!selected" class="text-center text-gray-400 py-16">
          請選擇左側範本，或新增一個
        </div>

        <div v-else>
          <!-- 系統預設：唯讀 + 複製 -->
          <div
            v-if="!isEditable"
            class="mb-4 flex items-center justify-between bg-amber-50 border border-amber-200 rounded-app p-4"
          >
            <p class="text-sm text-amber-700">系統預設範本不可直接編輯，請複製後再修改。</p>
            <AppButton size="sm" :loading="saving" @click="handleClone(selected)">複製後編輯</AppButton>
          </div>

          <div v-if="isEditable" class="flex items-end gap-3 mb-4">
            <AppInput v-model="draftName" label="範本名稱" class="flex-1" />
            <AppButton :loading="saving" @click="handleSave">儲存</AppButton>
          </div>

          <div class="grid grid-cols-2 gap-6">
            <!-- 建構器（唯讀範本停用互動） -->
            <div :class="{ 'pointer-events-none opacity-60': !isEditable }">
              <h3 class="text-sm font-semibold text-gray-600 mb-2">結構編輯</h3>
              <FormBuilder :sections="draftSections" @update="onBuilderUpdate" />
            </div>

            <!-- 即時預覽 -->
            <div>
              <h3 class="text-sm font-semibold text-gray-600 mb-2">即時預覽</h3>
              <div class="bg-white border border-gray-200 rounded-app p-4">
                <FormRenderer :sections="previewSections" readonly />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
