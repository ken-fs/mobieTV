<template>
  <div class="video-detail-page" :style="pageBackgroundStyle">
    <Loading :visible="isLoading" text="加载中..." />

    <div v-if="!isLoading && detail" class="video-detail-container">
      <!-- 顶部标题与返回 -->
      <header class="page-header">
        <button type="button" class="back-btn" @click="goBack">
          <van-icon name="arrow-left" size="18" />
        </button>
        <div class="header-text">
          <h1 class="main-title">{{ detail.seriesTitle }}</h1>
        </div>
      </header>

      <!-- 视频概要信息 -->
      <section class="summary-section">
        <div class="cover-column">
          <div class="cover-image" :style="coverImageStyle"></div>
        </div>
        <div class="summary-column">
          <p class="summary-subtitle">{{ detail.subtitle }}</p>
          <ul class="summary-meta">
            <li v-for="item in metaItems" :key="item.label">
              <span class="meta-label">{{ item.label }}：</span>
              <span class="meta-value">{{ item.value }}</span>
            </li>
          </ul>
          <p
            class="summary-description"
            :class="{ collapsed: !descriptionExpanded }"
          >
            {{ detail.description }}
          </p>
          <button
            type="button"
            class="toggle-description"
            @click="toggleDescription"
          >
            {{ descriptionExpanded ? "收起" : "简介" }}
          </button>
          <div class="action-row">
            <button
              v-for="action in detail.actionButtons"
              :key="action.id"
              type="button"
              class="action-btn"
              @click="handleActionClick(action.id)"
            >
              <van-icon :name="action.icon" size="16" />
              <span>{{ action.label }}</span>
            </button>
          </div>
        </div>
      </section>

      <!-- 课时目录 -->
      <section class="chapter-section">
        <div class="section-header">
          <h2>课时目录</h2>
          <span class="section-subtitle">共{{ totalLessonCount }}课时</span>
        </div>
        <div class="chapter-tabs">
          <button
            v-for="(group, index) in detail.chapters"
            :key="group.id"
            type="button"
            :class="['chapter-tab', { active: index === activeChapterIndex }]"
            @click="handleChapterChange(index)"
          >
            {{ group.label }}
          </button>
        </div>
        <div class="lesson-grid">
          <button
            v-for="lesson in activeLessons"
            :key="lesson.id"
            type="button"
            :class="['lesson-card', { active: lesson.id === activeLessonId }]"
            @click="handleLessonSelect(lesson.id)"
          >
            <span class="lesson-index">{{ lesson.order }}</span>
            <span class="lesson-title">{{ lesson.title }}</span>
            <span class="lesson-duration">{{ lesson.duration }}</span>
          </button>
        </div>
      </section>

      <!-- 任课教师 -->
      <section class="teacher-section">
        <div class="section-header">
          <h2>任课教师</h2>
          <button
            type="button"
            class="link-btn"
            @click="handleActionClick('teacher-more')"
          >
            查看详情
            <van-icon name="arrow" size="14" />
          </button>
        </div>
        <div class="teacher-card">
          <div class="teacher-profile">
            <div class="teacher-avatar" :style="teacherAvatarStyle"></div>
            <div class="teacher-info">
              <h3>{{ detail.teacher.name }}</h3>
              <p class="teacher-title">{{ detail.teacher.title }}</p>
              <p class="teacher-description">
                {{ detail.teacher.description }}
              </p>
            </div>
          </div>
          <div class="teacher-course-list">
            <p class="teacher-course-title">{{ detail.teacher.highlight }}</p>
            <div class="teacher-courses">
              <div
                v-for="course in detail.teacher.courses"
                :key="course.id"
                class="mini-course-card"
              >
                <div
                  class="mini-cover"
                  :style="{ backgroundImage: `url(${course.cover})` }"
                ></div>
                <p class="mini-title">{{ course.title }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 热门推荐 -->
      <section class="recommend-section">
        <h2 class="section-title">热门推荐</h2>
        <div class="recommend-grid">
          <div
            v-for="item in detail.recommendations"
            :key="item.id"
            class="recommend-card"
          >
            <div
              class="recommend-cover"
              :style="{ backgroundImage: `url(${item.cover})` }"
            ></div>
            <p class="recommend-title">{{ item.title }}</p>
          </div>
        </div>
      </section>
    </div>

    <div v-else-if="!isLoading && hasError" class="error-state">
      <van-icon name="warning-o" size="60" />
      <p>加载失败，请重试</p>
      <van-button type="primary" @click="refreshCourses">重新加载</van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Icon as VanIcon, Button as VanButton } from "vant";
