/**
 * Cookie 工具函数
 * 用于安全地管理认证 token 和其他敏感数据
 */

/**
 * Cookie 选项接口
 */
interface CookieOptions {
  /** 过期时间（天数） */
  days?: number;
  /** 路径 */
  path?: string;
  /** 域名 */
  domain?: string;
  /** 是否仅 HTTPS */
  secure?: boolean;
  /** 是否仅 HTTP（防止 XSS） */
  httpOnly?: boolean;
  /** SameSite 策略 */
  sameSite?: 'Strict' | 'Lax' | 'None';
}

/**
 * 默认 Cookie 选项
 */
const DEFAULT_OPTIONS: CookieOptions = {
  days: 7,
  path: '/',
  secure: location.protocol === 'https:',
  sameSite: 'Lax'
};

/**
 * 设置 Cookie
 * @param name Cookie 名称
 * @param value Cookie 值
 * @param options Cookie 选项
 */
export const setCookie = (name: string, value: string, options: CookieOptions = {}): void => {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
  
  if (opts.days !== undefined) {
    const date = new Date();
    date.setTime(date.getTime() + (opts.days * 24 * 60 * 60 * 1000));
    cookieString += `; expires=${date.toUTCString()}`;
  }
  
  if (opts.path) {
    cookieString += `; path=${opts.path}`;
  }
  
  if (opts.domain) {
    cookieString += `; domain=${opts.domain}`;
  }
  
  if (opts.secure) {
    cookieString += `; secure`;
  }
  
  if (opts.sameSite) {
    cookieString += `; samesite=${opts.sameSite}`;
  }
  
  document.cookie = cookieString;
};

/**
 * 获取 Cookie
 * @param name Cookie 名称
 * @returns Cookie 值或 null
 */
export const getCookie = (name: string): string | null => {
  const nameEQ = encodeURIComponent(name) + '=';
  const cookies = document.cookie.split(';');
  
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length));
    }
  }
  
  return null;
};

/**
 * 删除 Cookie
 * @param name Cookie 名称
 * @param options Cookie 选项（需要与设置时的 path 和 domain 一致）
 */
export const removeCookie = (name: string, options: Partial<CookieOptions> = {}): void => {
  setCookie(name, '', { ...options, days: -1 });
};

/**
 * 检查 Cookie 是否存在
 * @param name Cookie 名称
 * @returns 是否存在
 */
export const hasCookie = (name: string): boolean => {
  return getCookie(name) !== null;
};

/**
 * Token 相关的 Cookie 操作
 */
export const tokenCookies = {
  /**
   * Token Cookie 名称
   */
  TOKEN_NAME: 'access_token',
  
  /**
   * Refresh Token Cookie 名称
   */
  REFRESH_TOKEN_NAME: 'refresh_token',
  
  /**
   * 设置访问令牌
   * @param token 访问令牌
   * @param days 过期天数，默认 1 天
   */
  setAccessToken: (token: string, days: number = 1): void => {
    setCookie(tokenCookies.TOKEN_NAME, token, { days, secure: true, sameSite: 'Lax' });
  },
  
  /**
   * 获取访问令牌
   * @returns 访问令牌或 null
   */
  getAccessToken: (): string | null => {
    return getCookie(tokenCookies.TOKEN_NAME);
  },
  
  /**
   * 设置刷新令牌
   * @param refreshToken 刷新令牌
   * @param days 过期天数，默认 30 天
   */
  setRefreshToken: (refreshToken: string, days: number = 30): void => {
    setCookie(tokenCookies.REFRESH_TOKEN_NAME, refreshToken, { days, secure: true, sameSite: 'Lax' });
  },
  
  /**
   * 获取刷新令牌
   * @returns 刷新令牌或 null
   */
  getRefreshToken: (): string | null => {
    return getCookie(tokenCookies.REFRESH_TOKEN_NAME);
  },
  
  /**
   * 清除所有令牌
   */
  clearTokens: (): void => {
    removeCookie(tokenCookies.TOKEN_NAME);
    removeCookie(tokenCookies.REFRESH_TOKEN_NAME);
  },
  
  /**
   * 检查是否有有效的访问令牌
   * @returns 是否有令牌
   */
  hasAccessToken: (): boolean => {
    return hasCookie(tokenCookies.TOKEN_NAME);
  }
};