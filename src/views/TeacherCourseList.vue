<template>
  <div class="teacher-course-list"> 
    <!-- 保留页面标题和返回按钮 -->
    <div class="page-header">
      <div class="header-content">
        <van-icon name="arrow-left" class="back-button" @click="handleBack" size="30" />
        <h1>{{ pageTitle }}</h1>
      </div>
    </div>
    
    <!-- 使用筛选组件 -->
    <FilterPanel 
      :grades="grades"
      :textbooks="textbooks"
      :years="years"
      :selectedGrade="selectedGrade"
      :selectedTextbook="selectedTextbook"
      :selectedYear="selectedYear"
      @grade-change="selectGrade"
      @textbook-change="selectTextbook"
      @year-change="selectYear"
    />
    
    <!-- 结果展示区域 -->
    <div class="results-container">
      <div class="course-grid">
        <div 
          v-for="(course, index) in filteredCourses" 
          :key="index" 
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
      
      <!-- 无结果时显示 -->
      <div v-if="filteredCourses.length === 0" class="no-results">
        <p>暂无符合条件的课程</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import FilterPanel from '@/components/common/FilterPanel.vue'
// 导入学习相关的 store
import { useLearningStore } from "@/stores/learning"
import { useAuthStore } from "@/stores/auth"
import { apiService } from "@/http/api";

const router = useRouter()
const route = useRoute()

// 获取store实例
const learningStore = useLearningStore()
const authStore = useAuthStore()

// 获取页面标题参数，如果没有则使用默认值
const pageTitle = ref('语文同步名师课堂')

// 筛选选项
const grades = ref(['全部'])
const textbooks = ref(['全部'])
const years = ref(['全部', '2025', '2024', '2023', '2022', '2021', '2020', '2019'])

// 筛选条件
const selectedGrade = ref('全部')
const selectedTextbook = ref('全部')
const selectedYear = ref('全部')

// 课程数据
const courses = ref<any[]>([])
// 加载状态
const isLoading = ref(false)

const STAGE_MAP = {
  preschool: "1",
  primary: "2",
  middle: "3",
  high: "4",
};
onMounted(async () => {
  if (route.query.title) {
    pageTitle.value = route.query.title as string
  }
  
  // 加载标签数据和课程数据
  await loadFilterData()
  await loadCourses()
})

// ============================================================================
// 工具函数 - 从Cookie中获取access_token
// ============================================================================
/**
 * 从Cookie中获取指定名称的值
 * @param name Cookie名称
 * @returns Cookie值或空字符串
 */
const getCookie = (name: string): string => {
  const cookieValue = document.cookie
    .split('; ')
    .find(row => row.startsWith(`${name}=`))
    ?.split('=')[1];
  
  return cookieValue || '';
};

// ============================================================================
// 加载筛选数据
// ============================================================================
const loadFilterData = async () => {
  try {
    // 显示加载状态
    isLoading.value = true
    const selectedStage = localStorage.getItem('selectedStage') || ''
    const stageId = STAGE_MAP[selectedStage as keyof typeof STAGE_MAP];
    
    // 从Cookie中获取access_token
    const accessToken = getCookie('access_token');
    
    // 调用API获取标签列表 - 添加token参数
    const response = await apiService.getTagList({
      ...authStore.appConfig,
      xueduan_id: stageId,
      module_id: "98",
      uid: authStore.userInfo.id,
      token: accessToken,
      check_token: 0,
      app_version_code:0
    });

    // 如果获取成功，处理返回的数据
    // if (response && learningStore.tagList) {
    //   // 处理年级数据
    //   if (learningStore.tagList.grades && learningStore.tagList.grades.length > 0) {
    //     // 添加"全部"选项，并合并API返回的年级数据
    //     grades.value = ['全部', ...learningStore.tagList.grades.map(g => g.name)]
    //   }
      
    //   // 处理学科/教材数据
    //   if (learningStore.tagList.subjects && learningStore.tagList.subjects.length > 0) {
    //     // 添加"全部"选项，并合并API返回的学科数据
    //     textbooks.value = ['全部', ...learningStore.tagList.subjects.map(s => s.name)]
    //   }
      
    //   // 可以根据实际返回的数据结构添加更多的处理逻辑
    // }
  } catch (error) {
    console.error('加载筛选数据失败:', error)
    // 发生错误时使用默认数据
    grades.value = ['全部', '一年级', '二年级', '三年级', '四年级', '五年级', '六年级']
    textbooks.value = ['全部', '参考人教版', '参考沪科粤教版', '参考北师大版']
  } finally {
    // 隐藏加载状态
    isLoading.value = false
  }
}

