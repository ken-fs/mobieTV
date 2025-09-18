<template>
  <div class="m3u8-player-container" :style="containerStyle">
    <!-- 视频播放器 -->
    <video
      ref="videoElement"
      class="video-player"
      :poster="poster"
      :muted="muted"
      :autoplay="autoplay"
      :loop="loop"
      :controls="showControls"
      :preload="preload"
      playsinline
      webkit-playsinline
      x5-playsinline
      x5-video-player-type="h5"
      x5-video-player-fullscreen="true"
      @loadstart="onLoadStart"
      @loadeddata="onLoadedData"
      @canplay="onCanPlay"
      @play="onPlay"
      @playing="onPlaying"
      @pause="onPause"
      @ended="onEnded"
      @timeupdate="onTimeUpdate"
      @progress="onProgress"
      @error="onError"
      @waiting="onWaiting"
      @seeked="onSeeked"
    ></video>

    <!-- 加载动画 -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner">
        <div class="spinner-ring"></div>
        <p>{{ loadingText }}</p>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="hasError" class="error-overlay">
      <div class="error-message">
        <div class="error-icon">⚠️</div>
        <h3>播放出错</h3>
        <p>{{ errorMessage }}</p>
        <button class="retry-button" @click="retryPlay">重试</button>
      </div>
    </div>

    <!-- 自定义控制栏 -->
    <div v-if="useCustomControls" class="custom-controls" :class="{ 'controls-hidden': !controlsVisible }">
      <div class="controls-background">
        <!-- 播放/暂停按钮 -->
        <button class="control-button play-pause" @click="togglePlayPause">
          <svg v-if="!isPlaying" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
          </svg>
        </button>

        <!-- 时间显示 -->
        <div class="time-display">
          <span>{{ formatTime(currentTime) }}</span>
          <span>/</span>
          <span>{{ formatTime(duration) }}</span>
        </div>

        <!-- 进度条 -->
        <div class="progress-container" ref="progressContainer" @click="seekTo">
          <div class="progress-background">
            <div class="progress-buffered" :style="{ width: bufferedPercent + '%' }"></div>
            <div class="progress-played" :style="{ width: playedPercent + '%' }"></div>
            <div class="progress-thumb" :style="{ left: playedPercent + '%' }"></div>
          </div>
        </div>

        <!-- 音量控制 -->
        <div class="volume-control">
          <button class="control-button volume-button" @click="toggleMute">
            <svg v-if="!isMuted && volume > 0.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            </svg>
            <svg v-else-if="!isMuted && volume > 0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 9v6h4l5 5V4L7 9H3zm7 6.5c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="currentColor">
              <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
            </svg>
          </button>
        </div>

        <!-- 播放速度按钮 -->
        <div class="playback-rate">
          <button class="control-button rate-button" @click="toggleRateModal">
            {{ playbackRate }}x
          </button>
        </div>

        <!-- 清晰度切换 -->
        <div v-if="qualityLevels.length > 1" class="quality-selector">
          <select v-model="currentQuality" @change="changeQuality" class="quality-select">
            <option v-for="quality in qualityLevels" :key="quality.index" :value="quality.index">
              {{ quality.name }}
            </option>
          </select>
        </div>

        <!-- 全屏按钮 -->
        <button class="control-button fullscreen-button" @click="toggleFullscreen">
          <svg v-if="!isFullscreen" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="currentColor">
            <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- 中央播放按钮 -->
    <div v-if="showCenterPlayButton && !isPlaying" class="center-play-button" @click="play">
      <div class="play-button-circle">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z"/>
        </svg>
      </div>
    </div>

    <!-- 倍速选择弹窗 -->
    <div v-if="showRateModal" class="rate-modal-overlay" @click="closeRateModal">
      <div class="rate-modal" @click.stop>
        <div class="rate-modal-header">
          <h3>倍数选择</h3>
        </div>
        <div class="rate-options">
          <button 
            v-for="rate in rateOptions" 
            :key="rate" 
            class="rate-option"
            :class="{ active: playbackRate === rate }"
            @click="selectPlaybackRate(rate)"
          >
            {{ rate }}x
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useM3U8Player } from '@/composable/m3u8/useM3U8Player'

