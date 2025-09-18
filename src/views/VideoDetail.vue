<template>
  <div class="video-detail-page">
    <!-- Loading状态 -->
    <!-- <Loading :visible="isLoading" text="加载中..." /> -->

    <!-- 视频详情内容 -->
    <template v-if="!isLoading">
      <!-- 返回按钮 -->
      <div class="header-bar">
        <button @click="goBack" class="back-btn">
          <van-icon name="arrow-left" size="20" />
          <span>返回</span>
        </button>
        <h1 class="page-title">{{ videoDetail?.name || "视频详情" }}</h1>
      </div>

      <!-- 视频播放器 -->
      <div class="video-player-container">
        <Vue3M3u8Player
          v-if="videoDetail.video_url"
          :src="videoDetail.video_url"
          :poster="videoDetail.background_image"
          :width="'100%'"
          :height="'auto'"
          :autoplay="false"
          class="video-player"
        />
        <div v-else class="no-video-placeholder">
          <van-icon name="video-o" size="60" />
          <p>暂无视频资源</p>
        </div>
      </div>

      <!-- 视频信息 -->
      <div class="video-info">
        <h2 class="video-title">{{ videoDetail.name }}</h2>
        <div class="video-meta">
          <div class="meta-item" v-if="videoDetail.episode_count">
            <span class="label">集数：</span>
            <span class="value">{{ videoDetail.episode_count }}</span>
          </div>
          <div class="meta-item" v-if="videoDetail.duration">
            <span class="label">时长：</span>
            <span class="value">{{
              formatDuration(videoDetail.duration)
            }}</span>
          </div>
          <div class="meta-item" v-if="videoDetail.teacher_name">
            <span class="label">讲师：</span>
            <span class="value">{{ videoDetail.teacher_name }}</span>
          </div>
          <div class="meta-item" v-if="videoDetail.grade">
            <span class="label">年级：</span>
            <span class="value">{{ videoDetail.grade }}</span>
          </div>
          <div class="meta-item" v-if="videoDetail.subject">
            <span class="label">科目：</span>
            <span class="value">{{ videoDetail.subject }}</span>
          </div>
        </div>

        <!-- 视频描述 -->
        <div class="video-description" v-if="videoDetail.remark">
          <h3>课程介绍</h3>
          <p>{{ videoDetail.remark }}</p>
        </div>
      </div>

      <!-- 相关视频列表 -->
      <div class="related-videos" v-if="relatedVideos.length > 0">
        <h3>相关推荐</h3>
        <div class="related-list">
          <div
            v-for="video in relatedVideos"
            :key="video.id"
            class="related-item"
            @click="handleRelatedVideoClick(video)"
          >
            <img
              :src="video.thumbnail || video.background_image"
              :alt="video.title"
              class="related-thumbnail"
            />
            <div class="related-info">
              <h4 class="related-title">{{ video.title }}</h4>
              <p class="related-meta">{{ video.teacher_name || "未知讲师" }}</p>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- 错误状态 -->
    <div v-else-if="!isLoading && hasError" class="error-state">
      <van-icon name="warning-o" size="60" />
      <p>加载失败，请重试</p>
      <van-button @click="fetchVideoDetail" type="primary">重新加载</van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Icon as VanIcon, Button as VanButton } from "vant";
// import Loading from "@/components/loading/index.vue";
import Vue3M3u8Player from "@/components/m3u8/vue3-m3u8-player.vue";
import { apiService } from "@/http/api";
import { useAuthStore } from "@/stores/auth";
import { useUserInfo } from "@/composable/useUserInfo";

// ============================================================================
// 类型定义
// ============================================================================
interface VideoDetail {
  name: string;
  remark?: string;
  video_url?: string;
  background_image?: string;
  thumbnail?: string;
  episode_count?: number;
  duration?: number;
  teacher_name?: string;
  grade?: string;
  subject?: string;
}

interface RelatedVideo {
  id: string;
  title: string;
  thumbnail?: string;
  background_image?: string;
  teacher_name?: string;
}

// ============================================================================
// 组件属性和路由
// ============================================================================
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { getUserInfo } = useUserInfo();

// ============================================================================
// 响应式状态
// ============================================================================
const isLoading = ref(true);
const hasError = ref(false);
const videoDetail = ref<VideoDetail | null>(null);
const relatedVideos = ref<RelatedVideo[]>([]);

// ============================================================================
// 计算属性
// ============================================================================
const videoId = computed(() => route.params.id as string);

