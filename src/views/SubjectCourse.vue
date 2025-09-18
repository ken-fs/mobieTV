<template>
  <div class="subject-course-page" :style="pageBackgroundStyle">
    <Loading :visible="isLoading" text="加载中..." />

    <!-- 顶部标题区域 -->
    <header class="header-section">
      <button type="button" class="back-btn" @click="goBack">
        <van-icon name="arrow-left" size="20" />
      </button>
      <div class="header-content">
        <h1 class="page-title">{{ pageTitle }}</h1>
        <p v-if="pageSubtitle" class="page-subtitle">{{ pageSubtitle }}</p>
      </div>
    </header>

    <main v-if="!isLoading" class="main-content" :class="mainContentClass">
      <!-- 左侧筛选栏 -->
      <aside v-if="filterTabs.length > 0" class="filters">
        <button
          v-for="(tab, index) in filterTabs"
          :key="tab.id ?? index"
          :class="filterButtonClass(index)"
          @click="handleFilterChange(index)"
        >
          {{ tab.name }}
        </button>
      </aside>

      <!-- 课程列表区域 -->
      <section class="course-panel">
        <!-- 错误提示 -->
        <div v-if="hasError" class="state-block error">
          <van-icon name="warning-o" size="60" />
          <p>加载失败，请重试</p>
          <van-button type="primary" size="small" @click="refreshCourses">
            重新加载
          </van-button>
        </div>

        <template v-else>
          <!-- 课程卡片网格 -->
          <div v-if="courseList.length > 0" class="course-grid">
            <article
              v-for="course in courseList"
              :key="course.id"
              class="course-card"
              @click="handleCourseClick(course)"
            >
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
                  :class="imageClass(course.id)"
                />
                <span v-if="course.tag" class="course-tag">{{
                  course.tag
                }}</span>
              </div>
              <div class="course-info">
                <h3 class="course-title">{{ course.title }}</h3>
                <p v-if="course.lesson_count" class="course-meta">
                  {{ course.lesson_count }}课时
                </p>
              </div>
            </article>
          </div>

          <!-- 空状态 -->
          <div v-else class="state-block empty">
            <van-icon name="warning-o" size="60" />
            <p>暂无课程数据</p>
            <van-button type="primary" size="small" @click="refreshCourses">
              重新加载
            </van-button>
          </div>
        </template>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Icon as VanIcon, Button as VanButton } from "vant";
import Loading from "@/components/loading/index.vue";
import { apiService } from "@/http/api";
import { useAuthStore } from "@/stores/auth";
import { useUserInfo } from "@/composable/useUserInfo";
import { useImageLoader } from "@/composable/useImageLoader";

void [VanIcon, VanButton];

