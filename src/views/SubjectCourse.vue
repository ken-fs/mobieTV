<template>
  <div class="subject-course-page">
    <!-- Loading状态 -->
    <Loading :visible="isLoading" text="加载中..." />

    <!-- 页面内容 -->
    <template v-if="!isLoading">
      <!-- 头部标题栏 -->
      <div class="header-section">
        <button @click="goBack" class="back-btn">
          <van-icon name="arrow-left" size="20" />
        </button>
        <div class="header-content">
          <h1 class="main-title">{{ courseCategory.title }}</h1>
          <p class="subtitle">{{ courseCategory.subtitle }}</p>
        </div>
      </div>

      <!-- 筛选标签栏 -->
      <div class="filter-section" v-if="filterTabs.length > 0">
        <div class="filter-tabs">
          <button
            v-for="(tab, index) in filterTabs"
            :key="tab.id || index"
            :class="['filter-tab', { active: activeFilterIndex === index }]"
            @click="handleFilterChange(index, tab)"
          >
            {{ tab.name }}
          </button>
        </div>
      </div>

      <!-- 课程卡片网格 -->
      <div class="course-grid-container">
        <div class="course-grid">
          <div
            v-for="course in courseList"
            :key="course.id"
            class="course-card"
            @click="handleCourseClick(course)"
          >
            <!-- 课程封面图 -->
            <div class="course-image">
              <div
                v-if="getImageState(course.id).loading"
                class="image-placeholder"
              >
                <van-icon name="photo" size="24" />
                <span>加载中...</span>
              </div>
              <img
                :src="getCourseImageSrc(course)"
                :alt="course.title"
                @error="handleCourseImageError($event, course)"
                @load="handleCourseImageLoad(course)"
                :style="{
                  opacity: getImageState(course.id).loading ? 0 : 1,
                  transition: 'opacity 0.3s ease'
                }"
              />
              <!-- 课程标签 -->
              <div class="course-tag" v-if="course.tag">
                {{ course.tag }}
              </div>
            </div>

            <!-- 课程信息 -->
            <div class="course-info">
              <h3 class="course-title">{{ course.title }}</h3>
              <p class="course-meta" v-if="course.lesson_count">
                {{ course.lesson_count }}课时
              </p>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="!isLoading && courseList.length === 0" class="empty-state">
          <van-icon name="warning-o" size="60" />
          <p>暂无课程数据</p>
          <van-button @click="fetchCourseList" type="primary" size="small"
            >重新加载</van-button
          >
        </div>
      </div>
    </template>

    <!-- 错误状态 -->
    <div v-else-if="!isLoading && hasError" class="error-state">
      <van-icon name="warning-o" size="60" />
      <p>加载失败，请重试</p>
      <van-button @click="fetchCourseList" type="primary">重新加载</van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Icon as VanIcon, Button as VanButton } from "vant";
import Loading from "@/components/loading/index.vue";
import { apiService } from "@/http/api";
import { useAuthStore } from "@/stores/auth";
import { useUserInfo } from "@/composable/useUserInfo";
import { useImageLoader } from "@/composable/useImageLoader";
import { useLazyImage } from "@/composable/useLazyImage";
// ============================================================================
// 类型定义
// ============================================================================
interface CourseCategory {
  id: string;
  title: string;
  subtitle?: string;
  character_image?: string;
  background_gradient?: string;
}

interface FilterTab {
  id: string;
  name: string;
  value?: string;
}

interface CourseItem {
  id: string;
  title: string;
  cover_image?: string;
  thumbnail?: string;
  tag?: string;
  lesson_count?: number;
  description?: string;
  video_url?: string;
}

// ============================================================================
// 组件属性和路由
// ============================================================================
const route = useRoute();
const router = useRouter();
const { getUserInfo } = useUserInfo();
const authStore = useAuthStore();
const { defaultImage, getCourseImageSrc } = useImageLoader();

// ============================================================================
// 响应式状态
// ============================================================================
const isLoading = ref(true);
const isLoadingMore = ref(false);
const hasError = ref(false);
const hasMore = ref(true);
const currentPage = ref(1);
const videoId = computed(() => route.params.id as string);

const courseCategory = ref<CourseCategory>({
  id: "",
  title: "专项突破",
  subtitle: "初中生物",
});

const filterTabs = ref<FilterTab[]>([
  { id: "all", name: "全部" },
  { id: "grade1", name: "一年级" },
  { id: "grade2", name: "二年级" },
]);

