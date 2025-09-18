<template>
  <div class="tab-bar">
    <div class="tab-container">
      <div 
        v-for="item in tabItems" 
        :key="item.name"
        class="tab-item"
        :class="{ active: activeTab === item.name }"
        @click="handleTabChange(item.name)"
      >
        <!-- 修改：将图标和文字放在一个容器内 -->
        <div class="tab-content">
          <img v-if="item.icon" :src="item.icon" alt="" class="tab-icon">
          <span class="tab-title">{{ item.title }}</span>
        </div>
        <div class="tab-indicator" v-if="activeTab === item.name"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, readonly } from 'vue'
import { findItem, exists, nullish } from '@/utils/functional'

/**
 * 标签页项目的数据结构定义
 * @interface TabItem
 */
interface TabItem {
  /** 显示标题 */
  title: string
  /** 唯一标识符 */
  name: string
  /** 图标路径 - 新增的可选属性 */
  icon?: string
}

/**
 * 主题配置类型定义
 * @interface ThemeConfig
 */
interface ThemeConfig {
  /** 主题色 */
  tabColor: string
  /** 激活状态标题颜色 */
  activeTitleColor: string
  /** 非激活状态标题颜色 */
  inactiveTitleColor: string
  /** 背景色 */
  backgroundColor: string
  /** 底部指示条宽度 */
  lineWidth: string | number
  /** 底部指示条高度 */
  lineHeight: string | number
}

/**
 * 组件属性类型定义
 * @interface Props
 */
interface Props extends Partial<ThemeConfig> {
  /** 标签页项目数组 */
  tabItems: TabItem[]
  /** 当前激活的标签值 */
  modelValue?: string | number
}

/**
 * 事件回调函数类型定义
 * @interface EmitEvents
 */
interface EmitEvents {
  /** 更新激活标签事件 */
  'update:modelValue': [value: string | number]
  /** 标签改变事件 */
  'change': [name: string | number, title: string]
}

// ============================================================================
// 组件属性和事件定义
// ============================================================================

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
  tabColor: '#33CA9E',
  activeTitleColor: '#33CA9E',
  inactiveTitleColor: 'rgba(255, 255, 255, 0.7)',
  backgroundColor: 'rgba(16, 24, 85, 0.95)',
  lineWidth: '20px',
  lineHeight: '3px'
})

const emit = defineEmits<EmitEvents>()

// ============================================================================
// 函数式编程工具函数 - 纯函数，无副作用
// ============================================================================

/**
 * 根据名称查找标签页项目 - 纯函数
 * @param name 标签名称
 * @param items 标签页项目数组
 * @returns 找到的标签页项目或null
 */
const findTabItemByName = (name: string | number, items: readonly TabItem[]): TabItem | null => {
  return findItem(items, item => item.name === name)
}

/**
 * 验证标签名称是否存在 - 纯函数
 * @param name 标签名称
 * @param items 标签页项目数组
 * @returns 是否存在该标签
 */
const isValidTabName = (name: string | number, items: readonly TabItem[]): boolean => {
  return exists(findTabItemByName(name, items))
}

/**
 * 获取默认激活标签 - 纯函数
 * @param modelValue 传入的激活值
 * @param items 标签页项目数组
 * @returns 有效的激活标签值
 */
const getDefaultActiveTab = (modelValue: string | number | undefined, items: readonly TabItem[]): string | number => {
  // 如果modelValue未定义或无效，返回第一个标签的名称
  if (!exists(modelValue) || !isValidTabName(modelValue, items)) {
    return nullish(items[0]?.name, 0)
  }
  return modelValue
}

/**
 * 创建主题配置对象 - 纯函数
 * @param props 组件属性
 * @returns 完整的主题配置
 */
const createThemeConfig = (props: Props): ThemeConfig => ({
  tabColor: props.tabColor!,
  activeTitleColor: props.activeTitleColor!,
  inactiveTitleColor: props.inactiveTitleColor!,
  backgroundColor: props.backgroundColor!,
  lineWidth: props.lineWidth!,
  lineHeight: props.lineHeight!
})

// ============================================================================
// 状态管理 - 响应式状态和计算属性
// ============================================================================

/**
 * 当前激活的标签状态
 */
const activeTab = ref<string | number>(props.modelValue ?? 0)

/**
 * 只读的标签页项目数组，防止意外修改
 */
const readonlyTabItems = computed(() => readonly(props.tabItems))

/**
 * 当前激活的标签页项目 - 计算属性
 */
const currentActiveItem = computed<TabItem | null>(() =>
  findTabItemByName(activeTab.value, readonlyTabItems.value)
)

/**
 * 主题配置 - 计算属性
 */
