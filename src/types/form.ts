// 動態表單型別（對齊後端契約 7.8）
// 巢狀結構：Template → Section[] → Field[]；Submission → Value[]
// 契約要求：options / validationRules / value 皆為 JSON 字串。

export type FieldType =
  | 'text'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'date'
  | 'number'
  | 'scale'

export type FormTemplateType = 'intake_assessment' | 'custom'

// ── Response 型別（讀取，後端回傳） ─────────────────────────
export interface FormFieldResponse {
  id: number
  label: string
  fieldType: FieldType
  options?: string | null // JSON 字串（select/radio/checkbox 選項）
  isRequired: boolean
  sortOrder: number
  placeholder?: string | null
  validationRules?: string | null // JSON 字串
}

export interface FormSectionResponse {
  id: number
  title: string
  sortOrder: number
  isRequired: boolean
  fields: FormFieldResponse[]
}

export interface FormTemplateResponse {
  id: number
  name: string
  type: FormTemplateType
  isSystemDefault: boolean
  version: number
  isActive: boolean
  sections: FormSectionResponse[]
  createdAt: string
  updatedAt: string
}

// ── Request 型別（寫入，巢狀） ─────────────────────────────
export interface CreateFormFieldRequest {
  label: string
  fieldType?: FieldType // 預設 text
  options?: string | null // JSON 字串
  isRequired: boolean
  sortOrder: number
  placeholder?: string | null
  validationRules?: string | null // JSON 字串
}

export interface CreateFormSectionRequest {
  title: string
  sortOrder: number
  isRequired?: boolean
  fields?: CreateFormFieldRequest[]
}

export interface CreateFormTemplateRequest {
  name: string
  type?: FormTemplateType // 預設 intake_assessment
  sections?: CreateFormSectionRequest[]
}

export interface UpdateFormTemplateRequest {
  name?: string | null
  isActive?: boolean | null
  sections?: CreateFormSectionRequest[] | null // 傳 sections 會整組覆蓋並 version++
}

// ── 提交（Submission） ─────────────────────────────────────
export interface FieldValueRequest {
  fieldId: number
  value?: string | null // JSON 字串
}

export interface SubmitFormRequest {
  templateId: number
  clientProfileId: number
  values: FieldValueRequest[]
}

export interface FieldValueResponse {
  fieldId: number
  fieldLabel: string
  fieldType: FieldType
  value?: string | null // JSON 字串
}

export interface FormSubmissionResponse {
  id: number
  templateId: number
  templateName: string
  templateVersion: number
  clientProfileId: number
  clientName: string
  therapistUserId: number
  therapistName: string
  submittedAt: string
  values: FieldValueResponse[]
}