interface FilterTab {
  id?: string;
  name: string;
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

interface SubjectDetail {
  title?: string;
  subtitle?: string;
  background?: string;
  background_gradient?: string;
}

interface ImageState {
  loading: boolean;
  error: boolean;
  attempts: number;
}

// 路由与全局依赖
const route = useRoute();
const router = useRouter();

// 全局 store 与工具
const authStore = useAuthStore();
const { getUserInfo } = useUserInfo();
const { defaultImage, getCourseImageSrc } = useImageLoader();

// 页面核心状态
const isLoading = ref(false);
const hasError = ref(false);
const filterTabs = ref<FilterTab[]>([]);
const activeFilterIndex = ref(0);
const courseList = ref<CourseItem[]>([]);
const subjectDetail = ref<SubjectDetail | null>(null);

// 用于绘制和并发控制的内部状态
const imageStates = ref<Map<string, ImageState>>(new Map());
const latestRequestKey = ref("");

// 计算当前专题与筛选
const subjectId = computed(() =>
  route.params.id ? String(route.params.id) : "",
);
const activeFilter = computed(
  () => filterTabs.value[activeFilterIndex.value] ?? null,
);

// 页面展示相关的派生数据
const pageTitle = computed(() => subjectDetail.value?.title ?? "专项突破");
const pageSubtitle = computed(() => subjectDetail.value?.subtitle ?? "");
const pageBackgroundStyle = computed(() =>
  createBackgroundStyle(subjectDetail.value),
);
const mainContentClass = computed(() => {
  return filterTabs.value.length === 0 ? ["no-filters"] : [];
});

// 模板样式辅助
const filterButtonClass = (index: number) => [
  "filter-option",
  { active: index === activeFilterIndex.value },
];

const imageClass = (courseId: string) => ({
  hidden: getImageState(courseId).loading,
});

// 统一构造页面背景样式
function createBackgroundStyle(subject: SubjectDetail | null) {
  const gradient =
    "linear-gradient(135deg, #8E7CC3 0%, #B794F6 50%, #D6BCFA 100%)";

  if (subject?.background) {
    return {
      backgroundImage: `url(${subject.background}), ${gradient}`,
      backgroundBlendMode: "overlay",
    };
  }

  if (subject?.background_gradient) {
    return {
      backgroundImage: subject.background_gradient,
    };
  }

  return {
    backgroundImage: gradient,
  };
}

// 维护课程图片的加载状态
const ensureImageState = (courseId: string): ImageState => {
  if (!imageStates.value.has(courseId)) {
    imageStates.value.set(courseId, {
      loading: true,
      error: false,
      attempts: 0,
    });
  }
  return imageStates.value.get(courseId)!;
};

const getImageState = (courseId: string) => ensureImageState(courseId);

const resetImageStates = () => {
  imageStates.value.clear();
};

// 图片加载失败时切换备用资源
const handleCourseImageError = (event: Event, course: CourseItem) => {
  const img = event.target as HTMLImageElement;
  const state = ensureImageState(course.id);

  state.attempts += 1;

  if (state.attempts < 3 && course.thumbnail && course.thumbnail !== img.src) {
    img.src = course.thumbnail;
    return;
  }

  state.loading = false;
  state.error = true;
  img.src = defaultImage.value;
};

// 图片加载完成后标记成功状态
const handleCourseImageLoad = (course: CourseItem) => {
  const state = ensureImageState(course.id);
  state.loading = false;
  state.error = false;
};

// 返回上一页
const goBack = () => {
  router.back();
};

// 跳转到课程详情
const handleCourseClick = (course: CourseItem) => {
  router.push({
    name: "videoDetail",
    params: { id: course.id },
  });
};

// 组装请求参数
const buildRequestParams = (id: string) => {
  const userInfo = getUserInfo();
  const params: Record<string, unknown> = {
    ...authStore.appConfig,
    subject_id: id,
    uid: userInfo.id ?? "",
  };

  if (activeFilter.value?.id) {
    params.filter_id = activeFilter.value.id;
  }

  return params;
};

// 清洗接口返回结构
const normalizeResponse = (payload: unknown) => {
  const data = payload as {
    course_list?: { data?: FilterTab[] };
    layout_content?: CourseItem[];
    subject?: SubjectDetail;
  };

  const rawFilters = data?.course_list?.data;
  const rawCourses = data?.layout_content;

  const filters: FilterTab[] = Array.isArray(rawFilters) ? rawFilters : [];
  const courses: CourseItem[] = Array.isArray(rawCourses) ? rawCourses : [];

  const subject: SubjectDetail | null = data?.subject ?? null;

  return { filters, courses, subject };
};

// 根据返回数据修正当前选中筛选
const resolveActiveFilterIndex = (
  filters: FilterTab[],
  preferredId: string | null,
  previousIndex: number,
) => {
  if (filters.length === 0) return 0;

  if (preferredId) {
    const matched = filters.findIndex((item) => item.id === preferredId);
    if (matched >= 0) return matched;
  }

  return filters[previousIndex] ? previousIndex : 0;
};

// 请求课程列表（含并发保护）
const refreshCourses = async () => {
  const id = subjectId.value;
  if (!id) {
    latestRequestKey.value = "";
    isLoading.value = false;
    hasError.value = false;
    courseList.value = [];
    filterTabs.value = [];
    subjectDetail.value = null;
    return;
  }

  const preferredFilterId = activeFilter.value?.id ?? null;
  const previousIndex = activeFilterIndex.value;
  const requestKey = `${id}:${preferredFilterId ?? ""}`;
  latestRequestKey.value = requestKey;

  isLoading.value = true;
  hasError.value = false;

  try {
    resetImageStates();
    const response = await apiService.getSubjectCourseList(
      buildRequestParams(id),
    );
    if (latestRequestKey.value !== requestKey) return;

    const { filters, courses, subject } = normalizeResponse(response);

    filterTabs.value = filters;
    activeFilterIndex.value = resolveActiveFilterIndex(
      filters,
      preferredFilterId,
      previousIndex,
    );
    courseList.value = courses;
    subjectDetail.value = subject;
  } catch (error) {
    if (latestRequestKey.value !== requestKey) return;

    console.error("Failed to fetch course list:", error);
    hasError.value = true;
    courseList.value = [];
  } finally {
    if (latestRequestKey.value === requestKey) {
      isLoading.value = false;
    }
  }
};

// 切换筛选标签
const handleFilterChange = (index: number) => {
  if (index === activeFilterIndex.value) return;

  activeFilterIndex.value = index;
  refreshCourses();
};

// 路由变化时重新拉取数据
watch(
  subjectId,
  () => {
    activeFilterIndex.value = 0;
    refreshCourses();
  },
  { immediate: true },
);
</script>

<style lang="less" scoped>
@import "@/assets/styles/variables.less";

.subject-course-page {
  min-height: 100vh;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  color: @text-white;
  position: relative;
  padding-bottom: 40px;
}

.header-section {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 32px 20px 40px;
}

.back-btn {
  background: rgba(255, 255, 255, 0.18);
  border: none;
  color: @text-white;
  padding: 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: @transition-fast;
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(255, 255, 255, 0.28);
    transform: translateY(-2px);
  }