export default {
  name: 'Vue3M3U8Player',
  props: {
    // 视频源地址
    src: {
      type: String,
      required: true
    },
    // 视频封面
    poster: {
      type: String,
      default: ''
    },
    // 播放器宽度
    width: {
      type: [String, Number],
      default: '100%'
    },
    // 播放器高度
    height: {
      type: [String, Number],
      default: 'auto'
    },
    // 是否自动播放
    autoplay: {
      type: Boolean,
      default: false
    },
    // 是否静音
    muted: {
      type: Boolean,
      default: false
    },
    // 是否循环播放
    loop: {
      type: Boolean,
      default: false
    },
    // 预加载策略
    preload: {
      type: String,
      default: 'metadata',
      validator: value => ['none', 'metadata', 'auto'].includes(value)
    },
    // 是否显示原生控制栏
    controls: {
      type: Boolean,
      default: false
    },
    // 是否使用自定义控制栏
    useCustomControls: {
      type: Boolean,
      default: true
    },
    // 是否显示中央播放按钮
    showCenterPlayButton: {
      type: Boolean,
      default: true
    },
    // 加载文本
    loadingText: {
      type: String,
      default: '视频加载中...'
    },
    // HLS配置
    hlsConfig: {
      type: Object,
      default: () => ({
        enableWorker: false,
        lowLatencyMode: true,
        backBufferLength: 90
      })
    },
    // 自动重试次数
    autoRetryTimes: {
      type: Number,
      default: 3
    },
    // 播放记录回调
    onPlayRecord: {
      type: Function,
      default: null
    }
  },
  emits: [
    'loadstart',
    'loadeddata', 
    'canplay',
    'play',
    'playing',
    'pause',
    'ended',
    'timeupdate',
    'progress',
    'error',
    'waiting',
    'seeked',
    'quality-change',
    'fullscreen-change'
  ],
  setup(props, { emit }) {
    // 使用M3U8播放器Composable
    const {
      videoElement,
      isLoading,
      hasError,
      errorMessage,
      isPlaying,
      currentTime,
      duration,
      volume,
      isMuted,
      bufferedPercent,
      qualityLevels,
      currentQuality,
      initPlayer,
      play,
      pause,
      togglePlayPause,
      setVolume,
      toggleMute,
      seekTo: seekToTime,
      changeQuality,
      retryPlay,
      destroy
    } = useM3U8Player()

    // 响应式数据
    const progressContainer = ref(null)
    const playbackRate = ref(1)
    const isFullscreen = ref(false)
    const controlsVisible = ref(true)
    const controlsTimer = ref(null)
    const showRateModal = ref(false)
    const rateOptions = [0.75, 1.0, 1.25, 1.5, 2.0]

    // 计算属性
    const containerStyle = computed(() => ({
      width: typeof props.width === 'number' ? `${props.width}px` : props.width,
      height: typeof props.height === 'number' ? `${props.height}px` : props.height,
      aspectRatio: props.height === 'auto' ? '16 / 9' : 'unset'
    }))

    const showControls = computed(() => {
      return props.controls && !props.useCustomControls
    })

    const playedPercent = computed(() => {
      return duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0
    })

    // 方法
    const formatTime = (time) => {
      if (!time || isNaN(time)) return '00:00'
      
      const hours = Math.floor(time / 3600)
      const minutes = Math.floor((time % 3600) / 60)
      const seconds = Math.floor(time % 60)
      
      if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      }
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }

    const seekTo = (event) => {
      if (!progressContainer.value || duration.value <= 0) return
      
      const rect = progressContainer.value.getBoundingClientRect()
      const percent = (event.clientX - rect.left) / rect.width
      const seekTime = percent * duration.value
      
      seekToTime(Math.max(0, Math.min(seekTime, duration.value)))
    }

    const changePlaybackRate = () => {
      if (videoElement.value) {
        videoElement.value.playbackRate = parseFloat(playbackRate.value)
      }
    }

    const toggleRateModal = () => {
      showRateModal.value = !showRateModal.value
    }

    const closeRateModal = () => {
      showRateModal.value = false
    }

    const selectPlaybackRate = (rate) => {
      playbackRate.value = rate
      changePlaybackRate()
      closeRateModal()
    }

    const toggleFullscreen = async () => {
      try {
        if (!document.fullscreenElement) {
          await videoElement.value?.requestFullscreen?.()
          isFullscreen.value = true
        } else {
          await document.exitFullscreen?.()
          isFullscreen.value = false
        }
        emit('fullscreen-change', isFullscreen.value)
      } catch (error) {
        console.warn('全屏操作失败:', error)
      }
    }

    const showControlsTemporarily = () => {
      controlsVisible.value = true
      clearTimeout(controlsTimer.value)
      controlsTimer.value = setTimeout(() => {
        if (isPlaying.value) {
          controlsVisible.value = false
        }
      }, 3000)
    }

    const hideControlsOnIdle = () => {
      if (props.useCustomControls) {
        showControlsTemporarily()
      }
    }

    // 事件处理
    const onLoadStart = () => {
      emit('loadstart')
    }

    const onLoadedData = () => {
      emit('loadeddata')
    }

    const onCanPlay = () => {
      emit('canplay')
    }

    const onPlay = () => {
      // 记录播放行为
      if (props.onPlayRecord && typeof props.onPlayRecord === 'function') {
        props.onPlayRecord()
      }
      emit('play')
    }

    const onPlaying = () => {
      emit('playing')
    }

    const onPause = () => {
      controlsVisible.value = true
      emit('pause')
    }

    const onEnded = () => {
      controlsVisible.value = true
      emit('ended')
    }

    const onTimeUpdate = () => {
      emit('timeupdate', {
        currentTime: currentTime.value,
        duration: duration.value
      })
    }

    const onProgress = () => {
      emit('progress')
    }

    const onError = (event) => {
      emit('error', event)
    }

    const onWaiting = () => {
      emit('waiting')
    }

    const onSeeked = () => {
      emit('seeked')
    }

    // 监听全屏状态变化
    const handleFullscreenChange = () => {
      isFullscreen.value = !!document.fullscreenElement
      emit('fullscreen-change', isFullscreen.value)
    }

    // 生命周期
    onMounted(async () => {
      await nextTick()
      
      // 初始化播放器
      await initPlayer(props.src, props.hlsConfig)
      
      // 监听全屏变化
      document.addEventListener('fullscreenchange', handleFullscreenChange)
      
      // 鼠标移动显示控制栏
      if (props.useCustomControls) {
        videoElement.value?.addEventListener('mousemove', hideControlsOnIdle)
        videoElement.value?.addEventListener('click', hideControlsOnIdle)
      }
    })

    onUnmounted(() => {
      clearTimeout(controlsTimer.value)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      destroy()
    })

    // 监听src变化
    watch(() => props.src, async (newSrc) => {
      if (newSrc) {
        await initPlayer(newSrc, props.hlsConfig)
      }
    })

    return {
      // Refs
      videoElement,
      progressContainer,
      
      // 响应式数据
      isLoading,
      hasError,
      errorMessage,
      isPlaying,
      currentTime,
      duration,
      volume,
      isMuted,
      bufferedPercent,
      playedPercent,
      qualityLevels,
      currentQuality,
      playbackRate,
      isFullscreen,
      controlsVisible,
      showRateModal,
      rateOptions,
      
      // 计算属性
      containerStyle,
      showControls,
      
      // 方法
      play,
      pause,
      togglePlayPause,
      setVolume,
      toggleMute,
      seekTo,
      changeQuality,
      changePlaybackRate,
      toggleRateModal,
      closeRateModal,
      selectPlaybackRate,
      toggleFullscreen,
      retryPlay,
      formatTime,
      
      // 事件处理
      onLoadStart,
      onLoadedData,
      onCanPlay,
      onPlay,
      onPlaying,
      onPause,
      onEnded,
      onTimeUpdate,
      onProgress,
      onError,
      onWaiting,
      onSeeked
    }
  }
}
</script>

