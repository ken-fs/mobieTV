<template>
  <div class="profile-container">
    <!-- 用户信息卡片 -->
    <div class="user-card">
      <div class="user-info">
        <div class="avatar">
          <img v-if="userInfo?.avatar" :src="userInfo.avatar" alt="用户头像" />
          <span v-else class="avatar-placeholder">👤</span>
        </div>
        <div class="user-details">
          <h2 class="username">{{ userInfo?.nickname || userInfo?.username || '未登录' }}</h2>
          <p class="user-email">{{ userInfo?.email || '请登录后查看' }}</p>
          <div class="user-status">
            <span :class="['status-badge', { 'online': isAuthenticated, 'offline': !isAuthenticated }]">
              {{ isAuthenticated ? '已登录' : '未登录' }}
            </span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 功能菜单 -->
    <van-cell-group class="menu-group">
      <van-cell 
        title="观看历史" 
        is-link 
        icon="clock-o"
        @click="handleWatchHistory"
      />
      <van-cell 
        title="我的收藏" 
        is-link 
        icon="star-o"
        @click="handleFavorites"
      />
      <van-cell 
        title="下载管理" 
        is-link 
        icon="down"
        @click="handleDownloads"
      />
    </van-cell-group>
    
    <!-- 设置菜单 -->
    <van-cell-group class="menu-group">
      <van-cell 
        title="账号设置" 
        is-link 
        icon="setting-o"
        @click="handleAccountSettings"
      />
      <van-cell 
        title="播放设置" 
        is-link 
        icon="play"
        @click="handlePlaySettings"
      />
      <van-cell 
        title="帮助与反馈" 
        is-link 
        icon="question-o"
        @click="handleHelp"
      />
      <van-cell 
        title="关于我们" 
        is-link 
        icon="info-o"
        @click="handleAbout"
      />
    </van-cell-group>
    
    <!-- 登出按钮 -->
    <div class="logout-section" v-if="isAuthenticated">
      <van-button 
        type="danger" 
        size="large" 
        block
        round
        :loading="isLoggingOut"
        loading-text="退出中..."
        @click="handleLogout"
      >
        退出登录
      </van-button>
    </div>

    <!-- 登录按钮 -->
    <div class="login-section" v-else>
      <van-button 
        type="primary" 
        size="large" 
        block
        round
        @click="handleGoToLogin"
      >
        立即登录
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showSuccessToast, showFailToast, Dialog } from 'vant'
import { useAuthStore } from '@/stores/auth'

// ============================================================================
// 依赖注入
// ============================================================================

const router = useRouter()
const authStore = useAuthStore()

// ============================================================================
// 响应式状态
// ============================================================================

/** 是否正在登出 */
const isLoggingOut = ref<boolean>(false)

// ============================================================================
// 计算属性
// ============================================================================

/** 是否已认证 */
const isAuthenticated = computed<boolean>(() => authStore.isAuthenticated)

/** 用户信息 */
const userInfo = computed(() => authStore.userInfo)

// ============================================================================
// 事件处理函数
// ============================================================================

/**
 * 处理观看历史
 */
const handleWatchHistory = (): void => {
  if (!isAuthenticated.value) {
    showToast('请先登录')
    return
  }
  showToast('观看历史功能开发中...')
}

/**
 * 处理我的收藏
 */
const handleFavorites = (): void => {
  if (!isAuthenticated.value) {
    showToast('请先登录')
    return
  }
  showToast('我的收藏功能开发中...')
}

/**
 * 处理下载管理
 */
const handleDownloads = (): void => {
  if (!isAuthenticated.value) {
    showToast('请先登录')
    return
  }
  showToast('下载管理功能开发中...')
}

/**
 * 处理账号设置
 */
const handleAccountSettings = (): void => {
  if (!isAuthenticated.value) {
    showToast('请先登录')
    return
  }
  showToast('账号设置功能开发中...')
}

/**
 * 处理播放设置
 */
const handlePlaySettings = (): void => {
  showToast('播放设置功能开发中...')
}