// ============================================================================
// 纯函数工具
// ============================================================================
const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}小时${minutes}分钟`;
  } else if (minutes > 0) {
    return `${minutes}分钟${remainingSeconds}秒`;
  } else {
    return `${remainingSeconds}秒`;
  }
};

// ============================================================================
// API请求函数
// ============================================================================
const fetchVideoDetail = async (): Promise<void> => {
  if (!videoId.value) {
    hasError.value = true;
    isLoading.value = false;
    return;
  }

  try {
    isLoading.value = true;
    hasError.value = false;

    // 从localStorage获取用户信息
    const userInfo = getUserInfo();
    const params = {
      ...authStore.appConfig,
      subject_id: videoId.value,
      uid: userInfo.id || "",
    };
    // 获取视频详情
    const res = await apiService.getSubjectCourseList(params);

    if (res) {
      videoDetail.value = res;
    } else {
      hasError.value = true;
    }
  } catch (error) {
    console.error("Failed to fetch video detail:", error);
    hasError.value = true;
  } finally {
    isLoading.value = false;
  }
};

// ============================================================================
// 用户交互处理
// ============================================================================
const goBack = (): void => {
  router.back();
};

const handleRelatedVideoClick = (video: RelatedVideo): void => {
  // 跳转到相关视频详情页
  router.push({ name: "videoDetail", params: { id: video.id } });
};

// ============================================================================
// 监听路由变化
// ============================================================================
watch(
  videoId,
  (newId) => {
    if (newId) {
      fetchVideoDetail();
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

.video-detail-page {
  min-height: 100vh;
  background: @background-gradient;
  color: @text-white;
  padding: 0;
  box-sizing: border-box;
}

.header-bar {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: @backdrop-blur;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;

  .back-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background: none;
    border: none;
    color: @text-white;
    font-size: 16px;
    cursor: pointer;
    padding: 8px 12px;
    border-radius: 8px;
    transition: @transition-fast;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    &:active {
      transform: scale(0.95);
    }
  }

  .page-title {
    flex: 1;
    margin: 0 20px;
    font-size: 18px;
    font-weight: 600;
    .text-ellipsis();
  }
}

.video-player-container {
  padding: 20px;
  background: rgba(0, 0, 0, 0.3);

  .video-player {
    width: 100%;
    max-width: 1000px;
    margin: 0 auto;
    border-radius: @card-small-radius;
    overflow: hidden;
    box-shadow: @shadow-normal;
  }

  .no-video-placeholder {
    .flex-center();
    flex-direction: column;
    gap: 16px;
    padding: 60px 20px;
    color: @text-white-70;
    text-align: center;

    p {
      font-size: 16px;
      margin: 0;
    }
  }
}

.video-info {
  padding: 20px;

  .video-title {
    font-size: 24px;
    font-weight: 700;
    margin: 0 0 20px 0;
    line-height: 1.4;
  }

  .video-meta {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 24px;

    .meta-item {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      background: @card-bg;
      border-radius: @card-small-radius;
      border: 1px solid rgba(255, 255, 255, 0.1);

      .label {
        font-weight: 600;
        color: @primary-color;
        margin-right: 8px;
        min-width: 60px;
      }

      .value {
        color: @text-white-80;
        flex: 1;
      }
    }
  }

  .video-description {
    margin-top: 30px;

    h3 {
      font-size: 18px;
      font-weight: 600;
      margin: 0 0 16px 0;
      color: @primary-color;
    }

    p {
      line-height: 1.6;
      color: @text-white-80;
      margin: 0;
      font-size: 15px;
    }
  }
}

.related-videos {
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);

  h3 {
    font-size: 20px;
    font-weight: 600;
    margin: 0 0 20px 0;
    color: @primary-color;
  }

  .related-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;

    .related-item {
      .card-base();
      padding: 16px;
      cursor: pointer;
      transition: @transition-normal;

      &:hover {
        background: @card-bg-hover;
        transform: translateY(-2px);
        box-shadow: @shadow-hover;
      }

      &:active {
        transform: translateY(0);
      }

      .related-thumbnail {
        width: 100%;
        height: 120px;
        object-fit: cover;
        border-radius: 8px;
        margin-bottom: 12px;
      }

      .related-info {
        .related-title {
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 8px 0;
          .text-ellipsis();
          color: @text-white;
        }

        .related-meta {
          font-size: 14px;
          color: @text-white-70;
          margin: 0;
          .text-ellipsis();
        }
      }
    }
  }
}

.error-state {
  .flex-center();
  flex-direction: column;
  gap: 20px;
  padding: 60px 20px;
  text-align: center;
  color: @text-white-70;

  p {
    font-size: 16px;
    margin: 0;
  }
}

// 响应式设计
@media (max-width: @tablet) {
  .header-bar {
    padding: 12px 16px;

    .page-title {
      font-size: 16px;
      margin: 0 16px;
    }
  }

  .video-player-container {
    padding: 16px;
  }

  .video-info {
    padding: 16px;

    .video-title {
      font-size: 20px;
    }

    .video-meta {
      grid-template-columns: 1fr;
      gap: 12px;

      .meta-item {
        padding: 10px 14px;
      }
    }
  }

  .related-videos {
    padding: 16px;

    .related-list {
      grid-template-columns: 1fr;
      gap: 12px;
    }
  }
}
</style>
