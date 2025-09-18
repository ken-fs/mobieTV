<template>
  <div class="audio-reading-page">
    <!-- 顶部导航 -->
    <div class="header">
      <button class="back-btn" @click="handleBack">
        <div class="back-icon">
          <svg class="arrow-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
          </svg>
        </div>
      </button>
      <h1 class="title">{{ bookTitle }}</h1>
    </div>

    <!-- 主要内容区域 -->
    <div class="content-wrapper">
      <!-- 左侧封面和播放器 -->
      <div class="left-section">
        <!-- 书籍封面 -->
        <div class="book-cover-container">
          <div class="cover-outer-ring">
            <div class="book-cover">
              <div
                class="cover-placeholder"
                :style="{ backgroundColor: coverBgColor }"
              >
                <div class="cover-title">{{ coverTitle }}</div>
                <div class="cover-subtitle">{{ coverSubtitle }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 书籍信息 -->
        <div class="book-info">
          <h2 class="book-title">{{ bookTitle }}</h2>
          <div class="book-meta">
            <span class="publisher">{{ publisher }}</span>
            <span class="play-count">播放次数：{{ playCount }}</span>
          </div>
        </div>

        <!-- 播放进度条 -->
        <div class="progress-section">
          <span class="current-time">{{ formatTime(currentTime) }}</span>
          <div class="progress-bar-container" @click="handleProgressClick">
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: progressPercent + '%' }"
              ></div>
              <div
                class="progress-thumb"
                :style="{ left: progressPercent + '%' }"
              ></div>
            </div>
          </div>
          <span class="total-time">{{ formatTime(totalTime) }}</span>
        </div>

        <!-- 播放控制按钮 -->
        <div class="controls">
          <button class="control-btn timer-btn" @click="toggleTimer">
            定时
          </button>
          <button class="control-btn prev-btn" @click="handlePrevious">
            <svg class="control-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
          </button>
          <button class="control-btn play-btn" @click="togglePlay">
            <svg
              v-if="!isPlaying"
              class="play-icon"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
            <svg
              v-else
              class="pause-icon"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          </button>
          <button class="control-btn next-btn" @click="handleNext">
            <svg class="control-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
            </svg>
          </button>
          <button class="control-btn speed-btn" @click="toggleSpeed">
            {{ speedText }}
          </button>
        </div>
      </div>

      <!-- 右侧内容区域 -->
      <div class="right-section">
        <!-- 简介区域 -->
        <div class="description-section">
          <p class="description">{{ description }}</p>
          <button class="full-description-btn" @click="toggleDescription">
            全部简介
          </button>
        </div>

        <!-- 目录标题 -->
        <h3 class="catalog-title">目录</h3>

        <!-- 章节筛选标签 -->
        <div class="chapter-tags">
          <button
            v-for="tag in chapterTags"
            :key="tag.id"
            class="chapter-tag"
            :class="{ active: tag.id === activeTagId }"
            @click="selectTag(tag.id)"
          >
            {{ tag.name }}
          </button>
        </div>

        <!-- 章节列表 -->
        <div class="chapter-list">
          <div
            v-for="chapter in filteredChapters"
            :key="chapter.id"
            class="chapter-item"
            :class="{ active: chapter.id === currentChapterId }"
            @click="selectChapter(chapter.id)"
          >
            <span class="chapter-number">{{ chapter.number }}</span>
            <span class="chapter-title">{{ chapter.title }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 倍速选择抽屉 - 暂时禁用 -->
    <!-- <BottomDrawer
      v-model:visible="showSpeedModal"
      type="speed"
      :options="speedOptions"
      :selected-value="playSpeed"
      @select="handleSpeedSelect"
    /> -->

    <!-- 定时定集设置抽屉 - 暂时禁用 -->
    <!-- <BottomDrawer
      v-model:visible="showSettingsModal"
      type="settings"
      :timer-options="timerOptions"
      :episode-options="episodeOptions"
      :selected-timer-value="selectedTimer"
      :selected-episode-value="selectedEpisode"
      @timer-select="handleTimerSelect"
      @episode-select="handleEpisodeSelect"
    /> -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
// import BottomDrawer from "@/components/BottomDrawer.vue"; // 组件不存在，暂时注释

// ============================================================================
// 组件属性和事件定义
// ============================================================================
const router = useRouter();

// ============================================================================
// 函数式编程工具函数 - 纯函数，无副作用
// ============================================================================
const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
};

