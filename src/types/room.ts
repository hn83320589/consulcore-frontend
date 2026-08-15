export interface TherapistRoomInfo {
  therapistUserId: number
  therapistName: string
  assignedAt: string
}

export interface Room {
  id: number
  name: string
  isActive: boolean
  therapists: TherapistRoomInfo[]
  createdAt: string
  updatedAt: string
}

export interface CreateRoomRequest {
  name: string
}

export interface UpdateRoomRequest {
  name?: string
  isActive?: boolean
}

export interface AssignTherapistToRoomRequest {
  therapistUserId: number
}

export interface ActiveRoomCount {
  activeCount: number
}
