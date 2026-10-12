<script setup lang="ts">
import { ref, watch } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import type { CreateFormSectionRequest, CreateFormFieldRequest, FieldType } from '@/types'

interface Props {
  sections: CreateFormSectionRequest[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  update: [sections: CreateFormSectionRequest[]]
}>()

const editSections = ref<CreateFormSectionRequest[]>(
  JSON.parse(JSON.stringify(props.sections)),
)

watch(
  () => props.sections,
  (s) => {
    editSections.value = JSON.parse(JSON.stringify(s))
  },
  { deep: true },
)

const fieldTypeOptions: { label: string; value: FieldType }[] = [
  { label: '單行文字', value: 'text' },
  { label: '多行文字', value: 'textarea' },
  { label: '數字', value: 'number' },
  { label: '日期', value: 'date' },
  { label: '下拉選單', value: 'select' },
  { label: '單選', value: 'radio' },
  { label: '核取方塊', value: 'checkbox' },
  { label: '量表（1-5）', value: 'scale' },
]

// options 為 JSON 字串，編輯時以「每行一個」呈現／回寫
function optionsToText(field: CreateFormFieldRequest): string {
  if (!field.options) return ''
  try {
    const arr = JSON.parse(field.options)
    return Array.isArray(arr) ? arr.join('\n') : ''
  } catch {
    return ''
  }
}

function setOptionsFromText(field: CreateFormFieldRequest, text: string) {
  const arr = text.split('\n').filter(Boolean)
  field.options = arr.length ? JSON.stringify(arr) : null
  emitUpdate()
}

// ── Section ─────────────────────────────────
function addSection() {
  editSections.value.push({
    title: '新區塊',
    sortOrder: editSections.value.length,
    isRequired: false,
    fields: [],
  })
  emitUpdate()
}

function removeSection(idx: number) {
  editSections.value.splice(idx, 1)
  emitUpdate()
}

function moveSectionUp(idx: number) {
  if (idx === 0) return
  const [item] = editSections.value.splice(idx, 1)
  editSections.value.splice(idx - 1, 0, item!)
  emitUpdate()
}

function moveSectionDown(idx: number) {
  if (idx >= editSections.value.length - 1) return
  const [item] = editSections.value.splice(idx, 1)
  editSections.value.splice(idx + 1, 0, item!)
  emitUpdate()
}

// ── Field ───────────────────────────────────
function addField(sectionIdx: number) {
  const fields = (editSections.value[sectionIdx]!.fields ??= [])
  fields.push({
    label: '新欄位',
    fieldType: 'text',
    isRequired: false,
    sortOrder: fields.length,
  })
  emitUpdate()
}

function removeField(sectionIdx: number, fieldIdx: number) {
  editSections.value[sectionIdx]!.fields?.splice(fieldIdx, 1)
  emitUpdate()
}

function moveFieldUp(sectionIdx: number, fieldIdx: number) {
  if (fieldIdx === 0) return
  const fields = editSections.value[sectionIdx]!.fields
  if (!fields) return
  const [item] = fields.splice(fieldIdx, 1)
  fields.splice(fieldIdx - 1, 0, item!)
  emitUpdate()
}

function moveFieldDown(sectionIdx: number, fieldIdx: number) {
  const fields = editSections.value[sectionIdx]!.fields
  if (!fields || fieldIdx >= fields.length - 1) return
  const [item] = fields.splice(fieldIdx, 1)
  fields.splice(fieldIdx + 1, 0, item!)
  emitUpdate()
}

// ── Editing ─────────────────────────────────
const editingField = ref<{ sectionIdx: number; fieldIdx: number } | null>(null)

function startEditField(sectionIdx: number, fieldIdx: number) {
  editingField.value = { sectionIdx, fieldIdx }
}

function getEditingField(): CreateFormFieldRequest | null {
  if (!editingField.value) return null
  return (
    editSections.value[editingField.value.sectionIdx]?.fields?.[
      editingField.value.fieldIdx
    ] ?? null
  )
}

function closeFieldEditor() {
  editingField.value = null
  emitUpdate()
}

// 送出前把 sortOrder 對齊目前索引，符合後端巢狀契約
function emitUpdate() {
  editSections.value.forEach((section, sIdx) => {
    section.sortOrder = sIdx
    section.fields?.forEach((field, fIdx) => {
      field.sortOrder = fIdx
    })
  })
  emit('update', JSON.parse(JSON.stringify(editSections.value)))
}
</script>

<template>
  <div class="grid grid-cols-3 gap-6">
    <!-- Left: Section List -->
    <div class="col-span-2 space-y-4">
      <div
        v-for="(section, sIdx) in editSections"
        :key="sIdx"
        class="bg-white border border-gray-200 rounded-app p-4"
      >
        <!-- Section Header -->
        <div class="flex items-center justify-between mb-3">
          <input
            v-model="section.title"
            class="font-semibold text-gray-800 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-primary focus:outline-hidden px-1"
            @blur="emitUpdate"
          />
          <div class="flex items-center gap-1">
            <button class="text-xs text-gray-400 hover:text-gray-600 px-1" @click="moveSectionUp(sIdx)">↑</button>
            <button class="text-xs text-gray-400 hover:text-gray-600 px-1" @click="moveSectionDown(sIdx)">↓</button>
            <button class="text-xs text-red-400 hover:text-red-600 px-1" @click="removeSection(sIdx)">✕</button>
          </div>
        </div>

