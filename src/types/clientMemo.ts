import type { Schemas } from './schema'

export type MemoCategory = Schemas['ClientMemoResponseDto']['category']

export type ClientMemo = Schemas['ClientMemoResponseDto']

export type CreateMemoRequest = Schemas['CreateClientMemoDto']

export type UpdateMemoRequest = Schemas['UpdateClientMemoDto']
