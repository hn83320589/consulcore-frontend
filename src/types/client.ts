import type { Schemas } from './schema'

export type ClientStatus = Schemas['ClientProfileResponseDto']['status']
export type TherapistClientStatus = Schemas['TherapistInfoDto']['status']

export type TherapistInfo = Schemas['TherapistInfoDto']

export type ClientProfile = Schemas['ClientProfileResponseDto']

export type CreateClientRequest = Schemas['CreateClientProfileDto']

export type UpdateClientRequest = Schemas['UpdateClientProfileDto']

export interface ClientSearchParams {
  keyword?: string
  idNumberLast4?: string
}

export type ChangeStatusRequest = Schemas['ChangeStatusDto']

export type AssignTherapistRequest = Schemas['AssignTherapistDto']

export type TransferTherapistRequest = Schemas['TransferTherapistDto']

export type InitialCredentials = Schemas['InitialCredentialsDto']
