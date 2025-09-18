<template>
  <div v-if="visible" class="custom-dialog-overlay" @click.self="handleClose">
    <div class="custom-dialog-container">
      <div class="custom-dialog-content">
        <div class="custom-dialog-inner">
          <div class="custom-dialog-title">{{ title }}</div>
          <div class="custom-dialog-message">{{ message }}</div>
          <div class="custom-dialog-actions">
            <button 
              class="custom-dialog-button"
              @click="handleClose"
            >
              {{ buttonText }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

// 定义组件属性
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '温馨提示'
  },
  message: {
    type: String,
    default: '操作已完成'
  },
  buttonText: {
    type: String,
    default: '确认'
  }
})

// 定义组件事件
const emit = defineEmits(['close'])

// 处理关闭弹窗
const handleClose = () => {
  emit('close')
}
</script>

<style scoped lang="less">
.custom-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.custom-dialog-container {
  animation: dialogFadeIn 0.3s ease;
}

.custom-dialog-content {
  width: 590px;
  height: 340px;
  background: url(/src/assets/images/home/dialog.png) no-repeat center / 590px 340px;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: Source Han Sans SC, Source Han Sans SC;
}

.custom-dialog-inner {
  text-align: center;
  width: 100%;
  max-width: 400px;
}

.custom-dialog-title {
  font-size: 30px;
  font-weight: 500;
  color: #242424;
  margin-bottom: 48px;
}

.custom-dialog-message {
  font-size: 24px;
  color: rgba(36,36,36,0.5);
  margin-bottom: 59px;
  line-height: 1.5;
}

.custom-dialog-actions {
  display: flex;
  justify-content: center;
}

.custom-dialog-button {
  background: linear-gradient( 270deg, #008ED4 0%, #03CAA1 100%);
  color: white;
  border: none;
  padding: 20px 84px;
  border-radius: 999px;
  font-size: 26px;
  font-weight: 400;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 204, 153, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
}

// 弹窗淡入动画
@keyframes dialogFadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .custom-dialog-content {
    width: 90%;
    max-width: 320px;
    height: auto;
    min-height: 250px;
    padding: 24px;
  }
  
  .custom-dialog-inner {
    max-width: 280px;
  }
  
  .custom-dialog-title {
    font-size: 18px;
  }
  
  .custom-dialog-message {
    font-size: 14px;
  }
  
  .custom-dialog-button {
    padding: 10px 32px;
    font-size: 14px;
  }
}
</style>