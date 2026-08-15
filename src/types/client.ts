export type ClientStatus = 'pending' | 'active' | 'suspended' | 'closed'
export type TherapistClientStatus = 'active' | 'transferred' | 'closed'

export interface TherapistInfo {
  therapistUserId: number
  therapistName: string
  status: string
  assignedAt: string
}

export interface ClientProfile {
  id: number
  name: string
  idNumber: string | null
  gender: string | null
  dateOfBirth: string | null
  phone: string | null
  email: string | null
  address: string | null
  emergencyContactName: string | null
  emergencyContactPhone: string | null
  emergencyContactRelationship: string | null
  occupation: string | null
  referralSource: string | null
  notes: string | null
  medicalHistory: string | null
  status: ClientStatus
  userId: number | null
  mustChangePassword: boolean
  therapists: TherapistInfo[]
  createdAt: string
  updatedAt: string
}

export interface CreateClientRequest {
  name: string
  idNumber?: string | null
  gender?: string | null
  dateOfBirth?: string | null
  phone?: string | null
  email?: string | null
  address?: string | null
  emergencyContactName?: string | null
  emergencyContactPhone?: string | null
  emergencyContactRelationship?: string | null
  occupation?: string | null
  referralSource?: string | null
  notes?: string | null
  medicalHistory?: string | null
  createAccount: boolean
  therapistUserId?: number | null
}

export interface UpdateClientRequest {
  name?: string | null
  idNumber?: string | null
  gender?: string | null
  dateOfBirth?: string | null
  phone?: string | null
  email?: string | null
  address?: string | null
  emergencyContactName?: string | null
  emergencyContactPhone?: string | null
  emergencyContactRelationship?: string | null
  occupation?: string | null
  referralSource?: string | null
  notes?: string | null
  medicalHistory?: string | null
}

export interface ClientSearchParams {
  keyword?: string
  idNumberLast4?: string
}

export interface ChangeStatusRequest {
  status: ClientStatus
}

export interface AssignTherapistRequest {
  therapistUserId: number
}

export interface TransferTherapistRequest {
  newTherapistUserId: number
  reason?: string | null
}
