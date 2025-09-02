<template>
  <div class="p-4">
    <div class="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg mb-6">
      <div class="flex items-center">
        <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
          <span class="text-2xl">👤</span>
        </div>
        <div class="ml-4">
          <h2 class="text-xl font-bold">{{ userInfo.name }}</h2>
          <p class="text-blue-100">{{ userInfo.email }}</p>
        </div>
      </div>
    </div>
    
    <van-cell-group>
      <van-cell title="观看历史" is-link @click="showToast('查看观看历史')" />
      <van-cell title="我的收藏" is-link @click="showToast('查看我的收藏')" />
      <van-cell title="下载管理" is-link @click="showToast('查看下载管理')" />
    </van-cell-group>
    
    <van-cell-group class="mt-4">
      <van-cell title="设置" is-link @click="showToast('打开设置')" />
      <van-cell title="帮助与反馈" is-link @click="showToast('帮助与反馈')" />
      <van-cell title="关于我们" is-link @click="showToast('关于我们')" />
    </van-cell-group>
    
    <div class="mt-6">
      <van-button type="danger" size="large" class="w-full">退出登录</van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { showToast } from 'vant'

const userInfo = ref({
  name: 'MobieTV 用户',
  email: 'user@mobietv.com'
})
</script>