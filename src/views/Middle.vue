<template>
  <div class="middle-page">
    <!-- Loading状态 -->
    <Loading :visible="shouldShowLoading" text="加载中..." />

    <!-- 正常页面内容 -->
    <template v-if="!shouldShowLoading">
      <!-- 顶部标签栏 -->
      <TabBar
        v-model="activeTab"
        :tab-items="tabItems as any"
        @change="handleTabChange"
        class="top-tabs"
      />

      <!-- 主要内容区域 -->
      <div class="main-content">
        <!-- 左侧边栏 -->
        <div class="sidebar-container">
          <SideBar
            :sidebarItems="dynamicSidebarItems"
            :modelValue="activeSidebar"
            @update:modelValue="updateActiveSidebar"
            @change="handleSidebarChange"
          />
        </div>

        <!-- 右侧内容区域 -->
        <div
          class="content-container"
          ref="contentContainer"
          @scroll="handleScroll"
        >
          <!-- 动态内容区域 -->
          <AutoPage
            v-if="pageContentData.length > 0"
            :data="pageContentData"
            :max-items="20"
            @click-callback="handleContentClick"
          />
          
          <!-- 无数据提示 -->
          <div v-else-if="!shouldShowLoading" class="no-data-message">
            <p>暂无内容数据，请稍后再试</p>
          </div>

          <!-- 返回顶部组件 -->
          <Return2Top :threshold="200" :container="contentContainer" />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import TabBar from "@/components/layout/TabBar.vue";
import SideBar from "@/components/layout/SideBar.vue";
import Return2Top from "@/components/common/Return2Top.vue";
import Loading from "@/components/loading/index.vue";
import AutoPage from "@/components/common/AutoPage.vue";
import { useAutoPageEducationForPage } from "@/composable/useAutoPageEducation";

// ============================================================================
// 使用通用的AutoPage教育页面逻辑
// ============================================================================
const {
  activeTab,
  activeSidebar,
  contentContainer,
  tabItems,
  shouldShowLoading,
  handleScroll,
  updateActiveSidebar,
  handleSidebarChange,
  handleTabChange,
  pageContentData,
  dynamicSidebarItems,
  handleContentClick,
} = useAutoPageEducationForPage('Middle.vue');
</script>

<style lang="less" scoped>
@import "@/assets/styles/variables.less";

.middle-page {
  width: 100%;
  height: 100vh;
  background: @background-gradient;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .top-tabs {
    flex-shrink: 0;
  }

  .main-content {
    flex: 1;
    display: flex;
    overflow: hidden;
    padding: 24px 0 68px 0;
    .sidebar-container {
      width: 280px;
      flex-shrink: 0;
    }

    .content-container {
      flex: 1;
      overflow-y: auto;
      padding: 20px 30px;
      .scrollbar-normal();

      .no-data-message {
        text-align: center;
        padding: 50px 20px;
        color: @text-white-70;
        font-size: 16px;
        background: @card-bg;
        border-radius: @card-border-radius;
        margin: 20px 0;
      }

      .content-section {
        margin-bottom: 60px;

        &:last-child {
          margin-bottom: 20px;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 30px;

          .section-tag {
            background: @primary-color;
            color: @text-white;
            padding: 8px 20px;
            border-radius: 25px;
            font-size: 14px;
            font-weight: 500;
          }

          h2 {
            color: @text-white;
            font-size: 32px;
            font-weight: 600;
            margin: 0;
          }
        }

        .video-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 30px;

          &.large-grid {
            grid-template-columns: repeat(4, 1fr);
          }

          .video-card {
            background: @card-bg;
            border-radius: @card-small-radius;
            overflow: hidden;
            transition: @transition-normal;
            cursor: pointer;

            &:hover {
              background: @card-bg-hover;
              transform: translateY(-2px);
              box-shadow: @shadow-hover;
            }

            .video-thumbnail {
              position: relative;
              width: 100%;
              height: 160px;
              overflow: hidden;

              img {
                width: 100%;
                height: 100%;
                object-fit: cover;
              }

              .play-button {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 50px;
                height: 50px;
                background: rgba(0, 0, 0, 0.7);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 18px;
                opacity: 0;
                transition: @transition-fast;
              }

              &:hover .play-button {
                opacity: 1;
              }
            }

            .video-title {
              padding: 15px;
              color: @text-white;
              font-size: 14px;
              font-weight: 500;
              text-align: center;
            }
          }
        }

        .book-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;

          .book-card {
            text-align: center;
            cursor: pointer;
            transition: @transition-normal;

            &:hover {
              transform: translateY(-4px);
            }

            .book-cover {
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

            .book-title {
              color: @text-white;
              font-size: 14px;
              font-weight: 500;
              margin-bottom: 4px;
            }

            .book-subtitle {
              color: @text-white-70;
              font-size: 12px;
            }
          }
        }

        .placeholder-content {
          padding: 40px;
          text-align: center;
          background: @card-bg;
          border-radius: @card-border-radius;

          p {
            color: @text-white-70;
            font-size: 16px;
            margin: 10px 0;
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: @desktop) {
  .middle-page {
    .main-content {
      .sidebar-container {
        width: 200px;
      }

      .content-container {
        padding: 16px 20px;

        .content-section {
          .video-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;

            &.large-grid {
              grid-template-columns: repeat(3, 1fr);
            }
          }

          .book-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }
      }
    }
  }
}

@media (max-width: @tablet) {
  .middle-page {
    .main-content {
      .sidebar-container {
        width: 160px;
      }

      .content-container {
        padding: 12px 16px;

        .content-section {
          .section-header {
            h2 {
              font-size: 20px;
            }
          }

          .video-grid {
            grid-template-columns: 1fr;

            &.large-grid {
              grid-template-columns: repeat(2, 1fr);
            }
          }

          .book-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      }
    }
  }
}
</style>