        <!-- Fields -->
        <div class="space-y-2">
          <div
            v-for="(field, fIdx) in section.fields ?? []"
            :key="fIdx"
            class="flex items-center gap-2 p-2 bg-gray-50 rounded-sm border border-gray-100 text-sm cursor-pointer hover:bg-gray-100"
            @click="startEditField(sIdx, fIdx)"
          >
            <span class="text-gray-400 text-xs w-16 truncate">{{ field.fieldType ?? 'text' }}</span>
            <span class="flex-1 truncate">{{ field.label }}</span>
            <span v-if="field.isRequired" class="text-red-400 text-xs">必填</span>
            <button class="text-xs text-gray-400 hover:text-gray-600" @click.stop="moveFieldUp(sIdx, fIdx)">↑</button>
            <button class="text-xs text-gray-400 hover:text-gray-600" @click.stop="moveFieldDown(sIdx, fIdx)">↓</button>
            <button class="text-xs text-red-400 hover:text-red-600" @click.stop="removeField(sIdx, fIdx)">✕</button>
          </div>
        </div>

        <AppButton size="sm" variant="ghost" class="mt-2" @click="addField(sIdx)">
          + 新增欄位
        </AppButton>
      </div>

      <AppButton variant="secondary" @click="addSection">+ 新增區塊</AppButton>
    </div>

    <!-- Right: Field Editor -->
    <div class="col-span-1">
      <div v-if="getEditingField()" class="bg-white border border-gray-200 rounded-app p-4 sticky top-4">
        <h4 class="font-semibold text-gray-700 text-sm mb-3">欄位編輯</h4>
        <div class="space-y-3">
          <AppInput
            :model-value="getEditingField()!.label"
            label="標籤"
            @update:model-value="getEditingField()!.label = $event; emitUpdate()"
          />
          <AppSelect
            :model-value="getEditingField()!.fieldType ?? 'text'"
            label="類型"
            :options="fieldTypeOptions"
            @update:model-value="getEditingField()!.fieldType = $event as FieldType; emitUpdate()"
          />
          <AppInput
            :model-value="getEditingField()!.placeholder ?? ''"
            label="提示文字"
            @update:model-value="getEditingField()!.placeholder = $event || null; emitUpdate()"
          />
          <div v-if="['select', 'radio', 'checkbox'].includes(getEditingField()!.fieldType ?? 'text')">
            <label class="block text-sm font-medium text-gray-700 mb-1">選項（每行一個）</label>
            <textarea
              :value="optionsToText(getEditingField()!)"
              rows="4"
              class="w-full px-3 py-2 border border-gray-300 rounded-app text-sm"
              @input="setOptionsFromText(getEditingField()!, ($event.target as HTMLTextAreaElement).value)"
            />
          </div>
          <label class="flex items-center gap-2">
            <input
              type="checkbox"
              :checked="getEditingField()!.isRequired"
              class="accent-primary"
              @change="getEditingField()!.isRequired = ($event.target as HTMLInputElement).checked; emitUpdate()"
            />
            <span class="text-sm text-gray-600">必填</span>
          </label>
          <AppButton size="sm" variant="secondary" @click="closeFieldEditor">完成</AppButton>
        </div>
      </div>
      <div v-else class="bg-gray-50 border border-gray-200 rounded-app p-6 text-center text-sm text-gray-400">
        點擊欄位以編輯
      </div>
    </div>
  </div>
</template>
