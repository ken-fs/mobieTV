import http from ".";
// import {
//   mockGetUserInfo,
//   mockLogout,
//   mockRefreshToken,
// } from "../utils/mockApi";
import type { ApiResponse } from ".";

/**
 * API基础地址配置
 */
const API_BASE_URLS = {
  IEXUE: "https://app.iexue.com",
  IEXUE100: "https://www.iexue100.com",
} as const;

/**
 * API基础地址类型
 */
type ApiBaseUrlKey = keyof typeof API_BASE_URLS;

/**
 * API端点配置
 */
const API_ENDPOINTS = {
  // 用户认证相关
  AUTH: {
    LOGIN: "/api/user/api/register", // 登录接口
  },
  // 学习相关
  LEARNING: {
    TAB_LIST: "/api/login/api/get_h5_page_tab", // 获取自定义页面Tab列表
    PAGE_DETAIL: "/api/login/api/get_h5_page", // 页面详情配置
    COURSE_SEARCH: "/api/login/api/coursePySearch", // 课程搜索
    TEACHER_SEARCH: "/api/login/api/teacherPySearch", // 通过名师搜索课程
    POPULAR_COURSES: "/api/login/api/courseSearchList", //热门课程
    COURSE_SEARCH_ADD: "api/login/api/courseSearchAdd", // 添加课程搜索记录
    GET_TAG_LIST: "/api/resource.tag/new_get_tag", // 年级-学科-出版社 联动
  },
  // 视频相关
  VIDEO: {
    LIST: "/api/login/api/get_subject_course", // 专题课程列表
    DETAIL: "/api/video/detail", // 视频详情
    SEARCH: "/api/search", // 搜索视频
    SUBJECT_COURSE: "/api/login/api/get_subject_course", // 专题课程列表
    SUBJECT_DETAIL: "/api/resource.subject/get_subject_detail", // 专题课程详情
  },
} as const;

/**
 * 构建完整的API URL
 * @param endpoint API端点路径
 * @param baseUrlKey 基础URL键名，默认为IEXUE
 * @returns 完整的API URL或代理路径
 */
const buildApiUrl = (
  endpoint: string,
  baseUrlKey: ApiBaseUrlKey = "IEXUE"
): string => {
  // 开发环境使用代理，除了 /api/user/api/register
  if (import.meta.env.DEV && !endpoint.includes("/api/user/api/register")) {
    return endpoint;
  }
  // 生产环境或特殊路径使用完整URL
  return `${API_BASE_URLS[baseUrlKey]}${endpoint}`;
};

/**
 * 登录请求参数
 */
export interface LoginParams {
  username?: string;
  password: string;
  phone?: string;
  product_id?: string;
  channel_id?: string;
  terminal_id?: string;
}

/**
 * 登录响应数据
 */
export interface LoginResponse {
  /** 用户ID */
  uid: number;
  /** 是否注册 */
  is_register: number;
  /** 是否赠送VIP */
  is_give_vip: number;
  /** 赠送VIP天数 */
  give_vip_day: number;
  /** 登录图片 */
  login_img: string;
  /** VIP图片 */
  vip_img: string;
  /** 是否游客 */
  is_tourist: number;
  /** 访问令牌 */
  token: string;
  /** 旧令牌/刷新令牌 */
  old_token: string;
}

/**
 * 用户信息
 */
export interface UserInfo {
  id: string | number;
  username: string;
  nickname?: string;
  avatar?: string;
  email?: string;
  phone?: string;
}

export const apiService = {
  // ============================================================================
  // 认证相关接口
  // ============================================================================

  /**
   * 用户登录
   */
  login: async (params: LoginParams): Promise<ApiResponse<LoginResponse>> => {
    // 开发环境使用模拟API
    // if (import.meta.env.DEV || !import.meta.env.VITE_API_BASE_URL) {
    //   return mockLogin(params);
    // }
    return http.$post(buildApiUrl(API_ENDPOINTS.AUTH.LOGIN), params);
  },

  // ============================================================================
  // 原有接口（保持兼容性）
  // ============================================================================

  /**
   * 获取自定义页面Tab列表
   */
  getPageTabList: (params) =>
    http.$post(buildApiUrl(API_ENDPOINTS.LEARNING.TAB_LIST), params),

  /**
   * 获取自定义页面详情
   */
  getPageDetail: (params: any) =>
    http.$post(buildApiUrl(API_ENDPOINTS.LEARNING.PAGE_DETAIL), params),

  /**
   * 热门课程
   */
  getPopularCourses: (params: any) =>
    http.$post(buildApiUrl(API_ENDPOINTS.LEARNING.POPULAR_COURSES), params),

  /**
   * 课程搜索
   */
  searchCourse: (params: any) =>
    http.$post(buildApiUrl(API_ENDPOINTS.LEARNING.COURSE_SEARCH), params),

  /**
   * 添加课程搜索记录
   */
  addCourseSearchRecord: (params: any) =>
    http.$post(buildApiUrl(API_ENDPOINTS.LEARNING.COURSE_SEARCH_ADD), params),

  /**
   * 通过名师搜索课程
   */
  searchTeacher: (params: any) =>
    http.$post(buildApiUrl(API_ENDPOINTS.LEARNING.TEACHER_SEARCH), params),

  /**
   * 获取视频列表
   */
  getVideoList: (params: {
    page?: number;
    limit?: number;
    category?: string;
  }) => http.$post(buildApiUrl(API_ENDPOINTS.VIDEO.LIST), params),

  /**
   * 获取视频详情
   */
  getVideoDetail: (params: { id: string | number }) =>
    http.$post(buildApiUrl(API_ENDPOINTS.VIDEO.DETAIL), params),

  /**
   * 搜索视频
   */
  searchVideo: (params: { keyword: string; page?: number; limit?: number }) =>
    http.$post(buildApiUrl(API_ENDPOINTS.VIDEO.SEARCH), params),

  /**
   * 获取专题课程列表
   */
  getSubjectCourseList: (params) =>
    http.$post(buildApiUrl(API_ENDPOINTS.VIDEO.SUBJECT_COURSE), params),

  /**
   * 获取专题课程详情列表
   */
  getSubjectCourseDetail: (params) =>
    http.$post100(
      buildApiUrl(API_ENDPOINTS.VIDEO.SUBJECT_DETAIL, "IEXUE100"),
      params
    ),

  /**
   * 获取专题分类信息
   */
  getSubjectCategoryInfo: (params: { id: string }) =>
    http.$post(buildApiUrl(API_ENDPOINTS.VIDEO.SUBJECT_COURSE), {
      ...params,
      type: "category",
    }),

  /**
   * 获取相关视频推荐
   */
  getRelatedVideos: (params: { id: string | number; limit?: number }) =>
    http.$post(buildApiUrl(API_ENDPOINTS.VIDEO.SUBJECT_COURSE), params),

  /**
   * 年级-学科-出版社 联动
   */
  getTagList: (params: any) =>
    http.$post100(
      buildApiUrl(API_ENDPOINTS.LEARNING.GET_TAG_LIST, "IEXUE100"),
      params
    ),
};

export default apiService;

// 导出类型
export type { ApiResponse, ApiBaseUrlKey };

// 导出常量（用于调试和其他模块使用）
export { API_BASE_URLS, API_ENDPOINTS, buildApiUrl };
