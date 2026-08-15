import httpService from './httpService'
import type {
  LoginRequest,
  LoginResponse,
  CurrentUser,
  RegisterRequest,
  ChangePasswordRequest,
} from '@/types'

const authService = {
  login(payload: LoginRequest): Promise<LoginResponse> {
    return httpService.post<LoginResponse>('/auth/login', payload)
  },
  getMe(): Promise<CurrentUser> {
    return httpService.get<CurrentUser>('/auth/me')
  },
  register(payload: RegisterRequest): Promise<LoginResponse> {
    return httpService.post<LoginResponse>('/auth/register', payload)
  },
  changePassword(payload: ChangePasswordRequest): Promise<void> {
    return httpService.put<void>('/auth/change-password', payload)
  },
}

export default authService