const calculateProgress = (current: number, total: number): number => {
  return total > 0 ? (current / total) * 100 : 0;
};

// ============================================================================
// 状态管理 - 响应式状态
// ============================================================================
// 书籍基本信息
const bookTitle = ref("儒林外史");
const publisher = ref("格灵教育");
const playCount = ref("1.04万");
const description = ref(
  "本话在丛刊行办他高并张的没不功网，有者师宝理分。若使系不们事出的是走轮止分送将到，区现在度因资方。不表王本失习。计持台回动时雄行。公车我在是指..."
);

// 封面信息
const coverBgColor = ref("#F5D745");
const coverTitle = ref("纯间动物\n世界");
const coverSubtitle = ref("儿童折纸");

// 播放状态
const isPlaying = ref(false);
const currentTime = ref(498); // 8:18 = 498秒
const totalTime = ref(2013); // 33:33 = 2013秒
const playSpeed = ref(1.0);
const currentChapterId = ref(1);

// 底部抽屉弹窗（暂时不使用）
// const showSpeedModal = ref(false);
// const showSettingsModal = ref(false);

// 网络状态（暂时不使用）
// const isOnline = ref(true);
// const showNetworkError = ref(false);
// 暂时注释掉未使用的选项配置（BottomDrawer组件不存在）
// const speedOptions = ref([
//   { value: 0.75, label: "0.75x" },
//   { value: 1.0, label: "1.0x" },
//   { value: 1.25, label: "1.25x" },
//   { value: 1.5, label: "1.5x" },
//   { value: 2.0, label: "2.0x" },
// ]);

// // 定时停止选项
// const selectedTimer = ref<string | number>("none");
// const timerOptions = ref([
//   { value: "none", label: "无定时" },
//   { value: 10, label: "10分钟" },
//   { value: 20, label: "20分钟" },
//   { value: 30, label: "30分钟" },
// ]);

// // 定集停止选项
// const selectedEpisode = ref<string | number>("none");
// const episodeOptions = ref([
//   { value: "none", label: "无定集" },
//   { value: 1, label: "1集" },
//   { value: 2, label: "2集" },
//   { value: 3, label: "3集" },
// ]);

// 章节筛选标签
const chapterTags = ref([
  { id: 1, name: "01 - 20", range: [1, 20] },
  { id: 2, name: "21 - 41", range: [21, 41] },
  { id: 3, name: "42 - 62", range: [42, 62] },
  { id: 4, name: "63- 64", range: [63, 64] },
]);
const activeTagId = ref(1);

// 章节列表数据
const allChapters = ref([
  { id: 1, number: "01", title: "认识的植物", duration: 180 },
  { id: 2, number: "02", title: "大树和小草", duration: 200 },
  { id: 3, number: "03", title: "观察校园的树木", duration: 220 },
  { id: 4, number: "04", title: "植物的根", duration: 190 },
  { id: 5, number: "05", title: "植物的茎", duration: 210 },
  // ... 更多章节数据将通过接口获取
]);
// ============================================================================
// 计算属性
// ============================================================================
const progressPercent = computed(() =>
  calculateProgress(currentTime.value, totalTime.value)
);

const speedText = computed(() => `${playSpeed.value}倍数`);

const filteredChapters = computed(() => {
  const activeTag = chapterTags.value.find(
    (tag) => tag.id === activeTagId.value
  );
  if (!activeTag) return allChapters.value;

  return allChapters.value.filter((chapter) => {
    const chapterNum = parseInt(chapter.number);
    return chapterNum >= activeTag.range[0] && chapterNum <= activeTag.range[1];
  });
});