/**
 * 处理帮助与反馈
 */
const handleHelp = (): void => {
  showToast('帮助与反馈功能开发中...')
}

/**
 * 处理关于我们
 */
const handleAbout = (): void => {
  showToast('关于我们功能开发中...')
}

/**
 * 处理退出登录
 */
const handleLogout = async (): Promise<void> => {
  try {
    await Dialog.confirm({
      title: '确认退出',
      message: '确定要退出登录吗？',
      confirmButtonText: '退出',
      cancelButtonText: '取消',
      confirmButtonColor: '#ee0a24'
    })

    isLoggingOut.value = true
    await authStore.logout()
    showSuccessToast('已退出登录')
    
    // 跳转到登录页
    await router.replace('/login')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('退出登录失败:', error)
      showFailToast('退出登录失败')
    }
  } finally {
    isLoggingOut.value = false
  }
}

/**
 * 处理跳转到登录页
 */
const handleGoToLogin = (): void => {
  router.push('/login')
}
</script>

<style lang="less" scoped>
@import '@/assets/styles/variables.less';

.profile-container {
  min-height: 100vh;
  background: @background-gradient;
  padding: 20px;
}

// 用户信息卡片
.user-card {
  .card-base();
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: @shadow-normal;

  .user-info {
    display: flex;
    align-items: center;
    
    .avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      overflow: hidden;
      border: 3px solid @primary-color;
      box-shadow: @shadow-primary;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .avatar-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.1);
        font-size: 32px;
        color: @text-white-80;
      }
    }
    
    .user-details {
      margin-left: 20px;
      flex: 1;
      
      .username {
        font-size: 20px;
        font-weight: 600;
        color: @text-white;
        margin: 0 0 8px 0;
      }
      
      .user-email {
        font-size: 14px;
        color: @text-white-70;
        margin: 0 0 12px 0;
      }
      
      .user-status {
        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          
          &.online {
            background: rgba(51, 202, 158, 0.2);
            color: @primary-color;
            border: 1px solid @primary-color;
          }
          
          &.offline {
            background: rgba(255, 107, 107, 0.2);
            color: #ff6b6b;
            border: 1px solid #ff6b6b;
          }
        }
      }
    }
  }
}

// 菜单组
.menu-group {
  margin-bottom: 16px;
  border-radius: @card-border-radius;
  overflow: hidden;
  box-shadow: @shadow-normal;
  
  :deep(.van-cell) {
    background: @card-bg;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    
    &:last-child {
      border-bottom: none;
    }
    
    .van-cell__title {
      color: @text-white-80;
      font-weight: 500;
    }
    
    .van-cell__right-icon {
      color: @text-white-70;
    }
    
    .van-icon {
      color: @primary-color;
      margin-right: 12px;
    }
    
    &:hover {
      background: @card-bg-hover;
    }
  }
}

// 登出/登录按钮区域
.logout-section,
.login-section {
  margin-top: 32px;
  
  .van-button {
    height: 48px;
    font-size: 16px;
    font-weight: 600;
    box-shadow: @shadow-normal;
    
    &.van-button--danger {
      background: linear-gradient(135deg, #ff6b6b, #ee5a6f);
      border: none;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 20px 6px rgba(255, 107, 107, 0.3);
      }
    }
    
    &.van-button--primary {
      background: linear-gradient(135deg, @primary-color, #4ECDC4);
      border: none;
      box-shadow: @shadow-primary;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 20px 6px @primary-shadow;
      }
    }
    
    &:active {
      transform: translateY(0);
    }
  }
}

// 移动端适配
@media (max-width: @mobile) {
  .profile-container {
    padding: 16px;
  }
  
  .user-card {
    padding: 20px;
    margin-bottom: 20px;
    
    .user-info {
      .avatar {
        width: 60px;
        height: 60px;
        
        .avatar-placeholder {
          font-size: 24px;
        }
      }
      
      .user-details {
        margin-left: 16px;
        
        .username {
          font-size: 18px;
        }
      }
    }
  }
}
</style>