import Loading from "@/components/loading/index.vue";
import { apiService } from "@/http/api";

void [VanIcon, VanButton];

interface LessonItem {
  id: string;
  order: string;
  title: string;
  duration: string;
}

interface ChapterGroup {
  id: string;
  label: string;
  lessons: LessonItem[];
}

interface CourseCard {
  id: string;
  title: string;
  cover: string;
}

interface TeacherInfo {
  name: string;
  title: string;
  description: string;
  avatar: string;
  highlight: string;
  courses: CourseCard[];
}

interface VideoDetailPageData {
  id: string;
  seriesTitle: string;
  videoTitle: string;
  subtitle: string;
  coverImage: string;
  description: string;
  background: string;
  stats: Array<{ label: string; value: string }>;
  actionButtons: Array<{ id: string; label: string; icon: string }>;
  chapters: ChapterGroup[];
  teacher: TeacherInfo;
  recommendations: CourseCard[];
}

type MaybeVideoDetailApi = {
  getVideoDetail?: (
    payload: Record<string, unknown>
  ) => Promise<VideoDetailPageData>;
};

// 路由信息
const route = useRoute();
const router = useRouter();

// 页面状态
const isLoading = ref(true);
const hasError = ref(false);
const detail = ref<VideoDetailPageData | null>(null);
const activeChapterIndex = ref(0);
const activeLessonId = ref<string | null>(null);
const descriptionExpanded = ref(false);

const videoId = computed(() =>
  route.params.id ? String(route.params.id) : ""
);

const metaItems = computed(() => detail.value?.stats ?? []);
const activeLessons = computed(
  () => detail.value?.chapters?.[activeChapterIndex.value]?.lessons ?? []
);
const totalLessonCount = computed(
  () =>
    detail.value?.chapters.reduce(
      (acc, group) => acc + group.lessons.length,
      0
    ) ?? 0
);
const coverImageStyle = computed(() => {
  if (!detail.value) return {};
  return {
    backgroundImage: `url(${detail.value.coverImage})`,
  };
});
const teacherAvatarStyle = computed(() => {
  if (!detail.value) return {};
  return {
    backgroundImage: `url(${detail.value.teacher.avatar})`,
  };
});
const pageBackgroundStyle = computed(() => {
  if (detail.value?.background) {
    return {
      background: detail.value.background,
    };
  }
  return {};
});

const toggleDescription = () => {
  descriptionExpanded.value = !descriptionExpanded.value;
};

const handleChapterChange = (index: number) => {
  if (index === activeChapterIndex.value) return;
  activeChapterIndex.value = index;
  const firstLesson = detail.value?.chapters[index]?.lessons?.[0];
  activeLessonId.value = firstLesson ? firstLesson.id : null;
};

const handleLessonSelect = (lessonId: string) => {
  activeLessonId.value = lessonId;
};

const handleActionClick = (actionId: string) => {
  console.log("action triggered", actionId);
};

const goBack = () => {
  router.back();
};

const fetchVideoDetail = async (id: string) => {
  try {
    isLoading.value = true;
    hasError.value = false;

    const maybeApi = apiService as MaybeVideoDetailApi;
    const response = maybeApi.getVideoDetail
      ? await maybeApi.getVideoDetail({ id })
      : undefined;
    const data = response ?? buildMockVideoDetail(id);

    detail.value = data;
    activeChapterIndex.value = 0;
    activeLessonId.value = data.chapters?.[0]?.lessons?.[0]?.id ?? null;
  } catch (error) {
    console.warn("Failed to fetch video detail, fallback to mock data", error);
    detail.value = buildMockVideoDetail(id);
    hasError.value = false;
  } finally {
    isLoading.value = false;
  }
};