<style scoped>
.m3u8-player-container {
  position: relative;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  user-select: none;
}

.video-player {
  width: 100%;
  height: 100%;
  display: block;
}

/* 加载动画 */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.loading-spinner {
  text-align: center;
  color: white;
}

.spinner-ring {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.2);
  border-top: 4px solid #ffffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 错误提示 */
.error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.error-message {
  text-align: center;
  color: white;
  padding: 20px;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-message h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
}

.error-message p {
  margin: 0 0 16px 0;
  color: #ccc;
}

.retry-button {
  background: #ff6b6b;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
}

.retry-button:hover {
  background: #ff5252;
}

/* 自定义控制栏 */
.custom-controls {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 20;
  transition: opacity 0.3s ease;
}

.custom-controls.controls-hidden {
  opacity: 0;
  pointer-events: none;
}

.controls-background {
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  padding: 20px 16px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.control-button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.2s;
  flex-shrink: 0;
}

.control-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.control-button svg {
  width: 20px;
  height: 20px;
  display: block;
}

.play-pause svg {
  width: 24px;
  height: 24px;
}

.time-display {
  color: white;
  font-size: 14px;
  white-space: nowrap;
  flex-shrink: 0;
}

.time-display span:nth-child(2) {
  margin: 0 4px;
  color: #ccc;
}