const activeFilterIndex = ref(0);
const courseList = ref<CourseItem[]>([]);

// ============================================================================
// 计算属性
// ============================================================================
const categoryId = computed(() => route.params.id as string);

// ============================================================================
// 纯函数工具
// ============================================================================
const generateMockCourses = (count: number = 8): CourseItem[] => {
  const courseTitles = [
    "纸间动物世界",
    "海洋生物探索",
    "植物王国",
    "昆虫奇观",
    "动物行为学",
    "生态系统",
    "细胞世界",
    "遗传密码",
  ];

  const courseTags = ["儿童折纸", "科普探索", "自然教育", "实验课程"];

  return Array.from({ length: count }, (_, index) => ({
    id: `course-${Date.now()}-${index}`,
    title: courseTitles[index % courseTitles.length],
    cover_image: "", // 移除无效的图片路径
    tag: courseTags[index % courseTags.length],
    lesson_count: Math.floor(Math.random() * 20) + 5,
    description: `${courseTitles[index % courseTitles.length]}的详细课程内容`,
  }));
};

// 图片状态管理
const imageLoadingStates = ref<Map<string, { loading: boolean; error: boolean; attempts: number }>>(new Map());

const getImageState = (courseId: string) => {
  if (!imageLoadingStates.value.has(courseId)) {
    imageLoadingStates.value.set(courseId, { loading: true, error: false, attempts: 0 });
  }
  return imageLoadingStates.value.get(courseId)!;
};

const handleCourseImageError = (event: Event, course: CourseItem): void => {
  const img = event.target as HTMLImageElement;
  const state = getImageState(course.id);

  state.attempts++;

  if (state.attempts < 3 && course.thumbnail && course.cover_image !== course.thumbnail) {
    // 尝试备用图片
    setTimeout(() => {
      img.src = course.thumbnail!;
    }, 500);
  } else {
    // 使用默认图片
    state.error = true;
    state.loading = false;
    img.src = defaultImage.value;
  }
};

const handleCourseImageLoad = (course: CourseItem): void => {
  const state = getImageState(course.id);
  state.loading = false;
  state.error = false;
};

// ============================================================================
// API请求函数
// ============================================================================
const fetchCourseList = async (): Promise<void> => {
  try {
    isLoading.value = true;
    courseList.value = [];
    // 清理图片状态
    imageLoadingStates.value.clear();
    const userInfo = getUserInfo();
    const params = {
      ...authStore.appConfig,
      subject_id: videoId.value,
      uid: userInfo.id || "",
    };
    // 调用API获取专题课程列表
    const res = await apiService.getSubjectCourseList(params);
    console.log("params", params);
    console.log("res", res);
    if (res) {
      filterTabs.value = res.course_list.data || [];
      courseList.value = res.layout_content || [];
    } else {
    }
  } catch (error) {
    console.error("Failed to fetch course list:", error);
  } finally {
    isLoading.value = false;
    isLoadingMore.value = false;
  }
};

// ============================================================================
// 用户交互处理
// ============================================================================
const goBack = (): void => {
  router.back();
};

const handleFilterChange = (index: number, tab: FilterTab): void => {
  if (activeFilterIndex.value === index) return;

  activeFilterIndex.value = index;
  fetchCourseList(); // 重新加载课程列表
};

const handleCourseClick = (course: CourseItem): void => {
  console.log("Course clicked:", course);

  // 跳转到视频详情页面
  router.push({
    name: "videoDetail",
    params: { id: course.id },
  });
};

// ============================================================================
// 监听路由变化
// ============================================================================
watch(
  categoryId,
  (newId) => {
    if (newId) {
      fetchCourseList();
    }
  },
  { immediate: true }
);

// ============================================================================
// 生命周期
// ============================================================================
onMounted(() => {
  // 在watch中已经处理了初始化加载
});
</script>

<style lang="less" scoped>
@import "@/assets/styles/variables.less";

.subject-course-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #9b59b6 0%, #e74c3c 100%);
  color: @text-white;
}

