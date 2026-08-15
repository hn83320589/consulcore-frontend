export type PhraseCategory = 'subjective' | 'objective' | 'assessment' | 'plan' | 'general'

export interface PhraseTemplate {
  id: number
  category: PhraseCategory
  title: string
  content: string
  sortOrder: number
  createdAt: string
}

export interface CreatePhraseRequest {
  category?: PhraseCategory
  title: string
  content: string
  sortOrder: number
}

export interface UpdatePhraseRequest {
  category?: PhraseCategory
  title?: string
  content?: string
  sortOrder?: number
}
