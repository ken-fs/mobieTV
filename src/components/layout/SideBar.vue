<template>
  <div class="sidebar-wrapper">
    <VanSidebar
      v-model="activeKey"
      @change="handleChange"
      class="custom-sidebar"
    >
      <VanSidebarItem
        v-for="item in sidebarItems"
        :key="item.name"
        :title="item.title"
        :disabled="item.disabled"
        :dot="item.dot"
      />
    </VanSidebar>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onUnmounted, computed, readonly } from "vue";
import { Sidebar as VanSidebar, SidebarItem as VanSidebarItem } from "vant";
import { clamp, getItemAt, isValidIndex, findIndexByProperty, exists } from "@/utils/functional";

/**
 * 侧边栏项目的数据结构定义
 * @interface SidebarItem
 */
interface SidebarItem {
  /** 显示标题 */
  title: string;
  /** 唯一标识符 */
  name: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否显示红点提示 */
  dot?: boolean;
}

/**
 * 组件属性类型定义
 * @interface Props
 */
interface Props {
  /** 侧边栏项目数组 */
  sidebarItems: SidebarItem[];
  /** 当前选中的值，可以是索引或名称 */
  modelValue?: string | number;
}

/**
 * 事件回调函数类型定义
 * @interface EmitEvents
 */
interface EmitEvents {
  /** 更新选中值事件 */
  "update:modelValue": [value: string | number];
  /** 选项改变事件 */
  change: [name: string | number, title: string, index: number];
}

// ============================================================================
// 组件属性和事件定义
// ============================================================================

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
});

const emit = defineEmits<EmitEvents>();

/**
 * 根据值获取对应索引 - 纯函数
 * @param value 输入值（数字索引或字符串名称）
 * @param items 侧边栏项目数组
 * @returns 对应的索引值
 */
const getIndexFromValue = (value: string | number, items: readonly SidebarItem[]): number => {
  if (typeof value === "number") {
    return clamp(value, 0, items.length - 1);
  }
  
  const foundIndex = findIndexByProperty(items, 'name', value);
  return foundIndex >= 0 ? foundIndex : 0;
};

/**
 * 根据索引获取侧边栏项目 - 纯函数
 * @param index 索引值
 * @param items 侧边栏项目数组
 * @returns 对应的侧边栏项目或null
 */
const getItemByIndex = (index: number, items: readonly SidebarItem[]): SidebarItem | null => {
  return getItemAt(items, index);
};

// ============================================================================
// 状态管理 - 响应式状态和副作用隔离
// ============================================================================

/**
 * 当前激活的索引状态
 */
const activeKey = ref<number>(0);

/**
 * 只读的侧边栏项目数组，防止意外修改
 */
const readonlySidebarItems = computed(() => readonly(props.sidebarItems));

/**
 * 当前选中的侧边栏项目 - 计算属性
 */
const currentSelectedItem = computed<SidebarItem | null>(() => 
  getItemByIndex(activeKey.value, readonlySidebarItems.value)
);

// ============================================================================
// 副作用管理 - 用户交互状态跟踪
// ============================================================================

/**
 * 用户点击状态标志 - 用于防止状态冲突
 * 使用普通变量避免不必要的响应式开销
 */
let isUserClick = false;

/**
 * 防抖定时器引用
 */
let clickTimeout: number | null = null;

/**
 * 清理定时器的纯函数
 * @param timeout 定时器引用
 */
const clearClickTimeout = (timeout: number | null): void => {
  if (timeout !== null) {
    clearTimeout(timeout);
  }
};

/**
 * 设置用户点击状态的副作用函数
 * @param duration 状态持续时间（毫秒）
 * @returns 清理函数
 */
const setUserClickState = (duration: number = 100): void => {
  // 清除之前的定时器
  clearClickTimeout(clickTimeout);
  
  // 设置用户点击标志
  isUserClick = true;
  
  // 设置定时器重置标志
  clickTimeout = setTimeout(() => {
    isUserClick = false;
    clickTimeout = null;
  }, duration);
};

/**
 * 重置用户点击状态
 */
const resetUserClickState = (): void => {
  clearClickTimeout(clickTimeout);
  isUserClick = false;
  clickTimeout = null;
};

// ============================================================================
// 外部状态同步 - 监听props变化
// ============================================================================

/**
 * 监听外部modelValue变化，同步内部状态
 * 使用函数式方法处理状态更新，避免副作用冲突
 */