// ============================================================================
// 用户交互处理 - 事件处理函数
// ============================================================================
const handleBack = (): void => {
  router.back();
};

const togglePlay = (): void => {
  isPlaying.value = !isPlaying.value;
  // TODO: 实际的播放/暂停音频逻辑
};

const handlePrevious = (): void => {
  // TODO: 上一章节逻辑
  console.log("Previous chapter");
};

const handleNext = (): void => {
  // TODO: 下一章节逻辑
  console.log("Next chapter");
};

const toggleSpeed = (): void => {
  // TODO: 实现倍速选择功能
  console.log("Toggle speed selection");
};

const toggleTimer = (): void => {
  // TODO: 实现定时设置功能
  console.log("Toggle timer settings");
};

const handleSpeedSelect = (speed: string | number): void => {
  if (typeof speed === "number") {
    playSpeed.value = speed;
    // TODO: 设置音频播放速度
    console.log("Speed changed to:", speed);
  }
};

const handleProgressClick = (event: MouseEvent): void => {
  const target = event.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const percent = clickX / rect.width;
  currentTime.value = totalTime.value * percent;
  // TODO: 设置音频播放位置
};

const selectTag = (tagId: number): void => {
  activeTagId.value = tagId;
};

const selectChapter = (chapterId: number): void => {
  currentChapterId.value = chapterId;
  // TODO: 播放指定章节
  console.log("Play chapter:", chapterId);
};

const toggleDescription = (): void => {
  // TODO: 展开/收起完整简介
  console.log("Toggle full description");
};

// 暂时注释掉未使用的处理函数（相关变量已注释）
// const handleTimerSelect = (timer: string | number): void => {
//   selectedTimer.value = timer;
//   // TODO: 设置定时停止播放
//   console.log("Timer set to:", timer);
// };

// const handleEpisodeSelect = (episode: string | number): void => {
//   selectedEpisode.value = episode;
//   // TODO: 设置定集停止播放
//   console.log("Episode stop set to:", episode);
// };

// 网络相关处理函数（暂时不使用）
// const handleNetworkReconnect = (): void => {
//   try {
//     // 检查网络连接
//     if (navigator.onLine) {
//       isOnline.value = true;
//       // 恢复播放
//       if (isPlaying.value) {
//         // TODO: 实际的恢复播放逻辑
//         console.log("恢复播放");
//       }
//     } else {
//       // 如果仍然没有网络，重新显示错误提示
//       showNetworkError.value = true;
//     }
//   } catch (error) {
//     console.error("重新连接失败:", error);
//     showNetworkError.value = true;
//   }
// };
// ============================================================================
// 生命周期管理 - 资源初始化和清理
// ============================================================================
onMounted(() => {
  // TODO: 初始化音频播放器
  // TODO: 获取书籍详情数据
  // TODO: 获取章节列表数据
  console.log("AudioReading component mounted");
});

onUnmounted(() => {
  // TODO: 清理音频播放器资源
  console.log("AudioReading component unmounted");
});

// const handleOffline = (): void => {
//   isOnline.value = false;
//   showNetworkError.value = true;
//   // 暂停播放
//   if (isPlaying.value) {
//     isPlaying.value = false;
//     // TODO: 实际的暂停播放逻辑
//   }
// };
// ============================================================================
// 接口预留
// ============================================================================
// TODO: 添加以下接口函数
// const fetchBookDetails = async (bookId: string) => {}
// const fetchChapterList = async (bookId: string) => {}
// const updatePlayProgress = async (bookId: string, chapterId: number, progress: number) => {}
</script>

<style lang="less" scoped>
@import "@/assets/styles/variables.less";

