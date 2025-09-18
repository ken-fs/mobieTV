import { ref, onMounted, onUnmounted } from 'vue'
import { useTabItems } from '@/composable/useTabItems'
import { useAuthStore } from '@/stores/auth'

/**
 * 侧边栏项目接口
 */
interface SidebarItem {
  title: string
  name: string
}

/**
 * 教育页面通用逻辑 Composable
 * 提供滚动处理、侧边栏管理、API集成等共同功能
 */
export function useEducationPage() {
  // ============================================================================
  // 响应式状态管理
  // ============================================================================

  /** 活跃的侧边栏索引 */
  const activeSidebar = ref<number>(0)
  
  /** 内容容器引用 */
  const contentContainer = ref<HTMLElement>()
  
  /** 是否正在程序化滚动（防止滚动事件冲突） */
  const isScrollingProgrammatically = ref<boolean>(false)
  
  /** 滚动防抖计时器 */
  let scrollTimeout: number | null = null

  // ============================================================================
  // 外部依赖集成
  // ============================================================================

  /** Tab项管理 */
  const tabItemsComposable = useTabItems()
  const { tabItems, shouldShowLoading, fetchPageDetail } = tabItemsComposable

  /** 认证Store */
  const authStore = useAuthStore()

  // ============================================================================
  // 共同的侧边栏配置
  // ============================================================================

  /** 标准侧边栏项目配置 */
  const sidebarItems: SidebarItem[] = [
    { title: "同步名师课堂", name: "sync-teacher" },
    { title: "拓展学习", name: "expand-learning" },
    { title: "微课堂", name: "micro-class" },
    { title: "解题方法", name: "solve-method" },
    { title: "名师点津", name: "teacher-tips" },
    { title: "必考点", name: "key-points" },
    { title: "化学精讲课", name: "chemistry" },
    { title: "读故事记单词", name: "story-words" },
    { title: "薄冰语法", name: "grammar" },
  ]

  // ============================================================================
  // 纯函数工具 - 滚动和导航相关
  // ============================================================================

  /**
   * 查找当前视窗中最靠近顶部的内容区域
   * @param container 滚动容器元素
   * @returns 当前活跃的区域索引
   */
  const findActiveSection = (container: HTMLElement): number => {
    // 修改为只查找标题元素
    const sections = container.querySelectorAll('.section-title')
    const containerRect = container.getBoundingClientRect()
    
    let currentSectionIndex = 0
    let minDistance = Infinity

    sections.forEach((section, index) => {
      const sectionRect = section.getBoundingClientRect()
      const distance = Math.abs(sectionRect.top - containerRect.top)

      if (
        distance < minDistance &&
        sectionRect.top <= containerRect.top + 100
      ) {
        minDistance = distance
        currentSectionIndex = index
      }
    })

    return currentSectionIndex
  }

  /**
   * 平滑滚动到指定的内容区域
   * @param sectionName 目标区域名称
   * @param container 滚动容器元素
   */
  const smoothScrollToSection = (
    sectionName: string | number, 
    container: HTMLElement
  ): void => {
    const targetSection = document.getElementById(`${sectionName}`)
    
    if (targetSection) {
      const containerTop = container.getBoundingClientRect().top
      const sectionTop = targetSection.getBoundingClientRect().top
      const scrollTop = container.scrollTop + (sectionTop - containerTop)

      container.scrollTo({
        top: scrollTop,
        behavior: 'smooth'
      })
    }
  }

  /**
   * 标准化侧边栏值为数字索引
   * @param value 侧边栏值（可能是字符串或数字）
   * @returns 标准化的数字索引
   */
  const normalizeActiveSidebar = (value: string | number): number => {
    return typeof value === 'number' ? value : parseInt(value as string) || 0
  }

  // ============================================================================
  // 事件处理函数
  // ============================================================================

  /**
   * 处理滚动事件（带防抖）
   * 自动更新侧边栏活跃状态
   */
  const handleScroll = (): void => {
    if (isScrollingProgrammatically.value) return

    if (scrollTimeout) {
      clearTimeout(scrollTimeout)
    }

    scrollTimeout = setTimeout(() => {
      const container = contentContainer.value
      if (!container) return

      const currentSectionIndex = findActiveSection(container)

      if (activeSidebar.value !== currentSectionIndex) {
        activeSidebar.value = currentSectionIndex
      }
    }, 100)
  }

  /**
   * 更新侧边栏活跃状态
   * @param value 新的活跃值
   */
  const updateActiveSidebar = (value: string | number): void => {
    const newValue = normalizeActiveSidebar(value)
    if (activeSidebar.value !== newValue) {
      activeSidebar.value = newValue
    }
  }

  /**
   * 处理侧边栏切换事件
   * @param name 目标区域名称
   * @param title 区域标题
   * @param index 区域索引
   */
  const handleSidebarChange = (
    name: string | number,
    title: string,
    index: number
  ): void => {
    const container = contentContainer.value
    if (!container) return

    // 设置标志，防止滚动事件触发
    isScrollingProgrammatically.value = true

    // 平滑滚动到目标区域
    smoothScrollToSection(name, container)

    // 滚动完成后重置标志
    setTimeout(() => {
      isScrollingProgrammatically.value = false
    }, 500)
  }

  // ============================================================================
  // API集成功能
  // ============================================================================

  /**
   * 获取页面详情
   * @param name 页面代码
   * @returns API调用是否成功
   */
  const getPageDetail = async (name: string | number): Promise<boolean> => {
    const requestParams = {
      ...authStore.appConfig,
      page_code: name as string,
    }
    return await fetchPageDetail(requestParams)
  }

  /**
   * 处理标签栏切换事件
   * @param name 标签页代码
   * @returns API调用是否成功
   */
  const handleTabChange = async (name: string | number): Promise<boolean> => {
    try {
      const success = await getPageDetail(name)
      
      // 在切换标签成功后，将右侧内容区域滚动到顶部
      if (success && contentContainer.value) {
        contentContainer.value.scrollTo({
          top: 0,
          behavior: 'smooth' // 平滑滚动效果
        })
      }
      
      return success
    } catch (error) {
      console.error('Error loading page detail:', error)
      return false
    }
  }

  // ============================================================================
  // 生命周期管理
  // ============================================================================

  /**
   * 初始化页面状态
   * 设置默认侧边栏状态并加载首个标签页数据
   */
  const initializePage = (): void => {
    // 设置默认选中第一个侧边栏项
    activeSidebar.value = 0
    
    // 获取排序后的第一个标签页并加载其数据
    const sortedTabs = [...tabItems.value].sort((a: any, b: any) => (a.sort || 0) - (b.sort || 0))
    const firstItem = sortedTabs[0]
    
    if (firstItem?.name) {
      getPageDetail(firstItem.name)
    }
  }

  /**
   * 清理资源
   * 清理定时器等资源
   */
  const cleanup = (): void => {
    if (scrollTimeout) {
      clearTimeout(scrollTimeout)
      scrollTimeout = null
    }
  }

  // ============================================================================
  // 生命周期钩子
  // ============================================================================

  onMounted(() => {
    initializePage()
  })

  onUnmounted(() => {
    cleanup()
  })

  // ============================================================================
  // 导出接口
  // ============================================================================

  return {
    // 响应式状态
    activeSidebar,
    contentContainer,
    sidebarItems,
    
    // Tab管理
    tabItems,
    shouldShowLoading,
    
    // 事件处理函数
    handleScroll,
    updateActiveSidebar,
    handleSidebarChange,
    handleTabChange,
    
    // API函数
    getPageDetail,
    
    // 生命周期函数
    initializePage,
    cleanup,
  }
}