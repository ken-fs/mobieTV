import { defineStore } from "pinia";
import { ref, computed, readonly } from "vue";
import { apiService } from "@/http/api";
import type { LoginParams, UserInfo } from "@/http/api";
import { exists } from "@/utils/functional";
import { tokenCookies } from "@/utils/cookies";

/**
 * 认证状态枚举
 */
enum AuthStatus {
  IDLE = "idle",
  LOADING = "loading",
  SUCCESS = "success",
  ERROR = "error",
}

/**
 * 应用配置接口
 */
interface AppConfig {
  /** 产品ID */
  product_id: string;
  /** 频道ID */
  channel_id: string;
  /** 终端ID */
  terminal_id: string;
}

/**
 * 用户认证Store
 */
export const useAuthStore = defineStore("auth", () => {
  // ============================================================================
  // 状态管理 - 响应式状态
  // ============================================================================

  /** 用户信息 */
  const userInfo = ref<UserInfo | null>(null);

  /** 访问令牌 */
  const accessToken = ref<string | null>(tokenCookies.getAccessToken());

  /** 刷新令牌 */
  const refreshToken = ref<string | null>(tokenCookies.getRefreshToken());

  /** 登录状态 */
  const loginStatus = ref<AuthStatus>(AuthStatus.IDLE);

  /** 登录错误信息 */
  const loginError = ref<string>("");

  /** 应用配置 */
  const appConfig = ref<AppConfig>({
    product_id: "69",
    channel_id: "245",
    terminal_id: "12",
  });

  // ============================================================================
  // 计算属性 - 只读派生状态
  // ============================================================================

  /** 是否已登录 */
  const isAuthenticated = computed<boolean>(() => exists(accessToken.value));

  /** 是否正在登录 */
  const isLoading = computed<boolean>(
    () => loginStatus.value === AuthStatus.LOADING
  );

  /** 是否有登录错误 */
  const hasError = computed<boolean>(
    () => loginStatus.value === AuthStatus.ERROR
  );

  /** 只读用户信息 */
  const readonlyUserInfo = computed(() => readonly(userInfo.value));

  /** 只读应用配置 */
  const readonlyAppConfig = computed(() => readonly(appConfig.value));

  // ============================================================================
  // 纯函数工具 - 无副作用的工具函数
  // ============================================================================

  /**
   * 保存用户信息到本地存储
   */
  const saveUserInfoToStorage = (userData: UserInfo): void => {
    localStorage.setItem("user_info", JSON.stringify(userData));
  };

  /**
   * 从本地存储获取用户信息
   */
  const getUserInfoFromStorage = (): UserInfo | null => {
    try {
      const storedUserInfo = localStorage.getItem("user_info");
      return storedUserInfo ? JSON.parse(storedUserInfo) : null;
    } catch {
      return null;
    }
  };

  /**
   * 保存令牌（token 存储到 cookie，其他信息存储到 localStorage）
   */
  const saveAuthData = (
    token: string,
    refreshTokenValue?: string,
    userData?: UserInfo
  ): void => {
    // Token 存储到 cookie
    tokenCookies.setAccessToken(token);
    if (exists(refreshTokenValue)) {
      tokenCookies.setRefreshToken(refreshTokenValue);
    }

    // 用户信息存储到 localStorage
    if (userData) {
      saveUserInfoToStorage(userData);
    }
  };

  /**
   * 清除所有认证数据
   */
  // const clearAllAuthData = (): void => {
  //   // 清除 cookie 中的 token
  //   tokenCookies.clearTokens();
  //   // 清除 localStorage 中的用户信息
  //   localStorage.removeItem("user_info");
  //   localStorage.removeItem("remembered_username");
  // };

  /**
   * 重置登录状态
   */
  const resetLoginState = (): void => {
    loginStatus.value = AuthStatus.IDLE;
    loginError.value = "";
  };

  // ============================================================================
  // 异步操作 - API调用和状态更新
  // ============================================================================

  /**
   * 用户登录
   * @param params 登录参数
   * @returns 登录是否成功
   */
  const login = async (params: LoginParams): Promise<boolean> => {
    try {
      resetLoginState();
      loginStatus.value = AuthStatus.LOADING;

      const response = await apiService.login(params);

      // 响应拦截器已经提取了 data，所以 response 本身就是登录数据
      if (!response) {
        throw new Error("登录响应数据为空");
      }

      const { token, old_token, uid } = response as any;

      // 构建用户信息对象
      const userData: UserInfo = {
        id: uid,
        username: params.username || params.phone || "",
        phone: params.phone,
        nickname: "",
        avatar: "",
        email: "",
      };

      // 更新状态
      accessToken.value = token;
      refreshToken.value = old_token || null; // 使用 old_token 作为刷新令牌
      userInfo.value = userData;
      loginStatus.value = AuthStatus.SUCCESS;

      // 保存认证数据
      saveAuthData(token, old_token, userData);

      return true;
    } catch (error) {
      loginStatus.value = AuthStatus.ERROR;
      loginError.value = error instanceof Error ? error.message : "登录失败";
      return false;
    }
  };

  /**
   * 刷新访问令牌
   */
  // const refreshAccessToken = async (): Promise<boolean> => {
  //   if (!exists(refreshToken.value)) return false;

  //   try {
  //     const response = await apiService.refreshToken(refreshToken.value);
  //     const { token } = response.data;

  //     accessToken.value = token;
  //     // 只保存 token 到 cookie，不需要保存用户信息
  //     tokenCookies.setAccessToken(token);

  //     return true;
  //   } catch (error) {
  //     console.error("刷新令牌失败:", error);
  //     await logout();
  //     return false;
  //   }
  // };

  /**
   * 初始化认证状态
   * 在应用启动时调用，从存储中恢复认证状态
   */
  const initializeAuth = async (): Promise<void> => {
    // 从 localStorage 恢复用户信息
    const storedUserInfo = getUserInfoFromStorage();
    if (storedUserInfo) {
      userInfo.value = storedUserInfo;
    }

    // 如果没有 token，直接返回
    if (!isAuthenticated.value) return;
    console.log({ isAuthenticated, storedUserInfo });
    // 尝试获取最新用户信息来验证令牌有效性
    // const success = await fetchUserInfo()
    // if (!storedUserInfo) {
    //   // 如果获取用户信息失败，尝试刷新令牌
    //   await refreshAccessToken();
    // }
  };

  // ============================================================================
  // 导出接口
  // ============================================================================

  return {
    // 状态
    userInfo: readonlyUserInfo,
    accessToken: readonly(accessToken),
    refreshToken: readonly(refreshToken),
    loginStatus: readonly(loginStatus),
    loginError: readonly(loginError),
    appConfig: readonlyAppConfig,

    // 计算属性
    isAuthenticated,
    isLoading,
    hasError,

    // 方法
    login,
    initializeAuth,
    resetLoginState,
  };
});
