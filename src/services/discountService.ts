import httpService from './httpService'
import type {
  Discount, CreateDiscountRequest, UpdateDiscountRequest, AssignDiscountRequest,
} from '@/types'

const discountService = {
  getDiscounts(): Promise<Discount[]> {
    return httpService.get<Discount[]>('/discounts')
  },
  createDiscount(payload: CreateDiscountRequest): Promise<Discount> {
    return httpService.post<Discount>('/discounts', payload)
  },
  updateDiscount(id: number, payload: UpdateDiscountRequest): Promise<Discount> {
    return httpService.put<Discount>(`/discounts/${id}`, payload)
  },
  deleteDiscount(id: number): Promise<void> {
    return httpService.delete<void>(`/discounts/${id}`)
  },
  assignDiscount(payload: AssignDiscountRequest): Promise<void> {
    return httpService.post<void>('/discounts/assign', payload)
  },
  unassignDiscount(discountId: number, clientProfileId: number): Promise<void> {
    return httpService.delete<void>(`/discounts/${discountId}/client/${clientProfileId}`)
  },
}

export default discountService
