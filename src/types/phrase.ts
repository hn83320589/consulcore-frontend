import type { Schemas } from './schema'

export type PhraseCategory = Schemas['PhraseTemplateResponseDto']['category']

export type PhraseTemplate = Schemas['PhraseTemplateResponseDto']

export type CreatePhraseRequest = Schemas['CreatePhraseTemplateDto']

export type UpdatePhraseRequest = Schemas['UpdatePhraseTemplateDto']
