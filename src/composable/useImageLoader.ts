import { ref, computed } from 'vue';

// 默认图片的base64编码（1x1透明像素）
const DEFAULT_IMAGE_BASE64 = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjE2MCIgdmlld0JveD0iMCAwIDI4MCAxNjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyODAiIGhlaWdodD0iMTYwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0xMjAgODBMMTM2IDk2SDE2NEwxODAgODBMMTk2IDk2SDE2NEwyMDQgMTA0TDE5NiAxMTJIMTY0TDE0NCAxMjhIMTM2TDEyMCAxMTJMOTYgMTI4SDg0TDY4IDExMkw0OCAxMjhIMzZMMjAgMTEyTDAgMTI4SDEyVjk2TDI0IDgwTDM2IDk2SDQ4TDY4IDgwTDg0IDk2SDk2TDEyMCA4MFoiIGZpbGw9IiNERERERkYiLz4KPHBhdGggZD0iTTEwNCA4OEMxMDggODQgMTE2IDg0IDEyMCA4OEMxMjQgOTIgMTI0IDEwMCAxMjAgMTA0QzExNiAxMDggMTA4IDEwOCAxMDQgMTA0QzEwMCAxMDAgMTAwIDkyIDEwNCA4OFoiIGZpbGw9IiNDQ0NDQ0MiLz4KPHRleHQgeD0iMTQwIiB5PSIxMDAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSI+6K++56iL5Zu+54mHPC90ZXh0Pgo8L3N2Zz4=';

interface ImageState {
  loading: boolean;
  error: boolean;
  src: string;
  loadAttempts: number;
}

const imageCache = new Map<string, string>();
const failedImages = new Set<string>();

export function useImageLoader() {
  const defaultImage = ref(DEFAULT_IMAGE_BASE64);

  // 创建图片加载状态
  const createImageState = (src: string): ImageState => ({
    loading: true,
    error: false,
    src: src || defaultImage.value,
    loadAttempts: 0,
  });

  // 预加载图片
  const preloadImage = (src: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!src || failedImages.has(src)) {
        reject(new Error('Invalid or previously failed image'));
        return;
      }

      if (imageCache.has(src)) {
        resolve(imageCache.get(src)!);
        return;
      }

      const img = new Image();
      img.onload = () => {
        imageCache.set(src, src);
        resolve(src);
      };
      img.onerror = () => {
        failedImages.add(src);
        reject(new Error('Failed to load image'));
      };
      img.src = src;
    });
  };

  // 获取安全的图片URL
  const getSafeImageSrc = async (
    primarySrc?: string,
    fallbackSrc?: string,
    maxAttempts: number = 2
  ): Promise<string> => {
    const sources = [primarySrc, fallbackSrc].filter(Boolean) as string[];

    for (const src of sources) {
      try {
        await preloadImage(src);
        return src;
      } catch {
        continue;
      }
    }

    return defaultImage.value;
  };

  // 获取课程图片路径
  const getCourseImageSrc = (course: any): string => {
    return course?.cover_image || course?.thumbnail || defaultImage.value;
  };

  // 处理图片加载错误
  const handleImageError = (event: Event, state: ImageState) => {
    const img = event.target as HTMLImageElement;
    state.loadAttempts++;

    if (state.loadAttempts < 3) {
      // 重试加载
      setTimeout(() => {
        img.src = state.src;
      }, 1000 * state.loadAttempts);
    } else {
      // 使用默认图片
      state.error = true;
      state.loading = false;
      img.src = defaultImage.value;
      failedImages.add(state.src);
    }
  };

  // 处理图片加载成功
  const handleImageLoad = (state: ImageState) => {
    state.loading = false;
    state.error = false;
  };

  // 清理缓存
  const clearCache = () => {
    imageCache.clear();
    failedImages.clear();
  };

  return {
    defaultImage: computed(() => defaultImage.value),
    createImageState,
    preloadImage,
    getSafeImageSrc,
    getCourseImageSrc,
    handleImageError,
    handleImageLoad,
    clearCache,
    imageCache,
    failedImages,
  };
}