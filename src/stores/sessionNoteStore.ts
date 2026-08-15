import { defineStore } from 'pinia'
import { ref } from 'vue'
import sessionNoteService from '@/services/sessionNoteService'
import phraseService from '@/services/phraseService'
import clientMemoService from '@/services/clientMemoService'
import type {
  SessionNote,
  CreateSessionNoteRequest,
  UpdateSessionNoteRequest,
  PhraseTemplate,
  CreatePhraseRequest,
  UpdatePhraseRequest,
  ClientMemo,
  CreateMemoRequest,
  UpdateMemoRequest,
} from '@/types'

export const useSessionNoteStore = defineStore('sessionNote', () => {
  // ── Session Notes ─────────────────────────
  const notes = ref<SessionNote[]>([])
  const currentNote = ref<SessionNote | null>(null)
  const loading = ref(false)

  async function fetchNotesByClient(clientProfileId: number) {
    loading.value = true
    try {
      notes.value = await sessionNoteService.getNotesByClient(clientProfileId)
    } finally {
      loading.value = false
    }
  }

  async function fetchNote(id: number) {
    currentNote.value = await sessionNoteService.getNote(id)
    return currentNote.value
  }

  async function fetchNoteByAppointment(appointmentId: number) {
    currentNote.value = await sessionNoteService.getNoteByAppointment(appointmentId)
    return currentNote.value
  }

  function setCurrentNote(note: SessionNote | null) {
    currentNote.value = note
  }

  async function createNote(payload: CreateSessionNoteRequest) {
    const created = await sessionNoteService.createNote(payload)
    notes.value.unshift(created)
    currentNote.value = created
    return created
  }

  async function updateNote(id: number, payload: UpdateSessionNoteRequest) {
    const updated = await sessionNoteService.updateNote(id, payload)
    currentNote.value = updated
    const idx = notes.value.findIndex((n) => n.id === id)
    if (idx !== -1) notes.value[idx] = updated
    return updated
  }

  async function lockNote(id: number) {
    const updated = await sessionNoteService.lockNote(id)
    if (currentNote.value?.id === id) currentNote.value = updated
    const idx = notes.value.findIndex((n) => n.id === id)
    if (idx !== -1) notes.value[idx] = updated
    return updated
  }

  async function unlockNote(id: number) {
    const updated = await sessionNoteService.unlockNote(id)
    if (currentNote.value?.id === id) currentNote.value = updated
    const idx = notes.value.findIndex((n) => n.id === id)
    if (idx !== -1) notes.value[idx] = updated
    return updated
  }

  // ── Phrases ───────────────────────────────
  const phrases = ref<PhraseTemplate[]>([])

  async function fetchPhrases() {
    phrases.value = await phraseService.getPhrases()
  }

  async function createPhrase(payload: CreatePhraseRequest) {
    const created = await phraseService.createPhrase(payload)
    phrases.value.push(created)
    return created
  }

  async function updatePhrase(id: number, payload: UpdatePhraseRequest) {
    const updated = await phraseService.updatePhrase(id, payload)
    const idx = phrases.value.findIndex((p) => p.id === id)
    if (idx !== -1) phrases.value[idx] = updated
    return updated
  }

  async function deletePhrase(id: number) {
    await phraseService.deletePhrase(id)
    phrases.value = phrases.value.filter((p) => p.id !== id)
  }

  // ── Client Memos ──────────────────────────
  const memos = ref<ClientMemo[]>([])

  async function fetchMemos(clientProfileId: number) {
    memos.value = await clientMemoService.getMemos(clientProfileId)
  }

  async function createMemo(payload: CreateMemoRequest) {
    const created = await clientMemoService.createMemo(payload)
    memos.value.unshift(created)
    return created
  }

  async function updateMemo(id: number, payload: UpdateMemoRequest) {
    const updated = await clientMemoService.updateMemo(id, payload)
    const idx = memos.value.findIndex((m) => m.id === id)
    if (idx !== -1) memos.value[idx] = updated
    return updated
  }

  async function deleteMemo(id: number) {
    await clientMemoService.deleteMemo(id)
    memos.value = memos.value.filter((m) => m.id !== id)
  }

  return {
    notes, currentNote, loading,
    fetchNotesByClient, fetchNote, fetchNoteByAppointment, setCurrentNote,
    createNote, updateNote, lockNote, unlockNote,
    phrases, fetchPhrases, createPhrase, updatePhrase, deletePhrase,
    memos, fetchMemos, createMemo, updateMemo, deleteMemo,
  }
})