watch(
  () => props.modelValue,
  async (newValue: string | number | undefined) => {
    // 防止用户操作期间的外部更新干扰
    if (isUserClick) {
      return;
    }
    
    if (newValue === undefined) return;
    
    const newIndex = getIndexFromValue(newValue, readonlySidebarItems.value);
    
    // 使用异步更新确保时序正确
    await nextTick();
    
    // 双重检查，确保异步期间用户没有新的操作
    if (!isUserClick && activeKey.value !== newIndex) {
      activeKey.value = newIndex;
    }
  },
  { immediate: true }
);

// ============================================================================
// 用户交互处理 - 事件处理函数
// ============================================================================

/**
 * 处理用户点击选择事件
 * 使用函数式编程方法构建可预测的事件处理流程
 * 
 * @param selectedIndex 用户选择的索引
 */
const handleUserSelection = (selectedIndex: number): void => {
  const items = readonlySidebarItems.value;
  
  // 验证索引有效性
  if (!isValidIndex(selectedIndex, items)) {
    console.warn(`Invalid sidebar index: ${selectedIndex}`);
    return;
  }
  
  const selectedItem = getItemByIndex(selectedIndex, items);
  if (!selectedItem) {
    console.error(`Failed to get sidebar item at index: ${selectedIndex}`);
    return;
  }
  
  // 设置用户操作状态，防止状态冲突
  setUserClickState();
  
  // 立即更新本地状态 - 确保UI响应性
  activeKey.value = selectedIndex;
  
  // 发出事件通知父组件 - 遵循Vue数据流原则
  emit("update:modelValue", selectedIndex);
  emit("change", selectedItem.name, selectedItem.title, selectedIndex);
};

/**
 * Vant Sidebar组件的change事件处理器
 * @param index 选中的索引
 */
const handleChange = (index: number): void => {
  handleUserSelection(index);
};

// ============================================================================
// 生命周期管理 - 资源清理
// ============================================================================

/**
 * 组件卸载时的清理工作
 * 遵循函数式编程的资源管理原则
 */
onUnmounted(() => {
  resetUserClickState();
});
</script>

<style lang="less" scoped>
@import "@/assets/styles/variables.less";

.sidebar-wrapper {
  height: 100%;

  .custom-sidebar {
    width: 280px;
    height: 100%;
    background: transparent !important;
    padding: 0 20px;
    // 覆盖Vant默认样式
    :deep(.van-sidebar) {
      background: transparent !important;
    }

    :deep(.van-sidebar-item) {
      // 修改高度为自适应内容
      min-height: 80px;
      display: flex;
      // 调整垂直对齐为flex-start，允许多行文本正常显示
      align-items: flex-start;
      justify-content: center;
      background: transparent !important;
      color: @text-white-70 !important;
      font-size: 30px;
      font-weight: 200;
      // 添加合适的行高，确保文本行之间有足够的间距
      line-height: 1.3;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC",
        "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
      border: none !important;
      padding: 16px 20px;
      margin: 12px 0;
      border-radius: 0 !important;
      text-align: center;
      transition: @transition-normal;
      // 添加最大高度限制和溢出处理，确保内容不会无限增长
      max-height: 120px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;

      &::before {
        display: none !important;
      }

      &::after {
        display: none !important;
      }

      &:hover:not(.van-sidebar-item--select) {
        color: @text-white-80 !important;
        background: transparent !important;
      }

      &.van-sidebar-item--select {
        background: @primary-color !important;
        color: @text-white !important;
        font-weight: 300 !important;
        border-radius: @sidebar-item-radius !important;
        // margin: 16px 20px !important;
        box-shadow: 0 4px 12px rgba(51, 202, 158, 0.3) !important;
      }

      &.van-sidebar-item--disabled {
        color: rgba(255, 255, 255, 0.3) !important;
        cursor: not-allowed;
        background: transparent !important;

        &:hover {
          color: rgba(255, 255, 255, 0.3) !important;
          background: transparent !important;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: @tablet) {
  .sidebar-wrapper {
    .custom-sidebar {
      :deep(.van-sidebar-item) {
        // 调整小屏幕上的行高
        line-height: 1.2;
        font-size: 30px !important;
        padding: 14px 16px !important;
        margin: 10px 0 !important;

        &.van-sidebar-item--select {
          margin: 10px 16px !important;
          background: @primary-color !important;
          border-radius: @sidebar-item-radius !important;
        }
      }
    }
  }
}

@media (max-width: @mobile) {
  .sidebar-wrapper {
    .custom-sidebar {
      :deep(.van-sidebar-item) {
        // 调整移动端上的行高
        line-height: 1.2;
        font-size: 18px !important;
        padding: 12px 14px !important;
        margin: 8px 0 !important;

        &.van-sidebar-item--select {
          margin: 8px 12px !important;
          border-radius: @sidebar-item-radius !important;
          background: @primary-color !important;
        }
      }
    }
  }
}
</style>
