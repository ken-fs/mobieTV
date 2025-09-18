import { ref, onMounted, onUnmounted, Ref } from 'vue';

interface LazyImageOptions {
  rootMargin?: string;
  threshold?: number;
  fallbackSrc?: string;
}

export function useLazyImage(
  elementRef: Ref<HTMLElement | undefined>,
  imageSrc: string,
  options: LazyImageOptions = {}
) {
  const isLoaded = ref(false);
  const isInView = ref(false);
  const error = ref(false);
  const currentSrc = ref('');

  const {
    rootMargin = '50px',
    threshold = 0.1,
    fallbackSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjE2MCIgdmlld0JveD0iMCAwIDI4MCAxNjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyODAiIGhlaWdodD0iMTYwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0xMjAgODBMMTM2IDk2SDE2NEwxODAgODBMMTk2IDk2SDE2NEwyMDQgMTA0TDE5NiAxMTJIMTY0TDE0NCAxMjhIMTM2TDEyMCAxMTJMOTYgMTI4SDg0TDY4IDExMkw0OCAxMjhIMzZMMjAgMTEyTDAgMTI4SDEyVjk2TDI0IDgwTDM2IDk2SDQ4TDY4IDgwTDg0IDk2SDk2TDEyMCA4MFoiIGZpbGw9IiNERERERkYiLz4KPHBhdGggZD0iTTEwNCA4OEMxMDggODQgMTE2IDg0IDEyMCA4OEMxMjQgOTIgMTI0IDEwMCAxMjAgMTA0QzExNiAxMDggMTA4IDEwOCAxMDQgMTA0QzEwMCAxMDAgMTAwIDkyIDEwNCA4OFoiIGZpbGw9IiNDQ0NDQ0MiLz4KPHRleHQgeD0iMTQwIiB5PSIxMDAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSI+6K++56iL5Zu+54mHPC90ZXh0Pgo8L3N2Zz4='
  } = options;

  let observer: IntersectionObserver | null = null;

  const loadImage = async (src: string): Promise<void> => {
    if (!src) {
      currentSrc.value = fallbackSrc;
      return;
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        currentSrc.value = src;
        isLoaded.value = true;
        error.value = false;
        resolve();
      };
      img.onerror = () => {
        currentSrc.value = fallbackSrc;
        error.value = true;
        reject(new Error('Failed to load image'));
      };
      img.src = src;
    });
  };

  const handleIntersection = (entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    if (entry.isIntersecting) {
      isInView.value = true;
      loadImage(imageSrc).catch(() => {
        // 图片加载失败，已经设置了fallback
      });
      if (observer) {
        observer.unobserve(entry.target);
      }
    }
  };

  const startObserving = () => {
    if (elementRef.value) {
      observer = new IntersectionObserver(handleIntersection, {
        rootMargin,
        threshold
      });
      observer.observe(elementRef.value);
    }
  };

  const stopObserving = () => {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  };

  onMounted(() => {
    // 初始设置占位图
    currentSrc.value = fallbackSrc;

    // 检查是否支持 IntersectionObserver
    if ('IntersectionObserver' in window) {
      startObserving();
    } else {
      // 不支持的情况下直接加载
      isInView.value = true;
      loadImage(imageSrc).catch(() => {
        // 图片加载失败，已经设置了fallback
      });
    }
  });

  onUnmounted(() => {
    stopObserving();
  });

  return {
    isLoaded,
    isInView,
    error,
    currentSrc,
    loadImage,
    startObserving,
    stopObserving
  };
}