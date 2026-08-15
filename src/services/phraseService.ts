import httpService from './httpService'
import type { PhraseTemplate, CreatePhraseRequest, UpdatePhraseRequest } from '@/types'

const phraseService = {
  getPhrases(): Promise<PhraseTemplate[]> {
    return httpService.get<PhraseTemplate[]>('/phrase-templates')
  },
  createPhrase(payload: CreatePhraseRequest): Promise<PhraseTemplate> {
    return httpService.post<PhraseTemplate>('/phrase-templates', payload)
  },
  updatePhrase(id: number, payload: UpdatePhraseRequest): Promise<PhraseTemplate> {
    return httpService.put<PhraseTemplate>(`/phrase-templates/${id}`, payload)
  },
  deletePhrase(id: number): Promise<void> {
    return httpService.delete<void>(`/phrase-templates/${id}`)
  },
}

export default phraseService
