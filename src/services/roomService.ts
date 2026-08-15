import httpService from './httpService'
import type {
  Room,
  CreateRoomRequest,
  UpdateRoomRequest,
  AssignTherapistToRoomRequest,
  ActiveRoomCount,
} from '@/types'

const roomService = {
  getRooms(): Promise<Room[]> {
    return httpService.get<Room[]>('/rooms')
  },
  getRoom(id: number): Promise<Room> {
    return httpService.get<Room>(`/rooms/${id}`)
  },
  getActiveCount(): Promise<ActiveRoomCount> {
    return httpService.get<ActiveRoomCount>('/rooms/active-count')
  },
  createRoom(payload: CreateRoomRequest): Promise<Room> {
    return httpService.post<Room>('/rooms', payload)
  },
  updateRoom(id: number, payload: UpdateRoomRequest): Promise<Room> {
    return httpService.put<Room>(`/rooms/${id}`, payload)
  },
  deleteRoom(id: number): Promise<void> {
    return httpService.delete<void>(`/rooms/${id}`)
  },
  assignTherapist(id: number, payload: AssignTherapistToRoomRequest): Promise<Room> {
    return httpService.post<Room>(`/rooms/${id}/assign-therapist`, payload)
  },
  removeTherapist(id: number, therapistUserId: number): Promise<Room> {
    return httpService.delete<Room>(`/rooms/${id}/therapist/${therapistUserId}`)
  },
}

export default roomService
