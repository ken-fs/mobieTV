import { computed, readonly, watch, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useLearningStore, type PageTabItem } from "@/stores/learning";

/**
 * Tab项接口 - 与TabBar组件兼容
 */
export interface TabItem {
  /** Tab标题 */
  title: string;
  /** Tab名称 */
  name: string;
  /** Tab ID */
  id?: string | number;
  /** Tab类型 */
  type?: string;
  /** 排序 */
  sort?: number;
  /** 是否显示 */
  is_show?: number;
  /** 图标 */
  icon?: string;
  /** URL链接 */
  url?: string;
  /** 其他配置 */
  config?: Record<string, any>;
}

/**
 * 将PageTabItem转换为TabItem
 */
const transformPageTabToTabItem = (pageTab: PageTabItem): TabItem => ({
  ...pageTab,
  title: pageTab.name,
  name: pageTab.page_code, // 确保name是string类型
});

/**
 * 按sort字段排序
 */
const sortBySort = (a: TabItem, b: TabItem): number => {
  const sortA = a.sort ?? 0;
  const sortB = b.sort ?? 0;
  return sortA - sortB;
};

/**
 * 过滤显示的Tab项
 */
const filterVisibleTabs = (tab: TabItem): boolean => {
  return tab.is_show !== 0; // 默认显示，只有明确设置为0时才不显示
};

/**
 * Tab项管理composable
 */
export const useTabItems = () => {
  // ============================================================================
  // Store引用和路由
  // ============================================================================
  const learningStore = useLearningStore();
  const router = useRouter();

  // 初始化完成标志
  const isInitialized = ref(false);

  // ============================================================================
  // 计算属性 - 转换后的Tab列表
  // ============================================================================

  /**
   * 转换后的Tab项列表
   */
  const tabItems = computed<readonly TabItem[]>(() => {
    return readonly(
      learningStore.pageTabList
        .map(transformPageTabToTabItem)
        .filter(filterVisibleTabs)
        .sort(sortBySort)
    );
  });

  /**
   * 是否有可用的Tab项
   */
  const hasTabItems = computed<boolean>(() => tabItems.value.length > 0);

  /**
   * 第一个Tab项（用于默认选中）
   */
  const firstTabItem = computed<TabItem | null>(() =>
    tabItems.value.length > 0 ? tabItems.value[0] : null
  );

  // ============================================================================
  // 工具函数
  // ============================================================================

  /**
   * 根据name查找Tab项
   */
  const findTabByName = (name: string): TabItem | null => {
    return tabItems.value.find((tab) => tab.name === name) || null;
  };

  /**
   * 根据ID查找Tab项
   */
  const findTabById = (id: string | number): TabItem | null => {
    return tabItems.value.find((tab) => tab.id === id) || null;
  };

  /**
   * 获取Tab项的索引
   */
  const getTabIndex = (name: string): number => {
    return tabItems.value.findIndex((tab) => tab.name === name);
  };

  // ============================================================================
  // 计算属性 - 页面状态控制
  // ============================================================================

  /**
   * 是否应该显示loading页面
   * 如果已初始化且有数据，则不显示loading
   */
  const shouldShowLoading = computed<boolean>(() => {
    // 如果初始化完成且有数据，则不显示loading
    if (isInitialized.value && learningStore.pageTabList.length > 0) {
      return false;
    }

    return (
      learningStore.isLoading ||
      (learningStore.pageTabList.length === 0 && !learningStore.hasError)
    );
  });

  /**
   * 是否应该跳转到首页
   * 只有在初始化完成后，且没有数据时才跳转
   */
  const shouldRedirectHome = computed<boolean>(() => {
    return (
      isInitialized.value &&
      !learningStore.isLoading &&
      learningStore.pageTabList.length === 0 &&
      !learningStore.hasError
    );
  });

  // ============================================================================
  // 生命周期和初始化
  // ============================================================================

  /**
   * 初始化Tab列表数据
   * 在composable挂载时从localStorage恢复数据
   */
  onMounted(() => {
    // 尝试从localStorage初始化Tab列表
    const hasCachedData = learningStore.initializeTabList();

    // 标记初始化完成
    isInitialized.value = true;

    // 如果有缓存数据，则不需要进行跳转判断
    if (hasCachedData) {
      console.log(
        "Restored tab list from localStorage, staying on current page"
      );
    }
  });

  // ============================================================================
  // 监听器 - 处理跳转逻辑
  // ============================================================================

  /**
   * 监听跳转状态，延迟跳转到首页以显示loading效果
   * 不使用immediate，避免初始化时误触发
   */
  watch(shouldRedirectHome, (shouldRedirect) => {
    if (shouldRedirect) {
      console.log("No tab items available, redirecting to homepage");
      // 延迟跳转，让用户看到loading状态
      setTimeout(() => {
        router.push("/");
      }, 1000); // 1秒延迟
    }
  });

  // ============================================================================
  // 导出接口
  // ============================================================================
  return {
    // 状态
    tabItems,
    hasTabItems,
    firstTabItem,
    shouldShowLoading,

    // 方法
    findTabByName,
    findTabById,
    getTabIndex,

    // Store方法代理
    isLoading: learningStore.isLoading,
    hasError: learningStore.hasError,
    pageDetail: learningStore.pageDetail,
    isPageDetailLoading: learningStore.isPageDetailLoading,
    hasPageDetailError: learningStore.hasPageDetailError,
    fetchPageTabList: learningStore.fetchPageTabList,
    refreshPageTabList: learningStore.refreshPageTabList,
    fetchPageDetail: learningStore.fetchPageDetail,
    refreshPageDetail: learningStore.refreshPageDetail,
  };
};
