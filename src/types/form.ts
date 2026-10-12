import type { Schemas } from './schema'

// 動態表單型別（對齊後端契約 7.8）
// 巢狀結構：Template → Section[] → Field[]；Submission → Value[]
// 契約要求：options / validationRules / value 皆為 JSON 字串。

export type FieldType = Schemas['FormFieldResponseDto']['fieldType']

export type FormTemplateType = Schemas['FormTemplateResponseDto']['type']

// ── Response 型別（讀取，後端回傳） ─────────────────────────
export type FormFieldResponse = Schemas['FormFieldResponseDto']

export type FormSectionResponse = Schemas['FormSectionResponseDto']

export type FormTemplateResponse = Schemas['FormTemplateResponseDto']

// ── Request 型別（寫入，巢狀） ─────────────────────────────
export type CreateFormFieldRequest = Schemas['CreateFormFieldDto']

export type CreateFormSectionRequest = Schemas['CreateFormSectionDto']

export type CreateFormTemplateRequest = Schemas['CreateFormTemplateDto']

export type UpdateFormTemplateRequest = Schemas['UpdateFormTemplateDto']

// ── 提交（Submission） ─────────────────────────────────────
export type FieldValueRequest = Schemas['FieldValueDto']

export type SubmitFormRequest = Schemas['SubmitFormDto']

export type FieldValueResponse = Schemas['FieldValueResponseDto']

export type FormSubmissionResponse = Schemas['FormSubmissionResponseDto']