.header-section {
  position: relative;
  padding: 20px;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: @backdrop-blur;
  overflow: hidden;

  .back-btn {
    background: none;
    border: none;
    color: @text-white;
    padding: 8px;
    border-radius: 8px;
    cursor: pointer;
    transition: @transition-fast;
    z-index: 2;

    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    &:active {
      transform: scale(0.95);
    }
  }

  .header-content {
    flex: 1;
    margin-left: 20px;
    z-index: 2;

    .main-title {
      font-size: 28px;
      font-weight: 900;
      margin: 0 0 8px 0;
      color: @text-white;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    }

    .subtitle {
      font-size: 18px;
      font-weight: 600;
      margin: 0;
      color: rgba(255, 255, 255, 0.9);
    }
  }

  .character-decoration {
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 1;

    .character-image {
      width: 120px;
      height: 120px;
      object-fit: contain;
      filter: drop-shadow(2px 2px 8px rgba(0, 0, 0, 0.3));
    }
  }

  // 装饰性背景图案
  &::before {
    content: "";
    position: absolute;
    top: -50%;
    right: -20%;
    width: 200px;
    height: 200px;
    background: radial-gradient(
      circle,
      rgba(255, 255, 255, 0.1) 0%,
      transparent 70%
    );
    border-radius: 50%;
  }
}

.filter-section {
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  .filter-tabs {
    display: flex;
    gap: 12px;
    overflow-x: auto;
    padding-bottom: 4px;

    .filter-tab {
      padding: 8px 20px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 25px;
      background: rgba(255, 255, 255, 0.1);
      color: @text-white;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: @transition-normal;
      white-space: nowrap;
      backdrop-filter: @backdrop-blur;

      &:hover {
        background: rgba(255, 255, 255, 0.2);
        border-color: rgba(255, 255, 255, 0.5);
      }

      &.active {
        background: rgba(255, 255, 255, 0.9);
        color: #333;
        border-color: rgba(255, 255, 255, 0.9);
        box-shadow: 0 4px 12px rgba(255, 255, 255, 0.3);
      }
    }
  }
}

.course-grid-container {
  padding: 20px;

  .course-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
    margin-bottom: 30px;

    .course-card {
      .card-base();
      background: rgba(255, 255, 255, 0.95);
      color: #333;
      cursor: pointer;
      transition: @transition-normal;
      overflow: hidden;

      &:hover {
        transform: translateY(-8px);
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
        background: rgba(255, 255, 255, 1);
      }

      &:active {
        transform: translateY(-4px);
      }

      .course-image {
        position: relative;
        width: 100%;
        height: 160px;
        overflow: hidden;
        border-radius: @card-small-radius @card-small-radius 0 0;
        background: #f5f5f5;

        .image-placeholder {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
          color: #999;
          font-size: 12px;
          z-index: 1;

          span {
            margin-top: 8px;
            font-weight: 500;
          }
        }

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: @transition-normal;
          position: relative;
          z-index: 2;

          &.loading {
            opacity: 0;
          }

          &.error {
            opacity: 0.6;
            filter: grayscale(100%);
          }
        }

        .course-tag {
          position: absolute;
          top: 12px;
          left: 12px;
          background: linear-gradient(45deg, #ff9500, #ffb84d);
          color: white;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(255, 149, 0, 0.4);
        }
      }

      .course-info {
        padding: 16px;

        .course-title {
          font-size: 16px;
          font-weight: 700;
          margin: 0 0 8px 0;
          color: #333;
          line-height: 1.4;
          .text-ellipsis();
        }

        .course-meta {
          font-size: 14px;
          color: #666;
          margin: 0;
          font-weight: 500;
        }
      }

      &:hover .course-image img {
        transform: scale(1.05);
      }
    }
  }

  .empty-state,
  .error-state {
    .flex-center();
    flex-direction: column;
    gap: 20px;
    padding: 60px 20px;
    text-align: center;
    color: rgba(255, 255, 255, 0.8);

    p {
      font-size: 16px;
      margin: 0;
    }
  }

  .load-more {
    margin-top: 20px;
  }
}

// 响应式设计
@media (max-width: @tablet) {
  .header-section {
    padding: 16px;

    .header-content {
      margin-left: 16px;

      .main-title {
        font-size: 24px;
      }

      .subtitle {
        font-size: 16px;
      }
    }

    .character-decoration .character-image {
      width: 80px;
      height: 80px;
    }
  }

  .course-grid-container {
    padding: 16px;

    .course-grid {
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 16px;

      .course-card {
        .course-image {
          height: 140px;
        }

        .course-info {
          padding: 14px;

          .course-title {
            font-size: 15px;
          }

          .course-meta {
            font-size: 13px;
          }
        }
      }
    }
  }
}

@media (max-width: @mobile) {
  .course-grid-container .course-grid {
    grid-template-columns: 1fr;
    gap: 14px;

    .course-card .course-image {
      height: 180px;
    }
  }
}
</style>
