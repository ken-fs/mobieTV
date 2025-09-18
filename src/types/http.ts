import type { HttpService } from '@/http'
import type { apiService } from '@/http/api'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $http: HttpService
    $api: typeof apiService
  }
}

// 导出HTTP相关类型
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface LoginParams {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  refreshToken?: string
  userInfo: {
    id: string | number
    username: string
    nickname?: string
    avatar?: string
    email?: string
    phone?: string
  }
}

export interface UserInfo {
  id: string | number
  username: string
  nickname?: string
  avatar?: string
  email?: string
  phone?: string
}