  &:active {
    transform: scale(0.95);
  }
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.page-title {
  margin: 0;
  font-size: 40px;
  font-weight: 800;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.2);
}

.page-subtitle {
  margin: 0;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.85);
  max-width: 520px;
}

.main-content {
  display: flex;
  gap: 24px;
  padding: 0 20px 40px;

  &.no-filters {
    justify-content: center;
  }
}

.filters {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 200px;
  flex-shrink: 0;
}

.filter-option {
  padding: 12px 18px;
  border: none;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.18);
  color: @text-white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: @transition-normal;
  text-align: center;
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(255, 255, 255, 0.26);
    transform: translateX(6px);
  }

  &.active {
    background: rgba(255, 255, 255, 0.92);
    color: #333;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
    transform: none;
  }
}

.course-panel {
  flex: 1;
  min-width: 0;
}

.course-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.course-card {
  background: rgba(255, 255, 255, 0.96);
  color: #333;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  transition: @transition-normal;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 14px 30px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: translateY(-3px);
  }
}

.course-image {
  position: relative;
  width: 100%;
  padding-top: 56%;
  overflow: hidden;
  background: #f5f5f5;

  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: @transition-normal;

    &.hidden {
      opacity: 0;
    }
  }

  &:hover img {
    transform: scale(1.05);
  }
}

.image-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f5f5 0%, #e6e6e6 100%);
  color: #7a7a7a;
  font-size: 12px;
  gap: 8px;
  z-index: 1;
}

.course-tag {
  position: absolute;
  top: 12px;
  left: 12px;
  background: linear-gradient(45deg, #ff9500, #ffb84d);
  color: #fff;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(255, 149, 0, 0.4);
  z-index: 2;
}

.course-info {
  padding: 16px;

  .course-title {
    margin: 0 0 8px;
    font-size: 16px;
    font-weight: 700;
    color: #333;
    .text-ellipsis();
  }

  .course-meta {
    margin: 0;
    font-size: 14px;
    color: #666;
    font-weight: 500;
  }
}

.state-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 80px 20px;
  text-align: center;
  color: rgba(255, 255, 255, 0.82);

  p {
    margin: 0;
  }

  &.error {
    color: rgba(255, 200, 200, 0.9);
  }
}

@media (max-width: @tablet) {
  .header-section {
    padding: 24px 16px 32px;
  }

  .page-title {
    font-size: 32px;
  }

  .main-content {
    flex-direction: column;
    gap: 20px;
  }

  .filters {
    flex-direction: row;
    width: 100%;
    overflow-x: auto;
    padding-bottom: 8px;

    .filter-option {
      flex-shrink: 0;
      white-space: nowrap;
      transform: none;

      &:hover {
        transform: none;
      }
    }
  }
}

@media (max-width: @mobile) {
  .page-title {
    font-size: 28px;
  }

  .course-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}
</style>
