<template>
  <div class="network-error-overlay" v-if="showError">
    <div class="network-error-content">
      <div class="network-error-icon">
        <img :src="noNetworkImage" alt="网络连接错误" />
      </div>
      <p class="network-error-message">
        网络开小差了，重新连接后继续上一次播放
      </p>
      <button class="reconnect-button" @click="handleReconnect">
        <img :src="retryIcon" alt="重新连接" />
        <span>重新连接</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import noNetworkImage from "@/assets/images/home/no_network.png";
import retryIcon from "@/assets/images/home/icon_retry.png";

// Props
const props = defineProps<{
  show: boolean;
}>();

// Emits
const emit = defineEmits<{
  reconnect: [];
}>();

// 计算属性
const showError = ref(false);

// 监听显示状态变化
watch(
  () => props.show,
  (newVal) => {
    showError.value = newVal;
  }
);

// 处理重新连接
const handleReconnect = () => {
  emit("reconnect");
};
</script>

<style scoped>
.network-error-overlay {
  position: fixed;
  top: 93px;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.network-error-content {
  text-align: center;
  padding: 40px;
  background: linear-gradient(225deg, #101855 0%, #060e2d 100%);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  display: flex;
  flex-direction: column;
}

.network-error-icon {
  margin-bottom: 30px;
}

.network-error-icon img {
  width: 210px;
  height: 230px;
}

.network-error-message {
  color: rgba(255, 255, 255, 0.6);
  font-size: 24px;
  margin-bottom: 30px;
  line-height: 1.5;
}

.reconnect-button {
  background: linear-gradient(270deg, #008ed4 0%, #03caa1 100%);
  border: none;
  border-radius: 999px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 500;
  padding: 28px 63px;
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(135deg, #42d9d9, #36b7b7);
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(58, 200, 200, 0.3);
  }
}

.reconnect-button img {
  width: 20px;
  height: 20px;
  margin-right: 10px;
}
</style>
