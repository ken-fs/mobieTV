import { defineStore } from "pinia";
import { ref, computed, readonly } from "vue";
import { apiService } from "@/http/api";
import type { ApiResponse } from "@/http/api";
import { exists } from "@/utils/functional";

/**
 * 学习状态枚举
 */
enum LearningStatus {
  IDLE = "idle",
  LOADING = "loading",
  SUCCESS = "success",
  ERROR = "error",
}

/**
 * 页面Tab项接口
 */
export interface PageTabItem {
  /** Tab ID */
  id: string | number;
  /** Tab名称 */
  name: string;
  /** Tab标题 */
  title: string;
  /** 排序 */
  sort?: number;
  /** 图标 */
  tab_img?: string;
  page_code?: string;
}

/**
 * 页面详情接口
 */
export interface PageDetail {
  /** 页面ID */
  id: string | number;
  /** 页面名称 */
  name: string;
  /** 页面标题 */
  title: string;
  /** 页面内容 */
  content?: string;
  /** 页面数据 */
  data?: any;
  /** 创建时间 */
  create_time?: string;
  /** 更新时间 */
  update_time?: string;
  /** 其他配置 */
  config?: Record<string, any>;
}

/**
 * 热门课程接口
 */
export interface PopularCourse {
  /** 课程ID */
  id: string | number;
  /** 课程名称 */
  name: string;
  /** 课程封面 */
  bgimg?: string;
  /** 其他课程信息 */
  [key: string]: any;
}

/**
 * 课程搜索接口
 */
export interface SearchResult {
  /** 课程ID */
  id: string | number;
  /** 课程名称 */
  name: string;
  /** 课程封面 */
  bgimg?: string;
  /** 其他课程信息 */
  [key: string]: any;
}

/**
 * 标签数据接口
 */
export interface TagData {
  /** 标签ID */
  id: string | number;
  /** 标签名称 */
  name: string;
  /** 标签类型 */
  type?: string;
  /** 父标签ID */
  parent_id?: string | number;
  /** 其他标签信息 */
  [key: string]: any;
}

/**
 * 标签列表接口
 */
export interface TagListResponse {
  /** 年级列表 */
  grades?: TagData[];
  /** 学科列表 */
  subjects?: TagData[];
  /** 出版社列表 */
  publishers?: TagData[];
  /** 其他标签组 */
  [key: string]: any[] | undefined;
}
/**
 * 学习相关Store
 */
