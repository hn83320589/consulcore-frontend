<script setup lang="ts">
import { ref, watch } from 'vue'
import type {
  FormSectionResponse,
  FormFieldResponse,
  FieldValueRequest,
  FieldValueResponse,
} from '@/types'

interface Props {
  sections: FormSectionResponse[]
  // 既有填答（唯讀顯示或預填），value 為 JSON 字串
  values?: FieldValueResponse[]
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  values: () => [],
  readonly: false,
})

const emit = defineEmits<{
  'update:values': [values: FieldValueRequest[]]
  submit: [values: FieldValueRequest[]]
}>()

// 以 fieldId(number) 為 key 存放已解析的值（字串 / 陣列 / 數字）
const formData = ref<Record<number, unknown>>({})

function hydrate(values: FieldValueResponse[]) {
  const next: Record<number, unknown> = {}
  for (const v of values) {
    next[v.fieldId] = parseValue(v.value)
  }
  formData.value = next
}

watch(() => props.values, (v) => hydrate(v), { immediate: true })

// value 為 JSON 字串 → 解析回原生型別；解析失敗時退回原字串
function parseValue(value?: string | null): unknown {
  if (value === null || value === undefined || value === '') return ''
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

// options 為 JSON 字串 → 選項陣列
function parseOptions(field: FormFieldResponse): string[] {
  if (!field.options) return []
  try {
    const arr = JSON.parse(field.options)
    return Array.isArray(arr) ? (arr as string[]) : []
  } catch {
    return []
  }
}

// scale 範圍：預設 1-5，可由 validationRules 的 min/max 覆寫
function scaleRange(field: FormFieldResponse): number[] {
  let min = 1
  let max = 5
  if (field.validationRules) {
    try {
      const rules = JSON.parse(field.validationRules) as { min?: number; max?: number }
      if (typeof rules.min === 'number') min = rules.min
      if (typeof rules.max === 'number') max = rules.max
    } catch {
      // 忽略無效 JSON，沿用預設
    }
  }
  const range: number[] = []
  for (let i = min; i <= max; i++) range.push(i)
  return range
}

function getFieldValue(field: FormFieldResponse): unknown {
  return formData.value[field.id] ?? ''
}

function updateField(fieldId: number, value: unknown) {
  formData.value[fieldId] = value
  emit('update:values', buildValues())
}

// 組成提交用 values：value 一律序列化為 JSON 字串，空值回 null
function buildValues(): FieldValueRequest[] {
  const result: FieldValueRequest[] = []
  for (const section of props.sections) {
    for (const field of section.fields) {
      result.push({ fieldId: field.id, value: serialize(field, formData.value[field.id]) })
    }
  }
  return result
}

function serialize(field: FormFieldResponse, raw: unknown): string | null {
  if (field.fieldType === 'checkbox') {
    const arr = Array.isArray(raw) ? raw : []
    return arr.length ? JSON.stringify(arr) : null
  }
  if (field.fieldType === 'number' || field.fieldType === 'scale') {
    if (raw === '' || raw === null || raw === undefined) return null
    const num = Number(raw)
    return Number.isNaN(num) ? null : JSON.stringify(num)
  }
  const str = raw === null || raw === undefined ? '' : String(raw)
  return str === '' ? null : JSON.stringify(str)
}

function handleSubmit() {
  emit('submit', buildValues())
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <div v-for="section in sections" :key="section.id">
      <h3 class="font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-100">
        {{ section.title }}
      </h3>
      <div class="space-y-4">
        <div v-for="field in section.fields" :key="field.id">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {{ field.label }}
            <span v-if="field.isRequired" class="text-red-400">*</span>
          </label>

          <!-- Text -->
          <input
            v-if="field.fieldType === 'text'"
            type="text"
            :value="getFieldValue(field) as string"
            :placeholder="field.placeholder ?? ''"
            :disabled="readonly"
            :required="field.isRequired"
            class="w-full px-3 py-2 border border-gray-300 rounded-app text-sm disabled:bg-gray-50"
            @input="updateField(field.id, ($event.target as HTMLInputElement).value)"
          />

          <!-- Textarea -->
          <textarea
            v-else-if="field.fieldType === 'textarea'"
            :value="getFieldValue(field) as string"
            :placeholder="field.placeholder ?? ''"
            :disabled="readonly"
            :required="field.isRequired"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-app text-sm disabled:bg-gray-50"
            @input="updateField(field.id, ($event.target as HTMLTextAreaElement).value)"
          />

          <!-- Number -->
          <input
            v-else-if="field.fieldType === 'number'"
            type="number"
            :value="getFieldValue(field) as string"
            :placeholder="field.placeholder ?? ''"
            :disabled="readonly"
            :required="field.isRequired"
            class="w-full px-3 py-2 border border-gray-300 rounded-app text-sm disabled:bg-gray-50"
            @input="updateField(field.id, ($event.target as HTMLInputElement).value)"
          />

          <!-- Date -->
          <input
            v-else-if="field.fieldType === 'date'"
            type="date"
            :value="getFieldValue(field) as string"
            :disabled="readonly"
            :required="field.isRequired"
            class="w-full px-3 py-2 border border-gray-300 rounded-app text-sm disabled:bg-gray-50"
            @input="updateField(field.id, ($event.target as HTMLInputElement).value)"
          />

          <!-- Select -->
          <select
            v-else-if="field.fieldType === 'select'"
            :value="getFieldValue(field) as string"
            :disabled="readonly"
            :required="field.isRequired"
            class="w-full px-3 py-2 border border-gray-300 rounded-app text-sm bg-white disabled:bg-gray-50"
            @change="updateField(field.id, ($event.target as HTMLSelectElement).value)"
          >
            <option value="">{{ field.placeholder ?? '請選擇' }}</option>
            <option v-for="opt in parseOptions(field)" :key="opt" :value="opt">{{ opt }}</option>
          </select>

          <!-- Radio -->
          <div v-else-if="field.fieldType === 'radio'" class="flex flex-wrap gap-4">
            <label v-for="opt in parseOptions(field)" :key="opt" class="flex items-center gap-1.5">
              <input
                type="radio"
                :name="`field_${field.id}`"
                :value="opt"
                :checked="getFieldValue(field) === opt"
                :disabled="readonly"
                class="accent-[var(--color-primary)]"
                @change="updateField(field.id, opt)"
              />
              <span class="text-sm text-gray-600">{{ opt }}</span>
            </label>
          </div>

          <!-- Checkbox -->
          <div v-else-if="field.fieldType === 'checkbox'" class="flex flex-wrap gap-4">
            <label v-for="opt in parseOptions(field)" :key="opt" class="flex items-center gap-1.5">
              <input
                type="checkbox"
                :value="opt"
                :checked="((getFieldValue(field) as string[]) ?? []).includes(opt)"
                :disabled="readonly"
                class="accent-[var(--color-primary)]"
                @change="
                  const arr = [...((getFieldValue(field) as string[]) ?? [])];
                  const idx = arr.indexOf(opt);
                  idx === -1 ? arr.push(opt) : arr.splice(idx, 1);
                  updateField(field.id, arr)
                "
              />
              <span class="text-sm text-gray-600">{{ opt }}</span>
            </label>
          </div>

          <!-- Scale（1-5 量表） -->
          <div v-else-if="field.fieldType === 'scale'" class="flex flex-wrap gap-2">
            <button
              v-for="n in scaleRange(field)"
              :key="n"
              type="button"
              :disabled="readonly"
              class="w-9 h-9 rounded-app border text-sm transition-colors disabled:opacity-60"
              :class="Number(getFieldValue(field)) === n
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-gray-600 border-gray-300 hover:border-primary'"
              @click="updateField(field.id, n)"
            >
              {{ n }}
            </button>
          </div>

          <!-- Fallback readonly display -->
          <p v-else class="text-sm text-gray-500">{{ getFieldValue(field) || '—' }}</p>
        </div>
      </div>
    </div>

    <button
      v-if="!readonly"
      type="submit"
      class="px-4 py-2 bg-primary text-white text-sm rounded-app hover:bg-primary-hover"
    >
      提交
    </button>
  </form>
</template>