.audio-reading-page {
  width: 100%;
  height: 100vh;
  background: @background-gradient;
  padding: 30px 64px 36px 64px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(
        circle at 30% 40%,
        rgba(51, 202, 158, 0.1) 0%,
        transparent 50%
      ),
      radial-gradient(
        circle at 80% 20%,
        rgba(91, 141, 239, 0.1) 0%,
        transparent 50%
      ),
      radial-gradient(
        circle at 40% 80%,
        rgba(139, 95, 191, 0.1) 0%,
        transparent 50%
      );
    pointer-events: none;
  }

  .header {
    display: flex;
    align-items: center;
    padding: 10px 0px;

    .back-btn {
      background: none;
      border: none;
      cursor: pointer;
      margin-right: 20px;
      color: @text-white;
      font-size: 36px;
      padding: 8px;
      border-radius: 8px;
      transition: @transition-fast;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      .back-icon {
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: center;

        .arrow-icon {
          width: 48px;
          height: 48px;
        }
      }
    }

    .title {
      color: @text-white;
      font-size: 36px;
      font-weight: 600;
      margin: 0;
    }
  }

  .content-wrapper {
    flex: 1;
    display: flex;
    padding: 16px 0px 0px 0px;
    gap: 60px;
    overflow: hidden;
  }

  .left-section {
    flex: 1;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: center;

    .book-cover-container {
      margin-bottom: 30px;

      .cover-outer-ring {
        width: 270px;
        height: 270px;
        border-radius: 50%;
        background: conic-gradient(
          from 0deg,
          #33ca9e 0deg,
          #5b8def 120deg,
          #8b5fbf 240deg,
          #33ca9e 360deg
        );
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;

        &::before {
          content: "";
          position: absolute;
          inset: 8px;
          border-radius: 50%;
          background: @background-gradient;
        }
      }

      .book-cover {
        width: 230px;
        height: 230px;
        border-radius: 50%;
        overflow: hidden;
        position: relative;
        z-index: 1;

        .cover-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;

          .cover-title {
            font-size: 20px;
            font-weight: bold;
            color: #333;
            line-height: 1.2;
            margin-bottom: 10px;
            white-space: pre-line;
          }

          .cover-subtitle {
            font-size: 14px;
            color: #666;
          }
        }
      }
    }

    .book-info {
      text-align: center;
      margin-bottom: 40px;

      .book-title {
        color: @text-white;
        font-size: 32px;
        font-weight: 600;
        margin: 0 0 15px 0;
      }

      .book-meta {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 30px;
        color: @text-white-70;
        font-size: 16px;

        .publisher,
        .play-count {
          position: relative;
        }
      }
    }

    .progress-section {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 30px;

      .current-time,
      .total-time {
        color: @text-white;
        font-size: 16px;
        font-weight: 500;
        min-width: 50px;
        text-align: center;
      }

      .progress-bar-container {
        flex: 1;
        cursor: pointer;

        .progress-bar {
          height: 4px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 2px;
          position: relative;
          overflow: visible;

          .progress-fill {
            height: 100%;
            background: @primary-color;
            border-radius: 2px;
            transition: width 0.1s ease;
          }

          .progress-thumb {
            position: absolute;
            top: 50%;
            transform: translate(-50%, -50%);
            width: 16px;
            height: 16px;
            background: @primary-color;
            border: 2px solid @text-white;
            border-radius: 50%;
            transition: left 0.1s ease;
          }
        }
      }
    }

    .controls {
      display: flex;
      align-items: center;
      gap: 20px;

      .control-btn {
        background: rgba(42, 55, 79, 0.8);
        border: none;
        border-radius: 50px;
        color: @text-white;
        cursor: pointer;
        transition: @transition-fast;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);

        &:hover {
          background: rgba(42, 55, 79, 0.9);
          transform: translateY(-1px);
          border-color: rgba(255, 255, 255, 0.2);
        }

        &.timer-btn,
        &.speed-btn {
          padding: 12px 20px;
          font-weight: 500;
        }

        &.prev-btn,
        &.next-btn {
          width: 50px;
          height: 50px;

          .control-icon {
            width: 20px;
            height: 20px;
          }
        }

        &.play-btn {
          width: 70px;
          height: 70px;
          background: @primary-color;
          border-color: @primary-color;

          &:hover {
            background: lighten(@primary-color, 10%);
            border-color: lighten(@primary-color, 10%);
          }

          .play-icon,
          .pause-icon {
            width: 28px;
            height: 28px;
          }
        }
      }
    }
  }

  .right-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
    z-index: 1;

    .description-section {
      margin-bottom: 30px;
      position: relative;
      z-index: 1;

      .description {
        color: @text-white-80;
        font-size: 16px;
        line-height: 1.6;
        margin: 0 0 10px 0;
      }

      .full-description-btn {
        background: none;
        border: none;
        color: @text-white-70;
        cursor: pointer;
        font-size: 14px;
        text-decoration: underline;
        padding: 0;
        transition: @transition-fast;

        &:hover {
          color: @primary-color;
        }
      }
    }

    .catalog-title {
      color: @text-white;
      font-size: 20px;
      font-weight: 600;
      margin: 0 0 20px 0;
    }

    .chapter-tags {
      display: flex;
      gap: 12px;
      margin-bottom: 30px;

      .chapter-tag {
        background: rgba(42, 55, 79, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 25px;
        color: @text-white-70;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        padding: 10px 20px;
        transition: @transition-fast;
        backdrop-filter: blur(10px);

        &:hover {
          background: rgba(42, 55, 79, 0.8);
          color: @text-white;
          border-color: rgba(255, 255, 255, 0.2);
        }

        &.active {
          background: @primary-color;
          color: @text-white;
          border-color: @primary-color;
          box-shadow: 0 0 20px rgba(51, 202, 158, 0.3);
        }
      }
    }

    .chapter-list {
      flex: 1;
      overflow-y: auto;
      .scrollbar-normal();

      .chapter-item {
        width: 98%;
        background: rgba(42, 55, 79, 0.4);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 15px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 15px;
        margin-bottom: 12px;
        padding: 18px 20px;
        transition: @transition-fast;
        backdrop-filter: blur(10px);

        &:hover {
          background: rgba(42, 55, 79, 0.6);
          border-color: rgba(255, 255, 255, 0.1);
          transform: translateX(4px);
        }

        &.active {
          background: rgba(51, 202, 158, 0.15);
          border-color: @primary-color;
          box-shadow: 0 0 15px rgba(51, 202, 158, 0.2);

          .chapter-number {
            color: @primary-color;
            font-weight: 700;
          }

          .chapter-title {
            color: @text-white;
            font-weight: 500;
          }
        }

        .chapter-number {
          color: @primary-color;
          font-size: 16px;
          font-weight: 600;
          min-width: 30px;
        }

        .chapter-title {
          color: @text-white-80;
          font-size: 16px;
          flex: 1;
        }
      }
    }
  }
}

