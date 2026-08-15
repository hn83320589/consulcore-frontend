import httpService from './httpService'
import type {
  SessionNote,
  CreateSessionNoteRequest,
  UpdateSessionNoteRequest,
} from '@/types'

const sessionNoteService = {
  getNotesByClient(clientProfileId: number): Promise<SessionNote[]> {
    return httpService.get<SessionNote[]>(`/session-notes/by-client/${clientProfileId}`)
  },
  getNote(id: number): Promise<SessionNote> {
    return httpService.get<SessionNote>(`/session-notes/${id}`)
  },
  getNoteByAppointment(appointmentId: number): Promise<SessionNote | null> {
    return httpService.get<SessionNote | null>(`/session-notes/by-appointment/${appointmentId}`)
  },
  createNote(payload: CreateSessionNoteRequest): Promise<SessionNote> {
    return httpService.post<SessionNote>('/session-notes', payload)
  },
  updateNote(id: number, payload: UpdateSessionNoteRequest): Promise<SessionNote> {
    return httpService.put<SessionNote>(`/session-notes/${id}`, payload)
  },
  deleteNote(id: number): Promise<void> {
    return httpService.delete<void>(`/session-notes/${id}`)
  },
  lockNote(id: number): Promise<SessionNote> {
    return httpService.post<SessionNote>(`/session-notes/${id}/lock`)
  },
  unlockNote(id: number): Promise<SessionNote> {
    return httpService.post<SessionNote>(`/session-notes/${id}/unlock`)
  },
}

export default sessionNoteService