/* 进度条 */
.progress-container {
  flex: 1;
  cursor: pointer;
  padding: 8px 0;
}

.progress-background {
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  position: relative;
  overflow: hidden;
}

.progress-buffered {
  height: 100%;
  background: rgba(255, 255, 255, 0.5);
  transition: width 0.2s;
}

.progress-played {
  height: 100%;
  background: #ff6b6b;
  position: absolute;
  top: 0;
  left: 0;
  transition: width 0.1s;
}

.progress-thumb {
  width: 12px;
  height: 12px;
  background: #ff6b6b;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  opacity: 0;
  transition: opacity 0.2s;
}

.progress-container:hover .progress-thumb {
  opacity: 1;
}

/* 音量控制 */
.volume-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 选择框 */
.quality-select {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.quality-select:focus {
  outline: none;
  border-color: #ff6b6b;
}

/* 中央播放按钮 */
.center-play-button {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  cursor: pointer;
  z-index: 15;
}

.play-button-circle {
  width: 80px;
  height: 80px;
  background: rgba(255, 107, 107, 0.9);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  transition: all 0.3s ease;
}

.play-button-circle:hover {
  background: rgba(255, 107, 107, 1);
  transform: scale(1.1);
}

.play-button-circle svg {
  width: 32px;
  height: 32px;
  margin-left: 4px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .controls-background {
    padding: 12px 8px 8px;
    gap: 8px;
  }
  
  .control-button {
    padding: 6px;
  }
  
  .control-button svg {
    width: 18px;
    height: 18px;
  }
  
  .time-display {
    font-size: 12px;
  }
  
  .play-button-circle {
    width: 60px;
    height: 60px;
  }
  
  .play-button-circle svg {
    width: 24px;
    height: 24px;
  }
}

/* 倍速弹窗样式 */
.rate-modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: flex-end;
  z-index: 30;
  animation: fadeIn 0.3s ease-out;
}

.rate-modal {
  background: linear-gradient(135deg, #1a1f4d 0%, #0f1332 100%);
  border-radius: 20px 20px 0 0;
  width: 100%;
  max-width: 500px;
  padding: 24px;
  animation: slideUp 0.3s ease-out;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.rate-modal-header {
  text-align: center;
  margin-bottom: 24px;
}

.rate-modal-header h3 {
  color: white;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.rate-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.rate-option {
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid transparent;
  border-radius: 15px;
  color: white;
  font-size: 16px;
  font-weight: 500;
  padding: 16px 0;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.rate-option:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(51, 202, 158, 0.5);
  transform: translateY(-2px);
}

.rate-option.active {
  background: #33CA9E;
  border-color: #33CA9E;
  color: white;
  box-shadow: 0 0 16px 4px rgba(51, 202, 158, 0.6);
}

.rate-button {
  color: white;
  font-size: 14px;
  font-weight: 500;
  min-width: 50px;
  text-align: center;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

/* 移动端响应式 */
@media (max-width: 768px) {
  .rate-modal {
    padding: 20px;
    border-radius: 16px 16px 0 0;
  }
  
  .rate-modal-header h3 {
    font-size: 16px;
  }
  
  .rate-options {
    gap: 12px;
  }
  
  .rate-option {
    padding: 14px 0;
    font-size: 14px;
    border-radius: 12px;
  }
}

/* 全屏模式样式 */
:fullscreen .m3u8-player-container {
  width: 100vw !important;
  height: 100vh !important;
  border-radius: 0;
}
</style>