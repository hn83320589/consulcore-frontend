import type { Schemas } from './schema'

export type SessionNoteFormat = Schemas['SessionNoteResponseDto']['format']
export type SessionNoteType = Schemas['SessionNoteResponseDto']['type']

export type SessionNote = Schemas['SessionNoteResponseDto']

export type CreateSessionNoteRequest = Schemas['CreateSessionNoteDto']

export type UpdateSessionNoteRequest = Schemas['UpdateSessionNoteDto']