// 样式已移动到 BottomDrawer 组件中

// 响应式设计
@media (max-width: @desktop) {
  .audio-reading-page {
    .content-wrapper {
      flex-direction: column;
      gap: 30px;
      overflow-y: auto;
      .scrollbar-normal();
    }

    .left-section {
      width: 100%;
      flex-shrink: 0;
    }

    .right-section {
      flex: none;
      height: auto;
    }
  }
}

@media (max-width: @tablet) {
  .audio-reading-page {
    .header {
      padding: 16px 20px;

      .title {
        font-size: 20px;
      }
    }

    .content-wrapper {
      padding: 20px;
    }

    .left-section {
      .book-cover-container {
        .cover-outer-ring {
          width: 240px;
          height: 240px;
        }

        .book-cover {
          width: 200px;
          height: 200px;
        }
      }

      .controls {
        gap: 12px;

        .control-btn {
          &.prev-btn,
          &.next-btn {
            width: 40px;
            height: 40px;
            font-size: 16px;
          }

          &.play-btn {
            width: 60px;
            height: 60px;
            font-size: 20px;
          }
        }
      }
    }

    .right-section {
      .chapter-tags {
        flex-wrap: wrap;
        gap: 8px;
        width: 118px;
        height: 50px;

        .chapter-tag {
          padding: 8px 16px;
          font-size: 13px;
        }
      }
    }
  }

  // 底部抽屉样式已移动到 BottomDrawer 组件中
}
</style>