const buildMockVideoDetail = (id: string): VideoDetailPageData => {
  const chapterTemplates = [
    {
      id: `${id}-segment-a`,
      label: "01-08",
      size: 8,
      titles: [
        "认识的植物",
        "大树和小草",
        "观察校园的树木",
        "植物发生了什么",
        "认识的植物",
        "大树和小草",
        "观察校园的树木",
        "植物发生了什么",
      ],
    },
    {
      id: `${id}-segment-b`,
      label: "09-16",
      size: 8,
      titles: ["节日主题延伸课程"],
    },
    {
      id: `${id}-segment-c`,
      label: "17-24",
      size: 8,
      titles: ["社交情境演练"],
    },
    {
      id: `${id}-segment-d`,
      label: "25-28",
      size: 4,
      titles: ["节日文化体验"],
    },
  ];

  const chapters: ChapterGroup[] = chapterTemplates.map(
    (template, templateIndex) => ({
      id: template.id,
      label: template.label,
      lessons: Array.from({ length: template.size }, (_, index) => ({
        id: `${template.id}-lesson-${index}`,
        order: `${index + 1 + templateIndex * 8}`.padStart(2, "0"),
        title:
          template.titles[index] ?? template.titles[template.titles.length - 1],
        duration: `${8 + (index % 3)}:${20 + (index % 4) * 5}`,
      })),
    })
  );

  const teacherCourses: CourseCard[] = Array.from(
    { length: 6 },
    (_, index) => ({
      id: `${id}-teacher-course-${index}`,
      title: "学美语双节棍短文篇",
      cover: "https://dummyimage.com/132x176/FFCC66/354059&text=Course",
    })
  );

  const recommendations: CourseCard[] = Array.from(
    { length: 8 },
    (_, index) => ({
      id: `${id}-recommend-${index}`,
      title: "纸间动物世界",
      cover: "https://dummyimage.com/168x208/FFDB6E/273151&text=Hot",
    })
  );

  return {
    id,
    seriesTitle: "儿童社交能力培养",
    videoTitle: "学美语双节棍短文篇",
    subtitle: "学美语双节棍短文篇 · 1:04 小时",
    coverImage:
      "https://dummyimage.com/520x300/4666D1/FFFFFF&text=Course+Cover",
    description:
      "本课在从利于协助物品并技巧不功及时，有布局或理解。也意味着不再事情处理的是星星步步必修课。因现在因素不变主本失笑。讲考自动的建构，孩子可以在实践中提升社交表达。",
    background:
      "linear-gradient(135deg, #111C61 0%, #070C3A 45%, #020413 100%)",
    stats: [
      { label: "主持", value: "王小二" },
      { label: "学段", value: "小学二年级" },
      { label: "人数", value: "1.04 万人学习" },
      { label: "适用", value: "英语 / 综合素质" },
    ],
    actionButtons: [
      { id: "fullscreen", label: "全屏", icon: "scan" },
      { id: "collect", label: "收藏", icon: "star" },
      { id: "share", label: "分享", icon: "share-o" },
      { id: "vip", label: "会员订购", icon: "diamond" },
    ],
    chapters,
    teacher: {
      name: "王小二",
      title: "中国未来学院英语讲师",
      description:
        "拥有多年小学英语教学经验，擅长通过游戏化课堂激发孩子兴趣。课程关注社交场景表达，帮助孩子在真实场景中自信开口。",
      avatar: "https://dummyimage.com/120x120/64A2FF/FFFFFF&text=Teacher",
      highlight: "TA的课程",
      courses: teacherCourses,
    },
    recommendations,
  };
};

const refreshCourses = () => {
  if (!videoId.value) return;
  fetchVideoDetail(videoId.value);
};

onMounted(() => {
  if (videoId.value) {
    fetchVideoDetail(videoId.value);
  }
});

watch(videoId, (nextId, prevId) => {
  if (nextId && nextId !== prevId) {
    fetchVideoDetail(nextId);
  }
});
</script>

<style lang="less" scoped>
@import "@/assets/styles/variables.less";

