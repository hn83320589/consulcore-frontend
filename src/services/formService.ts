import httpService from './httpService'
import type {
  FormTemplateResponse,
  CreateFormTemplateRequest,
  UpdateFormTemplateRequest,
  FormSubmissionResponse,
  SubmitFormRequest,
} from '@/types'

const formService = {
  // ── Templates ──────────────────────────────
  getTemplates(): Promise<FormTemplateResponse[]> {
    return httpService.get<FormTemplateResponse[]>('/form-templates')
  },
  getTemplate(id: number): Promise<FormTemplateResponse> {
    return httpService.get<FormTemplateResponse>(`/form-templates/${id}`)
  },
  createTemplate(payload: CreateFormTemplateRequest): Promise<FormTemplateResponse> {
    return httpService.post<FormTemplateResponse>('/form-templates', payload)
  },
  updateTemplate(id: number, payload: UpdateFormTemplateRequest): Promise<FormTemplateResponse> {
    return httpService.put<FormTemplateResponse>(`/form-templates/${id}`, payload)
  },
  deleteTemplate(id: number): Promise<void> {
    return httpService.delete<void>(`/form-templates/${id}`)
  },
  cloneTemplate(id: number): Promise<FormTemplateResponse> {
    return httpService.post<FormTemplateResponse>(`/form-templates/${id}/clone`)
  },

  // ── Submissions ────────────────────────────
  submitForm(payload: SubmitFormRequest): Promise<FormSubmissionResponse> {
    return httpService.post<FormSubmissionResponse>('/form-submissions', payload)
  },
  getSubmission(id: number): Promise<FormSubmissionResponse> {
    return httpService.get<FormSubmissionResponse>(`/form-submissions/${id}`)
  },
  getSubmissionsByClient(clientProfileId: number): Promise<FormSubmissionResponse[]> {
    return httpService.get<FormSubmissionResponse[]>(
      `/form-submissions/by-client/${clientProfileId}`,
    )
  },
}

export default formService
