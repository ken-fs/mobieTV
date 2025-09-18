<template>
  <div class="nav-bar-wrapper mb-2">
    <van-nav-bar title="" fixed placeholder>
      <template #right>
        <div class="nav-buttons">
          <van-button text class="nav-button" @click="handleEducationStageClick">
            <img :src="switchImage" :alt="切换" class="switch-image" />
            {{ selectedStageName }} <!-- 保持使用计算属性 -->
          </van-button>
          <van-button text class="nav-button" @click="handleSearchClick">
            <img :src="searchImage" :alt="搜索" class="search-image" />
            搜索
          </van-button>
          <van-button text class="nav-button vip-button" @click="handleMembershipClick">
            <img :src="vipImage" :alt="会员" class="vip-image" />
          </van-button>
        </div>
      </template>
    </van-nav-bar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

// 导入图片资源
import vipImage from "@/assets/images/home/icon_Vip_nav_normal.png"
import switchImage from "@/assets/images/home/switch.png"
import searchImage from "@/assets/images/search/ic_search.png"

const router = useRouter()
// 计算属性：直接从 localStorage 获取当前选中的教育阶段名称
const selectedStageName = computed(() => {
  // 阶段ID到名称的映射
  const stageMap: Record<string, string> = {
    'preschool': '学龄前',
    'primary': '小学',
    'middle': '初中',
    'high': '高中'
  }
  
  const stageId = localStorage.getItem('selectedStage') || 'preschool'
  return stageMap[stageId] || '学龄前'
})

const handleEducationStageClick = () => {
  // 直接从 localStorage 获取当前选中的阶段ID
  const currentStageId = localStorage.getItem('selectedStage')
  
  // 如果有选中的阶段，在路由跳转时传递该信息
  if (currentStageId) {
    // 使用query参数传递选中的阶段信息
    router.push({
      path: '/',
      query: { 
        selectedStage: currentStageId,
        fromLearning: 'true' // 标记是从学习页面返回的
      }
    })
  } else {
    // 如果没有选中的阶段，直接返回首页
    router.push('/')
  }
}


const handleSearchClick = () => {
  router.push('/search')
}

const handleMembershipClick = () => {
  // 处理会员订购点击事件
  alert('会员订购功能即将上线')
}
</script>

<style scoped>
.nav-bar-wrapper :deep(.van-nav-bar__content) {
  margin-top: 30px !important;
  border-bottom: none !important; 
}

.nav-bar-wrapper :deep(.van-nav-bar) {
  background: transparent !important;
}

.nav-bar-wrapper :deep(.van-hairline--bottom:after) {
  border: unset;
}
.nav-bar-wrapper :deep(.van-button__text){
  display: flex !important; /* 添加flex布局 */
  align-items: center !important; /* 垂直居中 */
  justify-content: center !important; /* 水平居中 */
}

.nav-buttons {
  display: flex;
  gap: 12px;
}

.nav-button {
  font-size: 14px;
  padding: 0 8px;
  width: 128px;
  height: 50px;
  border-radius: 999px;
  background: rgba(255,255,255,0.12);
  color: #FFFFFF;
  font-size: 18px;
  border: none;
}

/* 图片样式 */
.switch-image, .search-image{
  vertical-align: middle;
  margin-right: 5px;
  width: 16px;
  height: 16px;
}

.vip-button {
  padding: 0;
  border: unset;
}
</style>