// 加载课程数据
const loadCourses = async () => {
  // 这里可以根据实际需求调用API获取课程数据
  // 暂时使用模拟数据
  courses.value = [
    {
      id: 1,
      title: '纸间动物世界',
      subtitle: '儿童折纸',
      imageUrl: 'https://picsum.photos/300/300?random=1',
      grade: '一年级',
      textbook: '参考人教版',
      year: '2024'
    },
    {
      id: 2,
      title: '纸间动物世界',
      subtitle: '儿童折纸',
      imageUrl: 'https://picsum.photos/300/300?random=2',
      grade: '一年级',
      textbook: '参考沪科粤教版',
      year: '2024'
    },
    {
      id: 3,
      title: '纸间动物世界',
      subtitle: '儿童折纸',
      imageUrl: 'https://picsum.photos/300/300?random=3',
      grade: '二年级',
      textbook: '参考北师大版',
      year: '2024'
    },
    {
      id: 4,
      title: '纸间动物世界',
      subtitle: '儿童折纸',
      imageUrl: 'https://picsum.photos/300/300?random=4',
      grade: '二年级',
      textbook: '参考人教版',
      year: '2023'
    },
    {
      id: 5,
      title: '纸间动物世界',
      subtitle: '儿童折纸',
      imageUrl: 'https://picsum.photos/300/300?random=5',
      grade: '三年级',
      textbook: '参考沪科粤教版',
      year: '2024'
    },
    {
      id: 6,
      title: '纸间动物世界',
      subtitle: '儿童折纸',
      imageUrl: 'https://picsum.photos/300/300?random=5',
      grade: '三年级',
      textbook: '参考沪科粤教版',
      year: '2024'
    }
  ]
}

// 根据筛选条件过滤课程
const filteredCourses = computed(() => {
  return courses.value.filter(course => {
    const gradeMatch = selectedGrade.value === '全部' || course.grade === selectedGrade.value
    const textbookMatch = selectedTextbook.value === '全部' || course.textbook === selectedTextbook.value
    const yearMatch = selectedYear.value === '全部' || course.year === selectedYear.value
    
    return gradeMatch && textbookMatch && yearMatch
  })
})

// 筛选方法
const selectGrade = (grade: string) => {
  selectedGrade.value = grade
}

const selectTextbook = (textbook: string) => {
  selectedTextbook.value = textbook
}

const selectYear = (year: string) => {
  selectedYear.value = year
}

// 课程点击处理
const handleCourseClick = (course: any) => {
  // 这里可以根据实际需求进行课程详情页面的跳转
  console.log('点击课程:', course)
  // router.push({ name: 'courseDetail', params: { id: course.id } })
}

// 返回上一页
const handleBack = () => {
  router.back()
}
</script>

<style lang="less" scoped>
@import '@/assets/styles/variables.less';

.teacher-course-list {
  height: 100vh; /* 使用固定高度而非最小高度 */
  background: @background-gradient;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 防止页面整体滚动 */
  
  .page-header {
    padding: 20px 30px;
    flex-shrink: 0; /* 防止头部被压缩 */
    .header-content {
      display: flex;
      align-items: center;
      gap: 16px;
      
      .back-button {
        color: @text-white;
        font-size: 24px;
        cursor: pointer;
      }
      
      h1 {
        color: @text-white;
        font-size: 36px;
        font-weight: 500;
        margin: 0;
      }
    }
  }
  
  /* 筛选面板样式调整 */
  .filter-panel-container {
    flex-shrink: 0; /* 防止筛选面板被压缩 */
  }
  
  .results-container {
    flex: 1; /* 占据剩余空间 */
    padding: 30px 64px;
    overflow-y: auto; /* 启用垂直滚动 */
    height: 0; /* 触发 flex 布局计算 */
    
    /* 自定义滚动条样式 */
    &::-webkit-scrollbar {
      width: 8px;
    }
    
    &::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.3);
      border-radius: 4px;
    }
    
    &::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.5);
    }
    
    .course-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 27px;
      
      .course-card {
        text-align: center;
        cursor: pointer;
        transition: transform 0.3s ease;
        
        &:hover {
          transform: translateY(-4px);
        }
        
        .course-thumbnail {
          width: 100%;
          height: 200px;
          margin-bottom: 12px;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: @shadow-normal;
          
          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }
        
        .course-title {
          color: @text-white;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 4px;
        }
        
        .course-subtitle {
          color: @text-white-70;
          font-size: 12px;
        }
      }
    }
    
    .no-results {
      padding: 80px 0;
      text-align: center;
      
      p {
        color: @text-white-70;
        font-size: 24px;
      }
    }
  }
}

// 响应式设计
@media (max-width: @desktop) {
  .teacher-course-list {
    .course-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }
}

@media (max-width: @tablet) {
  .teacher-course-list {
    .results-container {
      padding: 20px;
      
      .course-grid {
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
      }
    }
  }
}
</style>