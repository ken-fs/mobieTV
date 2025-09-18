<template>
  <div class="custom-swipe-container" :class="{ 'no-indicators': !showIndicators }">
    <van-swipe
      :loop="loop"
      :autoplay="autoplay"
      :duration="duration"
      :initial-swipe="initialSwipe"
      :show-indicators="showIndicators"
      :indicator-color="indicatorColor"
      :indicator-active-color="indicatorActiveColor"
      :vertical="vertical"
      :touchable="touchable"
      :width="width"
      :height="height"
      @change="handleChange"
      @drag-start="handleDragStart"
      @drag-end="handleDragEnd"
    >
      <van-swipe-item v-for="(item, index) in items" :key="index">
        <slot :item="item" :index="index">
          <!-- 默认内容展示 -->
          <template v-if="typeof item === 'string'">
            <div class="swipe-item-image-container">
              <img :src="item" :alt="`轮播图 ${index + 1}`" class="swipe-item-image" />
            </div>
          </template>
          <template v-else-if="item && typeof item === 'object' && item.img">
            <div class="swipe-item-image-container">
              <img :src="item.img" :alt="item.alt || `轮播图 ${index + 1}`" class="swipe-item-image" />
              <div v-if="item.title" class="swipe-item-title">{{ item.title }}</div>
            </div>
          </template>
        </slot>
      </van-swipe-item>
    </van-swipe>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Swipe, SwipeItem } from 'vant'
import type { SwipeInstance, SwipeProps } from 'vant'

// 定义属性
const props = withDefaults(defineProps<{
  // 轮播数据
  items: Array<any>
  // 是否循环播放
  loop?: boolean
  // 自动播放时长（毫秒）
  autoplay?: number | false
  // 动画时长（毫秒）
  duration?: number
  // 初始索引
  initialSwipe?: number
  // 是否显示指示器
  showIndicators?: boolean
  // 指示器颜色
  indicatorColor?: string
  // 激活状态指示器颜色
  indicatorActiveColor?: string
  // 是否为纵向滚动
  vertical?: boolean
  // 是否可以通过手势滑动
  touchable?: boolean
  // 轮播宽度
  width?: number
  // 轮播高度
  height?: number | string
}>(), {
  loop: true,
  autoplay: 3000,
  duration: 500,
  initialSwipe: 0,
  showIndicators: true,
  indicatorColor: 'rgba(255, 255, 255, 0.3)',
  indicatorActiveColor: '#fff',
  vertical: false,
  touchable: true,
  height: '200px'
})

// 计算属性
const swipeHeight = computed(() => {
  return typeof props.height === 'string' ? props.height : `${props.height}px`
})

// 定义事件
const emit = defineEmits<{
  // 切换事件
  change: [index: number]
  // 拖动开始事件
  dragStart: []
  // 拖动结束事件
  dragEnd: []
}>()

// 处理切换事件
const handleChange = (index: number) => {
  emit('change', index)
}

// 处理拖动开始事件
const handleDragStart = () => {
  emit('dragStart')
}

// 处理拖动结束事件
const handleDragEnd = () => {
  emit('dragEnd')
}
</script>

<style scoped lang="less">
.custom-swipe-container {
  position: relative;
  
  :deep(.van-swipe) {
    background-color: #f5f5f5;
    border-radius: 20px; // 添加容器圆角
    
    // 自定义指示器位置和样式
    :deep(.van-swipe__indicators) {
      bottom: 10px;
      
      :deep(.van-swipe__indicator) {
        width: 6px;
        height: 6px;
        margin: 0 4px;
        border-radius: 50%;
      }
    }
  }
  
  // 无指示器样式
  &.no-indicators :deep(.van-swipe__indicators) {
    display: none;
  }
  
  // 默认图片样式
  .swipe-item-image-container {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 20px; // 添加容器圆角
    
    .swipe-item-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 20px; // 添加图片圆角
    }
    
    .swipe-item-title {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 10px;
      background: rgba(0, 0, 0, 0.5);
      color: #fff;
      font-size: 14px;
      border-radius: 0 0 20px 20px; // 只为标题底部添加圆角
    }
  }
}
</style>