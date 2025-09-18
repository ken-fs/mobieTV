/**
 * 模拟API数据和响应
 * 用于测试登录功能
 */

import type { LoginParams, LoginResponse, UserInfo } from '@/http/api'

/**
 * 模拟用户数据
 */
const MOCK_USERS = [
  {
    id: 1,
    username: 'admin',
    password: '123456',
    nickname: '管理员',
    email: 'admin@mobietv.com',
    avatar: ''
  },
  {
    id: 2,
    username: 'user',
    password: '123456',
    nickname: 'MobieTV用户',
    email: 'user@mobietv.com',
    avatar: ''
  },
  {
    id: 3,
    username: 'test',
    password: '123456',
    nickname: '测试用户',
    email: 'test@mobietv.com',
    avatar: ''
  }
]

/**
 * 模拟延迟
 */
const mockDelay = (ms: number = 1000) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * 生成模拟Token
 */
const generateMockToken = (userId: number): string => {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2)
  return `mock_token_${userId}_${timestamp}_${randomString}`
}

/**
 * 生成模拟刷新Token
 */
const generateMockRefreshToken = (userId: number): string => {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2)
  return `mock_refresh_${userId}_${timestamp}_${randomString}`
}

/**
 * 模拟登录API
 */
export const mockLogin = async (params: LoginParams): Promise<{ code: number; message: string; data: LoginResponse }> => {
  // 模拟网络延迟
  await mockDelay(800)
  
  const { username, password } = params
  
  // 查找用户
  const user = MOCK_USERS.find(u => u.username === username)
  
  // 用户不存在
  if (!user) {
    return {
      code: 400,
      message: '用户名不存在',
      data: {} as LoginResponse
    }
  }
  
  // 密码错误
  if (user.password !== password) {
    return {
      code: 400,
      message: '密码错误',
      data: {} as LoginResponse
    }
  }
  
  // 登录成功
  const token = generateMockToken(user.id)
  const refreshToken = generateMockRefreshToken(user.id)
  
  const response: LoginResponse = {
    token,
    refreshToken,
    userInfo: {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      email: user.email,
      avatar: user.avatar
    }
  }
  
  return {
    code: 200,
    message: '登录成功',
    data: response
  }
}

/**
 * 模拟获取用户信息API
 */
export const mockGetUserInfo = async (): Promise<{ code: number; message: string; data: UserInfo }> => {
  // 模拟网络延迟
  await mockDelay(500)
  
  // 从localStorage获取token（模拟验证）
  const token = localStorage.getItem('access_token')
  
  if (!token || !token.startsWith('mock_token_')) {
    return {
      code: 401,
      message: 'Token无效或已过期',
      data: {} as UserInfo
    }
  }
  
  // 从token中解析用户ID
  const tokenParts = token.split('_')
  const userId = parseInt(tokenParts[2])
  const user = MOCK_USERS.find(u => u.id === userId)
  
  if (!user) {
    return {
      code: 401,
      message: '用户不存在',
      data: {} as UserInfo
    }
  }
  
  const userInfo: UserInfo = {
    id: user.id,
    username: user.username,
    nickname: user.nickname,
    email: user.email,
    avatar: user.avatar
  }
  
  return {
    code: 200,
    message: '获取用户信息成功',
    data: userInfo
  }
}

/**
 * 模拟登出API
 */
export const mockLogout = async (): Promise<{ code: number; message: string; data: null }> => {
  // 模拟网络延迟
  await mockDelay(300)
  
  return {
    code: 200,
    message: '退出登录成功',
    data: null
  }
}

/**
 * 模拟刷新Token API
 */
export const mockRefreshToken = async (refreshToken: string): Promise<{ code: number; message: string; data: { token: string } }> => {
  // 模拟网络延迟
  await mockDelay(500)
  
  if (!refreshToken || !refreshToken.startsWith('mock_refresh_')) {
    return {
      code: 401,
      message: 'Refresh token无效',
      data: { token: '' }
    }
  }
  
  // 从refresh token中解析用户ID
  const tokenParts = refreshToken.split('_')
  const userId = parseInt(tokenParts[2])
  
  if (!MOCK_USERS.find(u => u.id === userId)) {
    return {
      code: 401,
      message: '用户不存在',
      data: { token: '' }
    }
  }
  
  // 生成新的访问token
  const newToken = generateMockToken(userId)
  
  return {
    code: 200,
    message: 'Token刷新成功',
    data: { token: newToken }
  }
}