import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useEducationPage } from "@/composable/useEducationPage";
import { useLearningStore } from "@/stores/learning";

/**
 * AutoPage教育页面通用逻辑
 * 抽离了所有教育页面的公共代码，减少重复
 */
export function useAutoPageEducation() {
  // ============================================================================
  // 响应式状态和Store
  // ============================================================================
  const activeTab = ref("chinese");
  const learningStore = useLearningStore();
  const router = useRouter();

  // ============================================================================
  // 教育页面通用逻辑
  // ============================================================================
  const {
    activeSidebar,
    contentContainer,
    sidebarItems: staticSidebarItems, // 重命名静态侧边栏项
    tabItems,
    shouldShowLoading,
    handleScroll,
    updateActiveSidebar,
    handleSidebarChange,
    handleTabChange,
  } = useEducationPage();

  // ============================================================================
  // 纯函数工具
  // ============================================================================

  /**
   * 从页面数据中提取侧边栏项目
   * @param data 页面数据数组
   * @returns 侧边栏项目数组
   */
  const extractSidebarItems = (data: any[]): any[] => {
    if (!Array.isArray(data)) return [];

    return data
      .filter(
        (item) => item.type === 1 && item.content && item.content !== "间隔"
      )
      .map((item, index) => ({
        title: item.content,
        name: `section-${index}`,
      }));
  };

  /**
   * 获取页面内容数据
   * @param pageDetail 页面详情对象
   * @returns 处理后的页面数据
   */
  const getPageContentData = (pageDetail: any): any[] => {
    // API返回的数据结构直接包含list属性
    if (!pageDetail?.list) return [];
    return Array.isArray(pageDetail.list) ? pageDetail.list : [];
  };

  // ============================================================================
  // 计算属性
  // ============================================================================

  /**
   * 页面内容数据 - 从store获取
   */
  const pageContentData = computed(() => {
    const data = getPageContentData(learningStore.pageDetail);
    return data;
  });

  /**
   * 动态侧边栏项目 - 从API数据提取或使用静态数据
   */
  const dynamicSidebarItems = computed(() => {
    const apiSidebarItems = extractSidebarItems(pageContentData.value);
    // 如果API没有数据，则使用静态数据作为后备
    return apiSidebarItems.length > 0 ? apiSidebarItems : staticSidebarItems;
  });

  // ============================================================================
  // 事件处理函数
  // ============================================================================

  /**
   * 处理内容项点击事件 - 根据内容类型跳转到相应页面
   * @param item 点击的内容项
   */
  const handleContentClick = (item: any): void => {
    console.log("Content clicked:", item);

    // 检查是否有content_id
    const itemId = item.content_id;

    try {
      // 判断是否为专题课程
      const isSubjectCourse = item.type === 2;
      if (isSubjectCourse) {
        // 跳转到专题课程列表页面
        router.push({
          name: "subjectCourse",
          params: { id: String(itemId) },
        });
      } else if (item.type === 4) {
        // 跳转到视频详情页面
        router.push({
          name: "teacherCourseList",
        });
      } else {
        // 跳转到视频详情页面
        router.push({
          name: "videoDetail",
          params: { id: String(itemId) },
        });
      }
    } catch (error) {
      console.error("Failed to navigate:", error);
    }
  };

  // ============================================================================
  // 调试函数
  // ============================================================================

  /**
   * 创建带页面名称的调试日志函数
   * @param pageName 页面名称
   * @returns 调试日志函数
   */
  const createPageLogger = (pageName: string) => {
    return (data: any) => {
      console.log(`${pageName} - pageContentData length:`, data.length);
      return data;
    };
  };

  // ============================================================================
  // 返回所有需要的状态和方法
  // ============================================================================
  return {
    // 响应式状态
    activeTab,

    // 从useEducationPage继承的状态和方法
    activeSidebar,
    contentContainer,
    staticSidebarItems,
    tabItems,
    shouldShowLoading,
    handleScroll,
    updateActiveSidebar,
    handleSidebarChange,
    handleTabChange,

    // 计算属性
    pageContentData,
    dynamicSidebarItems,

    // 方法
    handleContentClick,
    extractSidebarItems,
    getPageContentData,
    createPageLogger,

    // Store
    learningStore,
  };
}

/**
 * 为特定页面创建专门的composable
 * @param pageName 页面名称，用于调试日志
 * @returns 页面专用的composable
 */
export function useAutoPageEducationForPage(pageName: string) {
  const baseComposable = useAutoPageEducation();
  const pageLogger = baseComposable.createPageLogger(pageName);

  // 为特定页面创建带日志的pageContentData
  const pageContentData = computed(() => {
    const data = baseComposable.getPageContentData(
      baseComposable.learningStore.pageDetail
    );
    return pageLogger(data);
  });

  // 重新计算动态侧边栏项目（基于新的pageContentData）
  const dynamicSidebarItems = computed(() => {
    const apiSidebarItems = baseComposable.extractSidebarItems(
      pageContentData.value
    );
    return apiSidebarItems.length > 0
      ? apiSidebarItems
      : baseComposable.staticSidebarItems;
  });

  return {
    ...baseComposable,
    pageContentData,
    dynamicSidebarItems,
  };
}