.video-detail-page {
  min-height: 100vh;
  height: 100vh;
  height: 100dvh;
  background: @background-gradient;
  color: @text-white;
  padding: 32px 24px 64px;
  box-sizing: border-box;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.video-detail-container {
  max-width: 1180px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  border: none;
  background: rgba(255, 255, 255, 0.08);
  color: @text-white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: @transition-normal;

  &:hover {
    background: rgba(255, 255, 255, 0.18);
    transform: translateX(-2px);
  }
}

.header-text {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.series-title {
  margin: 0;
  font-size: 16px;
  opacity: 0.82;
}

.main-title {
  margin: 0;
  font-size: 36px;
  font-weight: 800;
}

.summary-section {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 32px;
  padding: 32px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 32px;
  backdrop-filter: blur(16px);
}

.cover-column {
  display: flex;
  align-items: center;
  justify-content: center;
}

.cover-image {
  width: 100%;
  padding-top: 62%;
  border-radius: 24px;
  background-size: cover;
  background-position: center;
  box-shadow: 0 24px 60px rgba(6, 13, 63, 0.45);
}

.summary-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.summary-subtitle {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  opacity: 0.9;
}

.summary-meta {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 24px;
  font-size: 14px;
  opacity: 0.85;
}

.summary-description {
  margin: 0;
  line-height: 1.8;
  opacity: 0.78;
  max-width: 640px;

  &.collapsed {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

.toggle-description {
  align-self: flex-start;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.72);
  font-size: 14px;
  cursor: pointer;
  padding: 0;
}

.action-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 8px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 999px;
  border: none;
  color: #0a144e;
  font-weight: 600;
  cursor: pointer;
  background: linear-gradient(135deg, #f6f0ff 0%, #fff5d9 100%);
  box-shadow: 0 10px 24px rgba(12, 19, 66, 0.25);
  transition: @transition-fast;

  &:hover {
    transform: translateY(-2px);
  }
}

.chapter-section,
.teacher-section,
.recommend-section {
  background: rgba(255, 255, 255, 0.05);
  padding: 28px 32px;
  border-radius: 32px;
  backdrop-filter: blur(16px);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.section-header h2,
.section-title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
}

.section-subtitle {
  font-size: 14px;
  opacity: 0.7;
}

.chapter-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.chapter-tab {
  padding: 10px 22px;
  border-radius: 999px;
  border: none;
  background: rgba(255, 255, 255, 0.08);
  color: @text-white;
  font-weight: 600;
  cursor: pointer;
  transition: @transition-normal;

  &.active {
    background: rgba(255, 255, 255, 0.95);
    color: #1a234a;
  }
}

.lesson-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}

.lesson-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px;
  border-radius: 18px;
  background: rgba(7, 13, 58, 0.65);
  color: @text-white;
  border: 1px solid transparent;
  cursor: pointer;
  transition: @transition-normal;

  .lesson-index {
    font-size: 13px;
    opacity: 0.68;
  }

  .lesson-title {
    font-size: 16px;
    font-weight: 600;
  }

  .lesson-duration {
    font-size: 13px;
    opacity: 0.68;
  }

  &.active,
  &:hover {
    border-color: rgba(109, 124, 255, 0.9);
    background: rgba(74, 98, 255, 0.35);
  }
}

.link-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 999px;
  border: none;
  background: rgba(255, 255, 255, 0.16);
  color: @text-white;
  cursor: pointer;
}

.teacher-card {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 24px;
}

.teacher-profile {
  display: flex;
  gap: 18px;
  align-items: center;
}

.teacher-avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  box-shadow: 0 12px 24px rgba(7, 13, 58, 0.45);
}

.teacher-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.teacher-title {
  margin: 0;
  opacity: 0.75;
}

.teacher-description {
  margin: 0;
  opacity: 0.72;
  line-height: 1.6;
}

.teacher-course-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.teacher-course-title {
  margin: 0;
  font-weight: 600;
  opacity: 0.86;
}

.teacher-courses {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
}

.mini-course-card {
  background: rgba(255, 255, 255, 0.07);
  padding: 12px;
  border-radius: 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  text-align: center;
}

.mini-cover {
  width: 72px;
  height: 92px;
  border-radius: 14px;
  background-size: cover;
  background-position: center;
}

.mini-title {
  margin: 0;
  font-size: 13px;
  line-height: 1.3;
}

.recommend-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
}

.recommend-card {
  background: rgba(255, 255, 255, 0.07);
  border-radius: 24px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

.recommend-cover {
  width: 100%;
  padding-top: 120%;
  border-radius: 18px;
  background-size: cover;
  background-position: center;
}

.recommend-title {
  margin: 0;
  text-align: center;
  font-size: 14px;
}

.error-state {
  min-height: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: rgba(255, 255, 255, 0.86);
}

@media (max-width: 1080px) {
  .summary-section {
    grid-template-columns: 1fr;
  }

  .teacher-card {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .video-detail-page {
    padding: 24px 16px 48px;
  }

  .main-title {
    font-size: 28px;
  }

  .summary-section,
  .chapter-section,
  .teacher-section,
  .recommend-section {
    border-radius: 24px;
    padding: 24px;
  }

  .lesson-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }

  .teacher-courses {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
}
</style>