const themeConfig = computed<ThemeConfig>(() => createThemeConfig(props))

/**
 * 检查标签是否为激活状态 - 计算属性工厂
 * @param name 标签名称
 * @returns 是否为激活状态
 */
const isTabActive = (name: string | number): boolean => activeTab.value === name

// ============================================================================
// 用户交互处理 - 事件处理函数
// ============================================================================

/**
 * 处理标签页切换事件
 * 使用函数式编程方法构建可预测的事件处理流程
 * 
 * @param selectedName 用户选择的标签名称
 */
const handleUserTabSelection = (selectedName: string | number): void => {
  const items = readonlyTabItems.value
  
  // 防止重复点击相同标签
  if (activeTab.value === selectedName) {
    return
  }
  
  // 验证标签名称有效性
  if (!isValidTabName(selectedName, items)) {
    console.warn(`Invalid tab name: ${selectedName}`)
    return
  }
  
  const selectedItem = findTabItemByName(selectedName, items)
  if (!selectedItem) {
    console.error(`Failed to find tab item: ${selectedName}`)
    return
  }
  
  // 更新激活状态
  activeTab.value = selectedName
  
  // 发出事件通知父组件
  emit('update:modelValue', selectedName)
  emit('change', selectedName, selectedItem.title)
}

/**
 * 标签点击事件处理器
 * @param name 标签名称
 */
const handleTabChange = (name: string | number): void => {
  handleUserTabSelection(name)
}

// ============================================================================
// 外部状态同步 - 监听props变化
// ============================================================================

/**
 * 监听外部modelValue变化，同步内部状态
 * 使用函数式方法处理状态更新
 */
watch(
  () => props.modelValue,
  (newValue: string | number | undefined) => {
    const items = readonlyTabItems.value
    const validActiveTab = getDefaultActiveTab(newValue, items)
    
    // 只在值真正改变时更新，避免不必要的重新渲染
    if (activeTab.value !== validActiveTab) {
      activeTab.value = validActiveTab
    }
  },
  { immediate: true }
)

/**
 * 监听标签页数组变化，确保激活状态有效
 */
watch(
  () => props.tabItems,
  (newItems: TabItem[]) => {
    if (newItems.length === 0) return
    
    // 如果当前激活的标签不再存在，重置为第一个
    const currentActive = activeTab.value
    if (!isValidTabName(currentActive, readonly(newItems))) {
      const defaultTab = getDefaultActiveTab(undefined, readonly(newItems))
      activeTab.value = defaultTab
    }
  },
  { immediate: true }
)
</script>

<style lang="less" scoped>
@import '@/assets/styles/variables.less';

.tab-bar {
  width: 100%;
  height: 80px;
  position: relative;
  overflow: hidden;
  border-bottom: 2px solid rgba(255,255,255,0.1);
}

.tab-container {
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 16px 0 0 0;
}

.tab-item {
  flex: 1;
  position: relative;
  cursor: pointer;
  text-align: center;
  padding: 0 12px 16px 12px;
  transition: @transition-normal;
  
  // 修改：添加tab-content容器样式，使图标和文字水平排列且居中
  .tab-content {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  
  // 修改：调整图标样式，添加与文字的间距
  .tab-icon {
    width: 32px;
    height: 32px;
    margin-right: 16px;
    display: inline-block;
  }
  
  .tab-title {
    font-size: 32px;
    font-weight: 500;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
    color: @text-white-70;
    display: inline-block;
    line-height: 1.4;
    transition: @transition-normal;
  }
  
  .tab-indicator {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 32px;
    height: 3px;
    background: @primary-color;
    border-radius: 2px;
    opacity: 0;
    transition: @transition-normal;
  }
  
  &.active {
    .tab-title {
      color: @primary-color;
      font-weight: 600;
    }
    
    .tab-indicator {
      opacity: 1;
    }
  }
  
  &:hover:not(.active) {
    .tab-title {
      color: @text-white-80;
    }
  }
}

// 响应式设计
@media (max-width: @tablet) {
  .tab-item {
    padding: 0 8px 12px 8px;
    
    .tab-icon {
      width: 18px;
      height: 18px;
      margin-right: 10px; // 在平板设备上适当减小间距
    }
    
    .tab-title {
      font-size: 14px;
    }
  }
}

@media (max-width: @mobile) {
  .tab-item {
    padding: 0 4px 10px 4px;
    
    .tab-icon {
      width: 16px;
      height: 16px;
      margin-right: 8px; // 在移动设备上进一步减小间距
    }
    
    .tab-title {
      font-size: 13px;
    }
    
    .tab-indicator {
      width: 16px;
      height: 2px;
    }
  }
}
</style>