export const useLearningStore = defineStore("learning", () => {
  // ============================================================================
  // 状态管理 - 响应式状态
  // ============================================================================

  /** 页面Tab列表 */
  const pageTabList = ref<PageTabItem[]>([]);

  /** 当前选中的Tab */
  const activeTabId = ref<string | number>("");

  /** 页面详情数据 */
  const pageDetail = ref<PageDetail | null>(null);
  
  /** 热门课程数据 */
  const popularCourses = ref<PopularCourse[]>([]);

  /** 学习状态 */
  const learningStatus = ref<LearningStatus>(LearningStatus.IDLE);

  /** 页面详情加载状态 */
  const pageDetailStatus = ref<LearningStatus>(LearningStatus.IDLE);
  
  /** 热门课程加载状态 */
  const popularCoursesStatus = ref<LearningStatus>(LearningStatus.IDLE);

  /** 错误信息 */
  const errorMessage = ref<string>("");

  /** 页面详情错误信息 */
  const pageDetailErrorMessage = ref<string>("");
  
  /** 热门课程错误信息 */
  const popularCoursesErrorMessage = ref<string>("");

  /** 课程搜索结果数据 */
  const searchResults = ref<SearchResult[]>([]);

  /** 课程搜索状态 */
  const searchStatus = ref<LearningStatus>(LearningStatus.IDLE);

  /** 课程搜索错误信息 */
  const searchErrorMessage = ref<string>("");
  
  /** 课程搜索结果总数 */
  const searchCourseCount = ref<number>(0);
  
  /** 教师搜索结果数据 */
  const teacherSearchResults = ref<SearchResult[]>([]);

  /** 教师搜索状态 */
  const teacherSearchStatus = ref<LearningStatus>(LearningStatus.IDLE);

  /** 教师搜索错误信息*/
  const teacherSearchErrorMessage = ref<string>("");
  
  /** 教师搜索结果总数 */
  const searchTeacherCount = ref<number>(0);

  /** 标签列表数据 */
  const tagList = ref<TagListResponse>({});

  /** 标签列表加载状态 */
  const tagListStatus = ref<LearningStatus>(LearningStatus.IDLE);

  /** 标签列表错误信息 */
  const tagListErrorMessage = ref<string>("");

  // ============================================================================
  // 计算属性 - 只读派生状态
  // ============================================================================

  /** 是否正在加载 */
  const isLoading = computed<boolean>(
    () => learningStatus.value === LearningStatus.LOADING
  );

  /** 是否有错误 */
  const hasError = computed<boolean>(
    () => learningStatus.value === LearningStatus.ERROR
  );

  /** 页面详情是否正在加载 */
  const isPageDetailLoading = computed<boolean>(
    () => pageDetailStatus.value === LearningStatus.LOADING
  );

  /** 页面详情是否有错误 */
  const hasPageDetailError = computed<boolean>(
    () => pageDetailStatus.value === LearningStatus.ERROR
  );
  
  /** 热门课程是否正在加载 */
  const isPopularCoursesLoading = computed<boolean>(
    () => popularCoursesStatus.value === LearningStatus.LOADING
  );
  
  /** 热门课程是否有错误 */
  const hasPopularCoursesError = computed<boolean>(
    () => popularCoursesStatus.value === LearningStatus.ERROR
  );
  /** 教师搜索是否正在加载 */
  const isTeacherSearchLoading = computed<boolean>(
    () => teacherSearchStatus.value === LearningStatus.LOADING
  );

  /** 教师搜索是否有错误 */
  const hasTeacherSearchError = computed<boolean>(
    () => teacherSearchStatus.value === LearningStatus.ERROR
  );
  /** 只读的Tab列表 */
  const readonlyPageTabList = computed(() => readonly(pageTabList.value));

  /** 只读的页面详情 */
  const readonlyPageDetail = computed(() => readonly(pageDetail.value));

  /** 只读的热门课程 */
  const readonlyPopularCourses = computed(() => readonly(popularCourses.value));

  /** 当前选中的Tab信息 */
  const activeTab = computed<PageTabItem | null>(() => {
    if (!exists(activeTabId.value) || pageTabList.value.length === 0) {
      return null;
    }
    return (
      pageTabList.value.find((tab) => tab.id === activeTabId.value) || null
    );
  });
  /** 标签列表是否正在加载 */
  const isTagListLoading = computed<boolean>(
    () => tagListStatus.value === LearningStatus.LOADING
  );

  /** 标签列表是否有错误 */
  const hasTagListError = computed<boolean>(
    () => tagListStatus.value === LearningStatus.ERROR
  );

  /** 只读的标签列表 */
  const readonlyTagList = computed(() => readonly(tagList.value));

  // ============================================================================
  // 纯函数工具 - 无副作用的工具函数
  // ============================================================================

  /**
   * 保存Tab列表到localStorage
   */
  const saveTabListToStorage = (tabList: PageTabItem[]): void => {
    try {
      localStorage.setItem("pageTabList", JSON.stringify(tabList));
    } catch (error) {
      console.error("Failed to save tab list to localStorage:", error);
    }
  };

  /**
   * 从localStorage获取Tab列表
   */
  const getTabListFromStorage = (): PageTabItem[] => {
    try {
      const storedTabList = localStorage.getItem("pageTabList");
      return storedTabList ? JSON.parse(storedTabList) : [];
    } catch (error) {
      console.error("Failed to get tab list from localStorage:", error);
      return [];
    }
  };

  /**
   * 清除localStorage中的Tab列表
   */
  const clearTabListFromStorage = (): void => {
    try {
      localStorage.removeItem("pageTabList");
    } catch (error) {
      console.error("Failed to clear tab list from localStorage:", error);
    }
  };

  /**
   * 重置学习状态
   */
  const resetLearningState = (): void => {
    learningStatus.value = LearningStatus.IDLE;
    errorMessage.value = "";
  };

  /**
   * 设置活跃的Tab
   */
  const setActiveTab = (tabId: string | number): void => {
    activeTabId.value = tabId;
  };

  /**
   * 清除Tab列表
   */
  const clearPageTabList = (): void => {
    pageTabList.value = [];
    activeTabId.value = "";
    // 同时清除localStorage缓存
    clearTabListFromStorage();
  };

  /**
   * 重置页面详情状态
   */
  const resetPageDetailState = (): void => {
    pageDetailStatus.value = LearningStatus.IDLE;
    pageDetailErrorMessage.value = "";
  };

  /**
   * 清除页面详情
   */
  const clearPageDetail = (): void => {
    pageDetail.value = null;
    resetPageDetailState();
  };
  
  /**
   * 重置热门课程状态
   */
  const resetPopularCoursesState = (): void => {
    popularCoursesStatus.value = LearningStatus.IDLE;
    popularCoursesErrorMessage.value = "";
  };
  
  /** 搜索是否正在加载 */
  const isSearchLoading = computed<boolean>(
    () => searchStatus.value === LearningStatus.LOADING
  );

  /** 搜索是否有错误 */
  const hasSearchError = computed<boolean>(
    () => searchStatus.value === LearningStatus.ERROR
  );

  /** 只读的搜索结果 */
  const readonlySearchResults = computed(() => readonly(searchResults.value));


  // ============================================================================
  // 异步操作 - API调用和状态更新
  // ============================================================================

  /**
   * 获取自定义页面Tab列表
   * @param params 请求参数
   * @returns 是否获取成功
   */
  const fetchPageTabList = async (params): Promise<boolean> => {
    try {
      resetLearningState();
      learningStatus.value = LearningStatus.LOADING;

      const response = await apiService.getPageTabList(params);

      // 响应拦截器已经提取了数据
      if (!response || !Array.isArray(response.list)) {
        throw new Error("Tab列表数据格式错误");
      }

      const tabList = response.list as PageTabItem[];
      pageTabList.value = tabList;
      learningStatus.value = LearningStatus.SUCCESS;

      // 保存到localStorage
      saveTabListToStorage(tabList);

      // 如果有数据且没有选中Tab，默认选中第一个
      if (pageTabList.value.length > 0 && !exists(activeTabId.value)) {
        setActiveTab(pageTabList.value[0].id);
      }

      return true;
    } catch (error) {
      learningStatus.value = LearningStatus.ERROR;
      errorMessage.value =
        error instanceof Error ? error.message : "获取Tab列表失败";
      return false;
    }
  };

  /**
   * 刷新Tab列表
   * @param params 请求参数
   * @returns 是否刷新成功
   */
  const refreshPageTabList = async (params: {
    product_id: string;
    xueduan_id?: string;
  }): Promise<boolean> => {
    clearPageTabList();
    return await fetchPageTabList(params);
  };

  /**
   * 获取页面详情
   * @param params 请求参数
   * @returns 是否获取成功
   */
  const fetchPageDetail = async (params: any): Promise<boolean> => {
    try {
      resetPageDetailState();
      pageDetailStatus.value = LearningStatus.LOADING;
      const response = await apiService.getPageDetail(params);

      // 检查响应是否包含错误信息
      if (response && typeof response === "object" && "code" in response) {
        if (response.code !== 200 && response.code !== 0) {
          throw new Error(
            `API错误 [${response.code}]: ${response.msg || "未知错误"}`
          );
        }
      }

      // 响应拦截器已经提取了数据
      if (!response) {
        throw new Error("页面详情数据格式错误");
      }

      pageDetail.value = response as PageDetail;
      pageDetailStatus.value = LearningStatus.SUCCESS;

      return true;
    } catch (error) {
      pageDetailStatus.value = LearningStatus.ERROR;
      pageDetailErrorMessage.value =
        error instanceof Error ? error.message : "获取页面详情失败";
      return false;
    }
  };

  /**
   * 刷新页面详情
   * @param params 请求参数
   * @returns 是否刷新成功
   */
  const refreshPageDetail = async (params: any): Promise<boolean> => {
    clearPageDetail();
    return await fetchPageDetail(params);
  };

  /**
   * 初始化Tab列表
   * 从localStorage恢复数据，如果没有数据则保持当前状态
   * @returns 是否有缓存数据
   */
  const initializeTabList = (): boolean => {
    const cachedTabList = getTabListFromStorage();

    if (cachedTabList.length > 0) {
      pageTabList.value = cachedTabList;
      learningStatus.value = LearningStatus.SUCCESS;

      // 如果有数据且没有选中Tab，默认选中第一个
      if (!exists(activeTabId.value)) {
        setActiveTab(cachedTabList[0].id);
      }

      return true;
    }

    return false;
  };
   /**
   * 获取热门课程
   */
   const fetchPopularCourses = async (params: any): Promise<boolean> => {
    try {
      resetPopularCoursesState();
      popularCoursesStatus.value = LearningStatus.LOADING;
      const response = await apiService.getPopularCourses(params);

      // 检查响应是否包含错误信息
      if (response && typeof response === "object" && "code" in response) {
        if (response.code !== 200 && response.code !== 0) {
          throw new Error(
            `API错误 [${response.code}]: ${response.msg || "未知错误"}`
          );
        }
      }

      // 响应拦截器已经提取了数据
      if (!response || !Array.isArray(response.list)) {
        throw new Error("热门课程数据格式错误");
      }

      popularCourses.value = response.list as PopularCourse[];
      popularCoursesStatus.value = LearningStatus.SUCCESS;

      return true;
    } catch (error) {
      popularCoursesStatus.value = LearningStatus.ERROR;
      popularCoursesErrorMessage.value =
        error instanceof Error ? error.message : "获取热门课程失败";
      return false;
    }
  };
  /**
     * 刷新热门课程
     */
  const refreshPopularCourses = async (params: any): Promise<boolean> => {
    return fetchPopularCourses(params);
  };
   /**
   * 搜索课程
   */
  const fetchSearchCourse = async (params:any): Promise<boolean> => {
    try {
      // 重置搜索状态
      searchStatus.value = LearningStatus.LOADING;
      searchErrorMessage.value = "";

      // 调用API
      const response = await apiService.searchCourse(params);

      // 处理响应
      if (!response) {
        throw new Error("搜索结果数据格式错误");
      }

      // 更新状态
      searchResults.value = response.list as SearchResult[];
      // 设置课程总数
      searchCourseCount.value = response.total || searchResults.value.length;
      searchStatus.value = LearningStatus.SUCCESS;

      return true;
    } catch (error) {
      searchStatus.value = LearningStatus.ERROR;
      searchErrorMessage.value = 
        error instanceof Error ? error.message : "搜索课程失败";
      searchCourseCount.value = 0;
      return false;
    }
  };
  /**
   * 搜索教师
   * @param params 搜索参数
   * @returns 搜索是否成功
   */
  const fetchSearchTeachers = async (params: any): Promise<boolean> => {
    try {
      // 重置搜索状态
      teacherSearchStatus.value = LearningStatus.LOADING;
      teacherSearchErrorMessage.value = "";
  
      // 调用API
      const response = await apiService.searchTeacher(params);
  
      // 处理响应
      if (!response) {
        throw new Error("搜索教师结果数据格式错误");
      }
  
      // 更新状态
      teacherSearchResults.value = response.list as SearchResult[];
      // 设置教师总数
      searchTeacherCount.value = response.total || teacherSearchResults.value.length;
      teacherSearchStatus.value = LearningStatus.SUCCESS;
  
      return true;
    } catch (error) {
      teacherSearchStatus.value = LearningStatus.ERROR;
      teacherSearchErrorMessage.value = error instanceof Error ? error.message : "搜索教师失败";
      searchTeacherCount.value = 0;
      return false;
    }
  };
   /**
   * 重置标签列表状态
   */
   const resetTagListState = (): void => {
    tagListStatus.value = LearningStatus.IDLE;
    tagListErrorMessage.value = "";
  };

  /**
   * 清除标签列表
   */
  const clearTagList = (): void => {
    tagList.value = {};
    resetTagListState();
  };

  // ... existing async operations ...
  
  /**
   * 获取标签列表（年级-学科-出版社 联动）
   */
  const fetchTagList = async (params: any): Promise<boolean> => {
    try {
      resetTagListState();
      tagListStatus.value = LearningStatus.LOADING;
      
      const response = await apiService.getTagList(params);
      
      // 检查响应是否包含错误信息
      if (response && typeof response === "object" && "code" in response) {
        if (response.code !== 200 && response.code !== 0) {
          throw new Error(
            `API错误 [${response.code}]: ${response.msg || "未知错误"}`
          );
        }
      }
      
      // 更新状态
      tagList.value = response as TagListResponse;
      tagListStatus.value = LearningStatus.SUCCESS;
      
      return true;
    } catch (error) {
      tagListStatus.value = LearningStatus.ERROR;
      tagListErrorMessage.value =
        error instanceof Error ? error.message : "获取标签列表失败";
      return false;
    }
  };

  /**
   * 刷新标签列表
   */
  const refreshTagList = async (params: any): Promise<boolean> => {
    return fetchTagList(params);
  };
  // ============================================================================
  // 导出接口
  // ============================================================================

  return {
    // 状态
    pageTabList: readonlyPageTabList,
    activeTabId: readonly(activeTabId),
    pageDetail: readonlyPageDetail,
    learningStatus: readonly(learningStatus),
    pageDetailStatus: readonly(pageDetailStatus),
    errorMessage: readonly(errorMessage),
    pageDetailErrorMessage: readonly(pageDetailErrorMessage),
    popularCourses:readonlyPopularCourses,
    searchResults:readonlySearchResults,
    searchStatus,
    searchCourseCount,
    teacherSearchResults,
    searchTeacherCount,
    tagList: readonlyTagList,
    tagListStatus: readonly(tagListStatus),
    tagListErrorMessage: readonly(tagListErrorMessage),

    // 计算属性
    isLoading,
    hasError,
    isPageDetailLoading,
    hasPageDetailError,
    activeTab,
    isPopularCoursesLoading,
    hasPopularCoursesError,
    searchErrorMessage,
    isSearchLoading,
    hasSearchError,
    isTeacherSearchLoading,
    hasTeacherSearchError,
    teacherSearchErrorMessage,
    isTagListLoading,
    hasTagListError,

    // 方法
    fetchPageTabList,
    refreshPageTabList,
    fetchPageDetail,
    refreshPageDetail,
    setActiveTab,
    clearPageTabList,
    clearPageDetail,
    resetLearningState,
    resetPageDetailState,
    initializeTabList,
    fetchPopularCourses,
    refreshPopularCourses,
    fetchSearchCourse,
    fetchSearchTeachers,
    fetchTagList,
    refreshTagList,
    clearTagList,
    resetTagListState,
  };
});
