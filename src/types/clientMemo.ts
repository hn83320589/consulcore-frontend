export type MemoCategory = 'personality' | 'trigger' | 'preference' | 'family' | 'other'

export interface ClientMemo {
  id: number
  clientProfileId: number
  therapistUserId: number
  therapistName: string
  category: MemoCategory
  content: string
  isEditable: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateMemoRequest {
  clientProfileId: number
  category?: MemoCategory
  content: string
}

export interface UpdateMemoRequest {
  category?: MemoCategory
  content?: string
}
