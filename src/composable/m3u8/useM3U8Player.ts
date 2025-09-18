import {
  ref,
  computed,
  onUnmounted,
  watch,
  type Ref,
  type ComputedRef,
} from "vue";
import { useRouter } from "vue-router";
import Hls, {
  type HlsConfig,
  type ErrorData,
  type Level,
  type ManifestParsedData,
  type LevelSwitchedData,
} from "hls.js";

/**
 * 播放器支持信息接口
 */
export interface HLSSupportInfo {
  supported: boolean;
  native: boolean;
  library: "hls.js" | "native" | "none";
}

/**
 * 质量等级接口
 */
export interface QualityLevel {
  index: number;
  name: string;
  width: number;
  height: number;
  bitrate: number;
}

/**
 * 播放器统计信息接口
 */
export interface PlayerStats {
  currentTime: number;
  duration: number;
  buffered: number;
  volume: number;
  muted: boolean;
  playbackRate: number;
  quality: number;
  isPlaying: boolean;
  isBuffering: boolean;
  hasError: boolean;
  hlsStats?: {
    currentLevel: number;
    autoLevelEnabled: boolean;
    loadLevel: number;
    nextLoadLevel: number;
  };
}

/**
 * M3U8播放器配置接口
 */
export interface M3U8PlayerOptions {
  maxRetries?: number;
  onError?: ((message: string) => void) | null;
  onPlay?: (() => void) | null;
  onPause?: (() => void) | null;
  onTimeUpdate?: ((time: number, duration: number) => void) | null;
  onQualityChange?: ((quality: number) => void) | null;
}

/**
 * 播放器返回接口
 */
export interface UseM3U8PlayerReturn {
  // 状态
  videoElement: Ref<HTMLVideoElement | null>;
  hls: Ref<Hls | null>;
  isLoading: Ref<boolean>;
  hasError: Ref<boolean>;
  errorMessage: Ref<string>;
  isPlaying: Ref<boolean>;
  currentTime: Ref<number>;
  duration: Ref<number>;
  volume: Ref<number>;
  isMuted: Ref<boolean>;
  playbackRate: Ref<number>;
  bufferedPercent: ComputedRef<number>;
  isBuffering: Ref<boolean>;
  qualityLevels: Ref<QualityLevel[]>;
  currentQuality: Ref<number>;
  isM3U8: ComputedRef<boolean>;

  // 方法
  initPlayer: (src: string, config?: Partial<HlsConfig>) => Promise<void>;
  play: () => Promise<void>;
  pause: () => void;
  togglePlayPause: () => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  seekTo: (time: number) => void;
  setPlaybackRate: (rate: number) => void;
  changeQuality: (qualityIndex: number) => void;
  retryPlay: () => Promise<void>;
  getStats: () => PlayerStats;
  destroy: () => void;

  // 检查支持
  checkHLSSupport: () => HLSSupportInfo;
}

/**
 * 扩展Window接口以支持Hls
 */
declare global {
  interface Window {
    Hls?: typeof Hls;
  }
}

/**
 * M3U8播放器相关的 Composable
 * 提供HLS视频播放、控制、状态管理等功能
 */
