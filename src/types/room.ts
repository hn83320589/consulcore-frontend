import type { Schemas } from './schema'

export type TherapistRoomInfo = Schemas['TherapistRoomInfoDto']

export type Room = Schemas['RoomResponseDto']

export type CreateRoomRequest = Schemas['CreateRoomDto']

export type UpdateRoomRequest = Schemas['UpdateRoomDto']

export type AssignTherapistToRoomRequest = Schemas['AssignTherapistToRoomDto']

export type ActiveRoomCount = Schemas['RoomActiveCountDto']
