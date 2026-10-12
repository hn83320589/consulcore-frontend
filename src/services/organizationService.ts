import httpService from './httpService'
import type { Organization, UpdateOrganizationRequest } from '@/types'

const organizationService = {
  getOrganization(): Promise<Organization> {
    return httpService.get<Organization>('/organization')
  },
  updateOrganization(payload: UpdateOrganizationRequest): Promise<Organization> {
    return httpService.put<Organization>('/organization', payload)
  },
}

export default organizationService
