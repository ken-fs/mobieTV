<template>
  <div v-if="visible" class="drawer-overlay" @click="handleOverlayClick">
    <div class="bottom-drawer" @click.stop>
      <!-- 关闭按钮 -->
      <button class="close-btn" @click="handleClose">×</button>

      <!-- 倍速选择类型 -->
      <div v-if="type === 'speed'" class="drawer-section">
        <h3 class="section-title">倍数选择</h3>
        <div class="option-buttons">
          <button
            v-for="option in options"
            :key="option.value"
            class="option-btn"
            :class="{ active: selectedValue === option.value }"
            @click="handleOptionSelect(option.value)"
          >
            {{ option.label }}
          </button>
        </div>
      </div>
      <!-- 定时定集播放类型 -->
      <template v-else-if="type === 'settings'">
        <div style="position: absolute; top: 50%; transform: translateY(-50%)">
          <!-- 定时停止播放 -->
          <div class="drawer-section flex flex-center mt-2">
            <h3 class="section-title mr-2">定时停止播放</h3>
            <div class="option-buttons">
              <button
                v-for="option in timerOptions"
                :key="option.value"
                class="option-btn"
                :class="{ active: selectedTimerValue === option.value }"
                @click="handleTimerSelect(option.value)"
              >
                {{ option.label }}
              </button>
            </div>
          </div>

          <!-- 定集停止播放 -->
          <div class="drawer-section flex flex-center">
            <h3 class="section-title">定集停止播放</h3>
            <div class="option-buttons">
              <button
                v-for="option in episodeOptions"
                :key="option.value"
                class="option-btn"
                :class="{ active: selectedEpisodeValue === option.value }"
                @click="handleEpisodeSelect(option.value)"
              >
                {{ option.label }}
              </button>
            </div>
          </div>
        </div>
      </template>
      <!-- 通用类型（单个选项组） -->
      <div v-else class="drawer-section">
        <h3 class="section-title">{{ title }}</h3>
        <div class="option-buttons">
          <button
            v-for="option in options"
            :key="option.value"
            class="option-btn"
            :class="{ active: selectedValue === option.value }"
            @click="handleOptionSelect(option.value)"
          >
            {{ option.label }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// TypeScript support only, no imports needed for this component

// ============================================================================
// 类型定义
// ============================================================================
/**
 * 选项数据类型
 */
interface Option {
  /** 选项值 */
  value: string | number;
  /** 显示标签 */
  label: string;
}

/**
 * 组件属性类型定义
 */
interface Props {
  /** 是否显示抽屉 */
  visible: boolean;
  /** 抽屉类型：speed=倍速选择, settings=定时定集设置, custom=自定义 */
  type: "speed" | "settings" | "custom";
  /** 标题（仅用于custom类型） */
  title?: string;
  /** 选项列表 */
  options?: Option[];
  /** 当前选中的值 */
  selectedValue?: string | number;
  /** 定时选项（仅用于settings类型） */
  timerOptions?: Option[];
  /** 定集选项（仅用于settings类型） */
  episodeOptions?: Option[];
  /** 当前选中的定时值 */
  selectedTimerValue?: string | number;
  /** 当前选中的定集值 */
  selectedEpisodeValue?: string | number;
}

/**
 * 事件回调函数类型定义
 */
interface EmitEvents {
  /** 关闭抽屉事件 */
  "update:visible": [visible: boolean];
  /** 选项选择事件 */
  select: [value: string | number];
  /** 定时选择事件 */
  "timer-select": [value: string | number];
  /** 定集选择事件 */
  "episode-select": [value: string | number];
}

// ============================================================================
// 组件属性和事件定义
// ============================================================================
const props = withDefaults(defineProps<Props>(), {
  title: "请选择",
  options: () => [],
  timerOptions: () => [],
  episodeOptions: () => [],
  selectedValue: "",
  selectedTimerValue: "",
  selectedEpisodeValue: "",
});

const emit = defineEmits<EmitEvents>();

// ============================================================================
// 计算属性 - 暂无需要
// ============================================================================

// ============================================================================
// 用户交互处理 - 事件处理函数
// ============================================================================
/**
 * 处理遮罩层点击
 */
const handleOverlayClick = (): void => {
  emit("update:visible", false);
};

/**
 * 处理关闭按钮点击
 */
const handleClose = (): void => {
  emit("update:visible", false);
};

/**
 * 处理选项选择
 */
const handleOptionSelect = (value: string | number): void => {
  emit("select", value);
};

/**
 * 处理定时选择
 */
const handleTimerSelect = (value: string | number): void => {
  emit("timer-select", value);
};

/**
 * 处理定集选择
 */
const handleEpisodeSelect = (value: string | number): void => {
  emit("episode-select", value);
};
</script>

<style lang="less" scoped>
@import "@/assets/styles/variables.less";

// 底部抽屉样式
.drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.bottom-drawer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: @background-gradient;
  border-radius: 20px 20px 0 0;
  padding: 24px 48px;
  height: 369px;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: none;
  box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.3);
  animation: slide-up 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  .close-btn {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 32px;
    height: 32px;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 50%;
    color: @text-white;
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: @transition-fast;
    backdrop-filter: blur(10px);

    &:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: scale(1.1);
    }
  }

  .drawer-section {
    margin-bottom: 48px;
    display: flex;
    align-items: center;
    &:last-child {
      margin-bottom: 0;
    }

    .section-title {
      color: @text-white;
      font-size: 26px;
      font-weight: 600;
      margin: 0 42px 16px 0;
    }

    .option-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 48px;
      .option-btn {
        background: rgba(42, 55, 79, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 25px;
        color: @text-white-70;
        cursor: pointer;
        padding: 0;
        transition: @transition-fast;
        backdrop-filter: blur(10px);
        width: 164px;
        height: 80px;
        text-align: center;
        white-space: nowrap;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 26px;

        &:hover {
          background: rgba(42, 55, 79, 0.8);
          color: @text-white;
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-1px);
        }

        &.active {
          background: @primary-color;
          color: @text-white;
          border-color: @primary-color;
          box-shadow: 0 0 15px rgba(51, 202, 158, 0.3);
          font-weight: 600;
        }
      }
    }
  }
}

@keyframes slide-up {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

// 响应式设计
@media (max-width: @tablet) {
  .bottom-drawer {
    padding: 20px;
    height: 369px; // 保持固定高度

    .close-btn {
      top: 16px;
      right: 16px;
      width: 28px;
      height: 28px;
      font-size: 16px;
    }

    .drawer-section {
      margin-bottom: 24px; // 移动端稍微减少间距

      .section-title {
        font-size: 15px;
        margin-bottom: 12px;
      }

      .option-buttons {
        gap: 24px; // 移动端减少间距但保持合理距离

        .option-btn {
          font-size: 13px;
          width: 120px; // 移动端稍小的按钮宽度
          height: 60px; // 移动端稍小的按钮高度
        }
      }
    }
  }
}
</style>