export function useM3U8Player(): UseM3U8PlayerReturn {
  const router = useRouter();
  // 响应式状态
  const videoElement = ref<HTMLVideoElement | null>(null);
  const hls = ref<Hls | null>(null);
  const isLoading = ref<boolean>(false);
  const hasError = ref<boolean>(false);
  const errorMessage = ref<string>("");
  const retryCount = ref<number>(0);
  const maxRetries = ref<number>(3);

  // 播放状态
  const isPlaying = ref<boolean>(false);
  const currentTime = ref<number>(0);
  const duration = ref<number>(0);
  const volume = ref<number>(1);
  const isMuted = ref<boolean>(false);
  const playbackRate = ref<number>(1);

  // 缓冲状态
  const isBuffering = ref<boolean>(false);

  // 质量等级
  const qualityLevels = ref<QualityLevel[]>([]);
  const currentQuality = ref<number>(-1);

  // 计算属性
  const bufferedPercent = computed<number>(() => {
    if (!videoElement.value || duration.value <= 0) return 0;

    const buffered = videoElement.value.buffered;
    if (buffered.length === 0) return 0;

    const currentPos = currentTime.value;
    let bufferedEnd = 0;

    for (let i = 0; i < buffered.length; i++) {
      if (buffered.start(i) <= currentPos && currentPos <= buffered.end(i)) {
        bufferedEnd = buffered.end(i);
        break;
      }
    }

    return (bufferedEnd / duration.value) * 100;
  });

  const isM3U8 = computed<boolean>(() => {
    return videoElement.value?.src?.includes?.(".m3u8") || false;
  });

  /**
   * 检查HLS支持
   */
  const checkHLSSupport = (): HLSSupportInfo => {
    // 首先检查导入的Hls.js
    if (Hls && Hls.isSupported()) {
      return {
        supported: true,
        native: false,
        library: "hls.js",
      };
    }

    // 检查原生HLS支持 (Safari)
    if (typeof document !== "undefined") {
      const video = document.createElement("video");
      const nativeSupport =
        video.canPlayType("application/vnd.apple.mpegurl") !== "" ||
        video.canPlayType("application/x-mpegURL") !== "";

      if (nativeSupport) {
        return {
          supported: true,
          native: true,
          library: "native",
        };
      }
    }

    // 最后检查全局window.Hls（作为兜底）
    if (
      typeof window !== "undefined" &&
      window.Hls &&
      window.Hls.isSupported()
    ) {
      return {
        supported: true,
        native: false,
        library: "hls.js",
      };
    }

    return {
      supported: false,
      native: false,
      library: "none",
    };
  };

  /**
   * 初始化播放器
   */
  const initPlayer = async (
    src: string,
    config: Partial<HlsConfig> = {}
  ): Promise<void> => {
    if (!videoElement.value || !src) return;

    try {
      isLoading.value = true;
      hasError.value = false;
      errorMessage.value = "";
      retryCount.value = 0;

      // 清理之前的HLS实例
      if (hls.value) {
        hls.value.destroy();
        hls.value = null;
      }

      const support = checkHLSSupport();

      if (src.includes(".m3u8")) {
        // M3U8文件处理
        console.log("HLS支持检测结果:", support);

        if (!support.supported) {
          // 提供详细的浏览器兼容性信息
          const userAgent = navigator.userAgent.toLowerCase();
          let recommendBrowser = "";

          if (userAgent.includes("chrome")) {
            recommendBrowser = "请确保Chrome版本在34或以上";
          } else if (userAgent.includes("firefox")) {
            recommendBrowser = "请确保Firefox版本在42或以上";
          } else if (userAgent.includes("safari")) {
            recommendBrowser = "Safari应原生支持HLS播放";
          } else if (userAgent.includes("edge")) {
            recommendBrowser = "请使用Edge 79或以上版本";
          } else {
            recommendBrowser = "推荐使用Chrome、Firefox、Safari或Edge浏览器";
          }

          throw new Error(`当前浏览器不支持HLS播放。${recommendBrowser}`);
        }

        if (support.library === "hls.js") {
          console.log("使用HLS.js播放器");
          await initHLSPlayer(src, config);
        } else if (support.native) {
          console.log("使用原生HLS播放");
          await initNativePlayer(src);
        } else {
          throw new Error("HLS播放器初始化失败");
        }
      } else {
        // 普通视频文件
        await initNativePlayer(src);
      }

      setupVideoEvents();
      isLoading.value = false;
    } catch (error) {
      console.error("播放器初始化失败:", error);
      handleError((error as Error).message || "播放器初始化失败");
    }
  };

  /**
   * 检测移动设备
   */
  const isMobile = (): boolean => {
    return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  };

  /**
   * 初始化HLS.js播放器
   */
  const initHLSPlayer = async (
    src: string,
    config: Partial<HlsConfig>
  ): Promise<void> => {
    // 根据设备类型调整默认配置
    const mobile = isMobile();
    const defaultConfig: Partial<HlsConfig> = {
      enableWorker: !mobile, // 移动设备禁用Worker避免兼容性问题
      lowLatencyMode: !mobile, // 移动设备禁用低延迟模式
      backBufferLength: mobile ? 30 : 90,
      maxBufferLength: mobile ? 15 : 30,
      maxMaxBufferLength: mobile ? 300 : 600,
      maxBufferSize: mobile ? 30 * 1000 * 1000 : 60 * 1000 * 1000, // 移动设备30MB，桌面60MB
      maxBufferHole: 0.5,
      highBufferWatchdogPeriod: mobile ? 3 : 2,
      nudgeOffset: 0.1,
      nudgeMaxRetry: 3,
      maxFragLookUpTolerance: 0.25,
      liveSyncDurationCount: mobile ? 2 : 3,
      liveMaxLatencyDurationCount: mobile ? 5 : 10,
      liveDurationInfinity: false,
      enableSoftwareAES: true,
      manifestLoadingTimeOut: mobile ? 15000 : 10000,
      manifestLoadingMaxRetry: mobile ? 2 : 1,
      manifestLoadingRetryDelay: 1000,
      levelLoadingTimeOut: mobile ? 15000 : 10000,
      levelLoadingMaxRetry: mobile ? 3 : 4,
      levelLoadingRetryDelay: mobile ? 2000 : 1000,
      fragLoadingTimeOut: mobile ? 25000 : 20000,
      fragLoadingMaxRetry: mobile ? 4 : 6,
      fragLoadingRetryDelay: mobile ? 2000 : 1000,
      startFragPrefetch: false,
      fpsDroppedMonitoringPeriod: 5000,
      fpsDroppedMonitoringThreshold: 0.2,
      appendErrorMaxRetry: 3,
      debug: false,
      // CORS相关配置
      xhrSetup: function (xhr: XMLHttpRequest): void {
        // 设置跨域请求
        xhr.withCredentials = false;
      },
      fetchSetup: function (
        context: { url: string },
        initParams: RequestInit
      ): Request {
        // 设置fetch请求参数
        return new Request(context.url, {
          ...initParams,
          mode: "cors",
          credentials: "omit",
          headers: {
            ...initParams.headers,
            "User-Agent": navigator.userAgent,
          },
        });
      },
      ...config,
    };

    console.log(
      `设备类型: ${mobile ? "移动设备" : "桌面设备"}, HLS配置:`,
      defaultConfig
    );

    hls.value = new Hls(defaultConfig);

    // 绑定HLS事件
    setupHLSEvents();

    // 加载源
    hls.value.loadSource(src);
    hls.value.attachMedia(videoElement.value!);
  };

  /**
   * 初始化原生播放器
   */
  const initNativePlayer = async (src: string): Promise<void> => {
    if (!videoElement.value) return;
    videoElement.value.src = src;
    videoElement.value.load();
  };

  /**
   * 设置HLS事件监听
   */
  const setupHLSEvents = (): void => {
    if (!hls.value) return;

    const HlsEvents = Hls.Events;
    const HlsErrorTypes = Hls.ErrorTypes;

    // 清单解析完成
    hls.value.on(
      HlsEvents.MANIFEST_PARSED,
      (_event: string, data: ManifestParsedData) => {
        console.log("HLS清单解析完成", data);

        // 设置质量等级
        if (data.levels && data.levels.length > 1) {
          qualityLevels.value = data.levels.map(
            (level: Level, index: number): QualityLevel => ({
              index,
              name: getQualityName(level),
              width: level.width,
              height: level.height,
              bitrate: level.bitrate,
            })
          );

          // 添加自动选择选项
          qualityLevels.value.unshift({
            index: -1,
            name: "自动",
            width: 0,
            height: 0,
            bitrate: 0,
          });

          currentQuality.value = -1; // 默认自动选择
        }
      }
    );

    // 片段加载开始
    hls.value.on(HlsEvents.FRAG_LOADING, () => {
      isBuffering.value = true;
    });

    // 片段加载完成
    hls.value.on(HlsEvents.FRAG_LOADED, () => {
      isBuffering.value = false;
    });

    // 等级切换
    hls.value.on(
      HlsEvents.LEVEL_SWITCHED,
      (_event: string, data: LevelSwitchedData) => {
        console.log("清晰度切换到:", data.level);
        if (currentQuality.value === -1) {
          // 自动模式下更新当前质量显示
          const currentLevel = qualityLevels.value.find(
            (q) => q.index === data.level
          );
          if (currentLevel) {
            console.log(`自动选择清晰度: ${currentLevel.name}`);
          }
        }
      }
    );

    // 错误处理
    hls.value.on(HlsEvents.ERROR, (_event: string, data: ErrorData) => {
      console.error("HLS错误:", data);

      if (data.fatal) {
        switch (data.type) {
          case HlsErrorTypes.NETWORK_ERROR:
            handleNetworkError(data);
            break;
          case HlsErrorTypes.MEDIA_ERROR:
            handleMediaError(data);
            break;
          default:
            handleFatalError(data);
            break;
        }
      } else {
        console.warn("HLS非致命错误:", data);
      }
    });
  };

  /**
   * 设置视频元素事件监听
   */
  const setupVideoEvents = (): void => {
    if (!videoElement.value) return;

    const video = videoElement.value;

    // 基础事件
    video.addEventListener("play", () => {
      isPlaying.value = true;
    });

    video.addEventListener("pause", () => {
      isPlaying.value = false;
    });

    video.addEventListener("timeupdate", () => {
      currentTime.value = video.currentTime;
    });

    video.addEventListener("durationchange", () => {
      duration.value = video.duration;
    });

    video.addEventListener("volumechange", () => {
      volume.value = video.volume;
      isMuted.value = video.muted;
    });

    video.addEventListener("ratechange", () => {
      playbackRate.value = video.playbackRate;
    });

    video.addEventListener("waiting", () => {
      isBuffering.value = true;
    });

    video.addEventListener("playing", () => {
      isBuffering.value = false;
    });

    video.addEventListener("error", () => {
      const error = video.error;
      let message = "播放出现错误";

      if (error) {
        switch (error.code) {
          case 1:
            message = "视频加载被终止";
            break;
          case 2:
            message = "网络错误导致视频下载失败";
            break;
          case 3:
            message = "视频解码失败";
            break;
          case 4:
            message = "视频格式不支持";
            break;
          default:
            message = "未知播放错误";
        }
      }

      handleError(message);
    });
  };

  /**
   * 获取清晰度名称
   */
  const getQualityName = (level: Level): string => {
    const height = level.height;
    if (height >= 2160) return "4K";
    if (height >= 1080) return "1080P";
    if (height >= 720) return "720P";
    if (height >= 480) return "480P";
    if (height >= 360) return "360P";
    return `${height}P`;
  };

  /**
   * 处理网络错误
   */
  const handleNetworkError = async (data: ErrorData): Promise<void> => {
    console.error("网络错误:", data);

    // 根据错误类型提供不同的处理方式
    let errorMsg = "网络连接失败";
    let canRetry = true;

    switch (data.details) {
      case "manifestLoadError":
        errorMsg = "M3U8清单文件加载失败，可能是网络问题或文件不存在";
        break;
      case "manifestLoadTimeOut":
        errorMsg = "M3U8清单文件加载超时，网络连接较慢";
        break;
      case "manifestParsingError":
        errorMsg = "M3U8清单文件格式错误";
        canRetry = false;
        break;
      case "levelLoadError":
        errorMsg = "视频分辨率加载失败";
        break;
      case "levelLoadTimeOut":
        errorMsg = "视频分辨率加载超时";
        break;
      case "fragLoadError":
        errorMsg = "视频片段加载失败，可能是CORS跨域问题";
        break;
      case "fragLoadTimeOut":
        errorMsg = "视频片段加载超时";
        break;
      case "keyLoadError":
        errorMsg = "加密密钥加载失败";
        break;
      case "keyLoadTimeOut":
        errorMsg = "加密密钥加载超时";
        break;
      default:
        errorMsg = `网络错误: ${data.details || "未知错误"}`;
    }

    if (canRetry && retryCount.value < maxRetries.value) {
      console.log(
        `尝试恢复网络错误 (${retryCount.value + 1}/${
          maxRetries.value
        }): ${errorMsg}`
      );
      retryCount.value++;

      // 使用指数退避算法，增加重试间隔
      const retryDelay = Math.min(
        1000 * Math.pow(2, retryCount.value - 1),
        10000
      );

      setTimeout(async () => {
        try {
          if (hls.value) {
            // 尝试重新开始加载
            hls.value.startLoad();

            // 如果是清单加载错误，尝试重新加载源
            if (
              data.details === "manifestLoadError" ||
              data.details === "manifestLoadTimeOut"
            ) {
              const currentSrc =
                videoElement.value?.src ||
                videoElement.value?.getAttribute("src");
              if (currentSrc) {
                hls.value.loadSource(currentSrc);
              }
            }
          }
        } catch (error) {
          console.error("网络错误恢复失败:", error);
          handleError(`${errorMsg}，恢复失败`);
        }
      }, retryDelay);
    } else {
      handleError(`${errorMsg}，请检查网络连接或视频源`);
    }
  };

  /**
   * 处理媒体错误
   */
  const handleMediaError = async (data: ErrorData): Promise<void> => {
    console.error("媒体错误:", data);

    if (retryCount.value < maxRetries.value) {
      console.log(
        `尝试恢复媒体错误 (${retryCount.value + 1}/${maxRetries.value})`
      );
      retryCount.value++;

      try {
        hls.value?.recoverMediaError();
      } catch (error) {
        console.error("媒体恢复失败:", error);
        handleError("媒体解码错误");
      }
    } else {
      handleError("媒体播放错误，请重试");
    }
  };

  /**
   * 处理致命错误
   */
  const handleFatalError = (data: ErrorData): void => {
    console.error("致命错误:", data);
    let message = "播放出现严重错误";

    switch (data.details) {
      case "manifestLoadError":
        message = "视频清单加载失败";
        break;
      case "manifestParsingError":
        message = "视频清单解析失败";
        break;
      case "levelLoadError":
        message = "视频片段加载失败";
        break;
      case "fragLoadError":
        message = "视频数据加载失败";
        break;
      default:
        message = data.reason || "播放器内部错误";
    }

    handleError(message);
  };

  /**
   * 通用错误处理
   */
  const handleError = (message: string): void => {
    isLoading.value = false;
    hasError.value = true;
    errorMessage.value = message;
    console.error("播放器错误:", message);
    
    // 网络相关错误跳转到网络错误页面
    const isNetworkError = message.includes("网络") || 
                          message.includes("连接") || 
                          message.includes("加载失败") ||
                          message.includes("超时") ||
                          message.includes("下载失败");
    
    if (isNetworkError) {
      console.log("检测到网络错误，跳转到网络错误页面");
      router.push({
        name: "networkError",
        query: {
          error: encodeURIComponent(message),
          returnUrl: encodeURIComponent(router.currentRoute.value.fullPath)
        }
      });
    }
  };

  // 播放控制方法
  const play = async (): Promise<void> => {
    if (!videoElement.value) return;

    try {
      await videoElement.value.play();
    } catch (error) {
      console.error("播放失败:", error);
      handleError("播放失败，请重试");
    }
  };

  const pause = (): void => {
    if (!videoElement.value) return;
    videoElement.value.pause();
  };

  const togglePlayPause = (): void => {
    if (isPlaying.value) {
      pause();
    } else {
      play();
    }
  };

  const setVolume = (vol: number): void => {
    if (!videoElement.value) return;
    videoElement.value.volume = Math.max(0, Math.min(1, vol));
  };

  const toggleMute = (): void => {
    if (!videoElement.value) return;
    videoElement.value.muted = !videoElement.value.muted;
  };

  const seekTo = (time: number): void => {
    if (!videoElement.value || duration.value <= 0) return;
    videoElement.value.currentTime = Math.max(
      0,
      Math.min(time, duration.value)
    );
  };

  const setPlaybackRate = (rate: number): void => {
    if (!videoElement.value) return;
    videoElement.value.playbackRate = rate;
  };

  /**
   * 切换清晰度
   */
  const changeQuality = (qualityIndex: number): void => {
    if (!hls.value || qualityIndex === currentQuality.value) return;

    currentQuality.value = qualityIndex;

    if (qualityIndex === -1) {
      // 自动选择
      hls.value.currentLevel = -1;
    } else {
      // 手动选择
      hls.value.currentLevel = qualityIndex;
    }

    console.log(
      "清晰度切换到:",
      qualityIndex === -1 ? "自动" : qualityLevels.value[qualityIndex + 1]?.name
    );
  };

  /**
   * 尝试不同的播放方式（降级处理）
   */
  const tryDifferentPlayback = async (src: string): Promise<boolean> => {
    const support = checkHLSSupport();
    console.log("尝试降级播放，当前支持:", support);

    try {
      if (support.native && support.library !== "hls.js") {
        // 如果之前使用HLS.js失败，尝试原生播放
        console.log("尝试原生HLS播放");
        await initNativePlayer(src);
        return true;
      } else if (support.library === "hls.js" && !support.native) {
        // 如果之前原生播放失败，尝试HLS.js
        console.log("尝试HLS.js播放");
        await initHLSPlayer(src, {});
        return true;
      }
    } catch (error) {
      console.error("降级播放也失败了:", error);
    }

    return false;
  };

  /**
   * 重试播放
   */
  const retryPlay = async (): Promise<void> => {
    hasError.value = false;
    errorMessage.value = "";
    const currentSrc =
      videoElement.value?.src || videoElement.value?.getAttribute("src");

    if (!currentSrc) {
      handleError("没有可播放的视频源");
      return;
    }

    // 首先尝试原来的方式
    retryCount.value = 0;
    try {
      await initPlayer(currentSrc);
    } catch (error) {
      console.error("常规重试失败:", error);

      // 如果是M3U8文件，尝试降级播放
      if (currentSrc.includes(".m3u8")) {
        const success = await tryDifferentPlayback(currentSrc);
        if (!success) {
          handleError("所有播放方式都失败了，请检查视频源或网络连接");
        }
      } else {
        handleError("播放重试失败");
      }
    }
  };

  /**
   * 获取播放统计信息
   */
  const getStats = (): PlayerStats => {
    const stats: PlayerStats = {
      currentTime: currentTime.value,
      duration: duration.value,
      buffered: bufferedPercent.value,
      volume: volume.value,
      muted: isMuted.value,
      playbackRate: playbackRate.value,
      quality: currentQuality.value,
      isPlaying: isPlaying.value,
      isBuffering: isBuffering.value,
      hasError: hasError.value,
    };

    if (hls.value) {
      stats.hlsStats = {
        currentLevel: hls.value.currentLevel,
        autoLevelEnabled: hls.value.currentLevel === -1,
        loadLevel: hls.value.loadLevel,
        nextLoadLevel: hls.value.nextLoadLevel,
      };
    }

    return stats;
  };

  /**
   * 销毁播放器
   */
  const destroy = (): void => {
    if (hls.value) {
      hls.value.destroy();
      hls.value = null;
    }

    // 清理状态
    isLoading.value = false;
    hasError.value = false;
    errorMessage.value = "";
    isPlaying.value = false;
    currentTime.value = 0;
    duration.value = 0;
    qualityLevels.value = [];
    currentQuality.value = -1;
  };

  // 组件卸载时清理
  onUnmounted(() => {
    destroy();
  });

  return {
    // 状态
    videoElement,
    hls,
    isLoading,
    hasError,
    errorMessage,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    playbackRate,
    bufferedPercent,
    isBuffering,
    qualityLevels,
    currentQuality,
    isM3U8,

    // 方法
    initPlayer,
    play,
    pause,
    togglePlayPause,
    setVolume,
    toggleMute,
    seekTo,
    setPlaybackRate,
    changeQuality,
    retryPlay,
    getStats,
    destroy,

    // 检查支持
    checkHLSSupport,
  };
}

/**
 * 创建专门的M3U8播放器实例
 */
export function createM3U8Player(
  options: M3U8PlayerOptions = {}
): UseM3U8PlayerReturn {
  const {
    maxRetries = 3,
    onError = null,
    onPlay = null,
    onPause = null,
    onTimeUpdate = null,
    onQualityChange = null,
  } = options;

  const player = useM3U8Player();

  // 设置重试配置
  // Note: maxRetries is not directly exposed in the return interface

  // 添加事件回调
  if (onError) {
    watch(player.hasError, (hasError: boolean) => {
      if (hasError) onError(player.errorMessage.value);
    });
  }

  if (onPlay) {
    watch(player.isPlaying, (playing: boolean) => {
      if (playing) onPlay();
    });
  }

  if (onPause) {
    watch(player.isPlaying, (playing: boolean) => {
      if (!playing) onPause();
    });
  }

  if (onTimeUpdate) {
    watch(player.currentTime, (time: number) => {
      onTimeUpdate(time, player.duration.value);
    });
  }

  if (onQualityChange) {
    watch(player.currentQuality, (quality: number) => {
      onQualityChange(quality);
    });
  }

  return player;
}
