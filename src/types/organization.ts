import type { Schemas } from './schema'

// 機構基本資料（GET / PUT /api/organization，需要 org.settings）
export type Organization = Schemas['OrganizationResponseDto']

export type UpdateOrganizationRequest = Schemas['UpdateOrganizationDto']
