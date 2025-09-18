<template>
  <Teleport to="body">
    <Transition name="loading-fade">
      <div v-if="visible" class="loading-screen">
        <div class="loading-content">
          <!-- 加载动画 -->
          <div class="loading-spinner">
            <div class="spinner-ring"></div>
          </div>
          <!-- 加载文字 -->
          <div class="loading-text">{{ text }}</div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  // 控制显示状态
  visible: boolean
  // 加载文字，默认为"正在加载中..."
  text?: string
  // 层级，默认为9999
  zIndex?: number
}

withDefaults(defineProps<Props>(), {
  text: '正在加载中...',
  zIndex: 9999
})
</script>

<style lang="less" scoped>
@import '@/assets/styles/variables.less';

// 动画定义
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

// 加载屏幕
.loading-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: @background-gradient;
  .flex-center();
  z-index: v-bind(zIndex);
}

.loading-content {
  .flex-center();
  flex-direction: column;
  text-align: center;
}

// 加载动画
.loading-spinner {
  margin-bottom: 24px;
}

.spinner-ring {
  @spinner-size: 64px;
  @spinner-border: 4px;
  @spinner-inner-border: 2px;
  
  width: @spinner-size;
  height: @spinner-size;
  border: @spinner-border solid rgba(255, 255, 255, 0.1);
  border-top: @spinner-border solid @primary-color;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: -@spinner-border;
    left: -@spinner-border;
    right: -@spinner-border;
    bottom: -@spinner-border;
    border: @spinner-inner-border solid transparent;
    border-top: @spinner-inner-border solid @primary-color;
    border-radius: 50%;
    animation: spin 1.5s linear infinite reverse;
  }
}

// 加载文字
.loading-text {
  font-size: 18px;
  font-weight: 500;
  color: @text-white;
  text-shadow: @shadow-normal;
  animation: pulse 2s ease-in-out infinite;
}

// 过渡动画
.loading-fade-enter-active,
.loading-fade-leave-active {
  transition: @transition-normal;
}

.loading-fade-enter-from,
.loading-fade-leave-to {
  opacity: 0;
}

// 大屏优化
@media (min-width: @desktop) {
  .spinner-ring {
    @large-spinner-size: 80px;
    @large-spinner-border: 5px;
    @large-spinner-inner: 3px;
    
    width: @large-spinner-size;
    height: @large-spinner-size;
    border-width: @large-spinner-border;
    
    &::before {
      border-width: @large-spinner-inner;
    }
  }
  
  .loading-text {
    font-size: 22px;
    margin-top: 32px;
  }
}

// 1280x720 分辨率优化
@media (min-width: 1280px) and (max-height: 720px) {
  .loading-screen {
    background: @background-gradient;
  }
  
  .loading-content {
    transform: scale(1.2);
  }
  
  .spinner-ring {
    @tv-spinner-size: 96px;
    @tv-spinner-border: 6px;
    
    width: @tv-spinner-size;
    height: @tv-spinner-size;
    border-width: @tv-spinner-border;
  }
  
  .loading-text {
    font-size: 24px;
    margin-top: 36px;
  }
}

// 移动端优化
@media (max-width: @tablet) {
  .spinner-ring {
    @mobile-spinner-size: 56px;
    @mobile-spinner-border: 3px;
    @mobile-spinner-inner: 2px;
    
    width: @mobile-spinner-size;
    height: @mobile-spinner-size;
    border-width: @mobile-spinner-border;
    
    &::before {
      border-width: @mobile-spinner-inner;
    }
  }
  
  .loading-text {
    font-size: 16px;
    margin-top: 20px;
  }
}
</style>