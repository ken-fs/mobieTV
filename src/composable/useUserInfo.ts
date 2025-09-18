import { ref, computed, readonly } from 'vue'

/**
 * 用户信息接口
 */
interface UserInfo {
  uid?: string | number
  username?: string
  nickname?: string
  avatar?: string
  email?: string
  phone?: string
  [key: string]: any
}

/**
 * 用户信息管理 Composable
 * 提供获取、设置、清除用户信息的功能
 */
export const useUserInfo = () => {
  // ============================================================================
  // 响应式状态
  // ============================================================================
  const userInfo = ref<UserInfo>({})

  // ============================================================================
  // 计算属性
  // ============================================================================
  const uid = computed(() => userInfo.value.uid || '')
  const username = computed(() => userInfo.value.username || '')
  const nickname = computed(() => userInfo.value.nickname || '')
  const avatar = computed(() => userInfo.value.avatar || '')
  const isLoggedIn = computed(() => !!userInfo.value.uid)

  // ============================================================================
  // 纯函数工具
  // ============================================================================
  
  /**
   * 从localStorage获取用户信息
   * @returns 用户信息对象，如果获取失败返回空对象
   */
  const getUserInfoFromStorage = (): UserInfo => {
    try {
      const storedUserInfo = localStorage.getItem('user_info')
      return storedUserInfo ? JSON.parse(storedUserInfo) : {}
    } catch (error) {
      console.error('Failed to parse user info from localStorage:', error)
      return {}
    }
  }

  /**
   * 保存用户信息到localStorage
   * @param info 要保存的用户信息
   */
  const saveUserInfoToStorage = (info: UserInfo): void => {
    try {
      localStorage.setItem('user_info', JSON.stringify(info))
    } catch (error) {
      console.error('Failed to save user info to localStorage:', error)
    }
  }

  /**
   * 从localStorage清除用户信息
   */
  const clearUserInfoFromStorage = (): void => {
    try {
      localStorage.removeItem('user_info')
    } catch (error) {
      console.error('Failed to clear user info from localStorage:', error)
    }
  }

  // ============================================================================
  // 用户信息操作函数
  // ============================================================================

  /**
   * 获取用户信息（从localStorage）
   * @returns 用户信息对象
   */
  const getUserInfo = (): UserInfo => {
    const info = getUserInfoFromStorage()
    userInfo.value = info
    return info
  }

  /**
   * 设置用户信息
   * @param info 要设置的用户信息
   */
  const setUserInfo = (info: UserInfo): void => {
    userInfo.value = { ...userInfo.value, ...info }
    saveUserInfoToStorage(userInfo.value)
  }

  /**
   * 更新用户信息字段
   * @param field 要更新的字段名
   * @param value 新值
   */
  const updateUserInfo = (field: keyof UserInfo, value: any): void => {
    userInfo.value = { ...userInfo.value, [field]: value }
    saveUserInfoToStorage(userInfo.value)
  }

  /**
   * 清除用户信息
   */
  const clearUserInfo = (): void => {
    userInfo.value = {}
    clearUserInfoFromStorage()
  }

  /**
   * 初始化用户信息（从localStorage加载）
   */
  const initUserInfo = (): void => {
    getUserInfo()
  }

  // ============================================================================
  // 返回接口
  // ============================================================================
  return {
    // 响应式状态
    userInfo: readonly(userInfo),
    
    // 计算属性
    uid,
    username,
    nickname,
    avatar,
    isLoggedIn,
    
    // 操作函数
    getUserInfo,
    setUserInfo,
    updateUserInfo,
    clearUserInfo,
    initUserInfo,
    
    // 工具函数
    getUserInfoFromStorage,
    saveUserInfoToStorage,
    clearUserInfoFromStorage,
  }
}

export type { UserInfo }