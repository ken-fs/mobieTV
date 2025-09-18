<template>
  <div class="course-display" :style="backgroundStyle">
    <!-- 页面标题区域 -->
    <div class="page-header">
      <van-icon name="arrow-left" class="back-button" @click="handleBack" size="30" />
      <div class="title-container">
        <h1 class="main-title">{{ pageTitle }}</h1>
      </div>
    </div>
    
    <!-- 主要内容区域 -->
    <div 
      ref="mainContentRef"
      class="main-content"
      :class="{ 'scrolled': isScrolled }"
      @scroll="handleScroll"
    >
      <!-- 课程卡片网格 - 直接显示，不再有左侧的年级筛选 -->
      <div class="course-grid">
        <div 
          v-for="course in courseList" 
          :key="course.id" 
          class="course-card"
          @click="handleCourseClick(course)"
        >
          <div class="course-thumbnail">
            <img :src="course.imageUrl" :alt="course.title" />
          </div>
          <div class="course-title">{{ course.title }}</div>
          <div class="course-subtitle">{{ course.subtitle }}</div>
        </div>
      </div>
      
      <!-- 底部占位元素，用于检测是否滚动到底部 -->
      <div class="bottom-placeholder"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'

const router = useRouter()
const route = useRoute()

// 页面状态
const loading = ref(false)
const pageTitle = ref('语文微课堂')
const backgroundImage = ref('http://videos.koo6.cn/iexue_pic/20210112/5ffd4371c2497.png') // 默认背景图

// 滚动状态
const mainContentRef = ref<HTMLElement>()
const isScrolled = ref(false)
const scrollPosition = ref(0)
const prevScrollPosition = ref(0)

// 课程数据
const courseList = ref([
  {
    id: 1,
    title: '纸间动物世界',
    subtitle: '儿童折纸',
    imageUrl: 'https://picsum.photos/200/260?random=1'
  },
  {
    id: 2,
    title: '纸间动物世界',
    subtitle: '儿童折纸',
    imageUrl: 'https://picsum.photos/200/260?random=2'
  },
  {
    id: 3,
    title: '纸间动物世界',
    subtitle: '儿童折纸',
    imageUrl: 'https://picsum.photos/200/260?random=3'
  },
  {
    id: 4,
    title: '纸间动物世界',
    subtitle: '儿童折纸',
    imageUrl: 'https://picsum.photos/200/260?random=4'
  },
  {
    id: 5,
    title: '纸间动物世界',
    subtitle: '儿童折纸',
    imageUrl: 'https://picsum.photos/200/260?random=5'
  },
  {
    id: 6,
    title: '纸间动物世界',
    subtitle: '儿童折纸',
    imageUrl: 'https://picsum.photos/200/260?random=6'
  },
  {
    id: 7,
    title: '纸间动物世界',
    subtitle: '儿童折纸',
    imageUrl: 'https://picsum.photos/200/260?random=7'
  },
  {
    id: 8,
    title: '纸间动物世界',
    subtitle: '儿童折纸',
    imageUrl: 'https://picsum.photos/200/260?random=8'
  }
])

// 背景样式计算属性
const backgroundStyle = computed(() => ({
  backgroundImage: `url(${backgroundImage.value})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat'
}))

// 处理课程点击
const handleCourseClick = (course: any) => {
  console.log('点击的课程:', course)
  // 可以跳转到课程详情页
  // router.push({ name: 'courseDetail', params: { id: course.id } })
}

// 返回上一页
const handleBack = () => {
  router.back()
}

// 处理滚动事件
const handleScroll = () => {
  if (!mainContentRef.value) return
  
  const { scrollTop, scrollHeight, clientHeight } = mainContentRef.value
  prevScrollPosition.value = scrollPosition.value
  scrollPosition.value = scrollTop
  
  console.log('当前滚动位置:', scrollTop)
  
  // 检查是否滚动到底部（添加一点余量）
  const isAtBottom = scrollHeight - scrollTop <= clientHeight + 10
  
  // 向下滚动且超过阈值时，进入滚动状态
  if (scrollTop > 50) {
    isScrolled.value = true
    console.log('进入滚动状态')
  }
  
  // 只有当滚动到顶部时，才恢复初始状态
  if (scrollTop === 0) {
    isScrolled.value = false
    console.log('恢复初始状态')
  }
  
  // 确保滚动到底部时保持当前滚动状态
  console.log('滚动到底部状态:', isAtBottom)
}

// 组件挂载时执行
onMounted(async () => {
  // 从路由参数获取页面标题
  if (route.query.title) {
    pageTitle.value = route.query.title as string
  }
  
  // 模拟API调用获取数据
  try {
    loading.value = true
    
    // 模拟网络请求延迟
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 在实际项目中，这里应该是真实的API调用
    // const response = await api.getCourseDetail()
    // pageTitle.value = response.data.title
    // backgroundImage.value = response.data.backgroundImage
    // courseList.value = response.data.courses
    
  } catch (error) {
    console.error('获取数据失败:', error)
    showToast('获取数据失败，请重试')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped lang="less">
@import '@/assets/styles/variables.less';

.course-display {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  
  .page-header {
    padding: 20px 30px;
    display: flex;
    align-items: flex-start;
    position: relative;
    z-index: 2;
    
    .back-button {
      color: #ffffff;
      margin-right: 16px;
      margin-top: 10px;
    }
    
    .title-container {
      .main-title {
        color: #ffffff;
        font-size: 36px;
        font-weight: 500;
        margin: 0 0 10px 0;
      }
    }
  }
  
  .main-content {
    max-height: calc(100vh - 104px);
    padding: 307px 64px 10px;
    overflow-y: auto;
    position: relative;
    z-index: 2;
    transition: all 0.3s ease;
    
    // 滚动时的样式
    &.scrolled {
      padding-top: 0;
      background-color: rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(5px);
    }
    
    .course-grid {
      width: 100%;
      display: grid;
      grid-template-columns: repeat(4, 1fr); // 改为固定4列
      gap: 24px;
      
      .course-card {
        text-align: center;
        cursor: pointer;
        transition: transform 0.3s;
        
        &:hover {
          transform: translateY(-4px);
        }
        
        .course-thumbnail {
          width: 100%;
          height: 260px;
          margin-bottom: 12px;
          border-radius: 8px;
          overflow: hidden;
          background-color: #fff9c4; /* 浅黄色背景 */
          
          img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            padding: 10px;
          }
        }
        
        .course-title {
          color: #ffffff;
          font-size: 16px;
          font-weight: 500;
          margin-bottom: 4px;
        }
        
        .course-subtitle {
          color: rgba(255, 255, 255, 0.8);
          font-size: 14px;
        }
      }
    }
    
    .bottom-placeholder {
      height: 100px; // 底部占位元素，帮助检测滚动到底部
      width: 100%;
    }
  }
  
  /* 加载状态 */
  .loading {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #ffffff;
    font-size: 18px;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .course-display {
    .page-header {
      .title-container {
        .main-title {
          font-size: 24px;
        }
      }
    }
    
    .main-content {
      padding: 150px 20px 40px;
      flex-direction: column;
      
      &.scrolled {
        padding-top: 0;
      }
      
      .course-grid {
        grid-template-columns: repeat(2, 1fr); // 小屏幕保持2列
        gap: 15px;
      }
    }
  }
}
</style>