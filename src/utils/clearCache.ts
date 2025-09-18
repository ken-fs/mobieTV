/**
 * 清除登录相关缓存的工具函数
 */
import { tokenCookies } from './cookies';

/**
 * 清除所有登录相关的缓存数据
 */
export const clearLoginCache = (): void => {
  // 清除 cookie 中的 token
  tokenCookies.clearTokens();
  
  // 清除 localStorage 中的其他信息
  localStorage.removeItem('user_info');
  localStorage.removeItem('remembered_username');
  
  console.log('✅ 登录缓存已清除');
};

/**
 * 清除所有缓存数据
 */
export const clearAllCache = (): void => {
  localStorage.clear();
  sessionStorage.clear();
  
  console.log('✅ 所有缓存已清除');
};

/**
 * 获取当前登录状态信息
 */
export const getLoginStatus = (): {
  hasToken: boolean;
  hasUserInfo: boolean;
  rememberedUsername: string | null;
} => {
  return {
    hasToken: tokenCookies.hasAccessToken(),
    hasUserInfo: !!localStorage.getItem('user_info'),
    rememberedUsername: localStorage.getItem('remembered_username')
  };
};

// 在开发环境中暴露到window对象，方便调试
if (import.meta.env.DEV) {
  (window as any).clearLoginCache = clearLoginCache;
  (window as any).clearAllCache = clearAllCache;
  (window as any).getLoginStatus = getLoginStatus;
  
  console.log('🔧 调试工具已加载:');
  console.log('  - clearLoginCache() : 清除登录缓存');
  console.log('  - clearAllCache() : 清除所有缓存');
  console.log('  - getLoginStatus() : 获取登录状态');
}