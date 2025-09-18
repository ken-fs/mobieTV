<template>
  <div
    v-if="clientType === 'mobile'"
    @click="scrollToTop"
    class="w-[220px] mb-4 py-4 mx-auto hover:bg-slate-700/50 transition-all duration-200 active:bg-slate-600/50 rounded-2xl border border-slate-700/30"
    style="background-color: rgba(255, 255, 255, 0.12)"
  >
    <button class="w-full">
      <div class="flex items-center justify-center gap-2">
        <svg
          class="w-4 h-4 text-emerald-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 15l7-7 7 7"
          />
        </svg>
        <span class="text-emerald-400 text-sm font-medium whitespace-nowrap"
          >返回顶部</span
        >
      </div>
    </button>
  </div>
  <div
    v-else
    @click="scrollToTop"
    class="flex items-center mb-4 gap-2 px-4 py-2 mx-auto"
    style="width: fit-content"
  >
    <span class="text-white/70 text-sm font-medium whitespace-nowrap">按</span>
    <div
      class="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-slate-700/50 transition-all duration-200 active:bg-slate-600/50"
      style="background-color: rgba(255, 255, 255, 0.12)"
    >
      <svg
        class="w-4 h-4 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 19l-7-7 7-7"
        />
      </svg>
      <span class="text-white text-sm font-medium whitespace-nowrap">返回</span>
    </div>
    <span class="text-white/70 text-sm font-medium whitespace-nowrap"
      >快速回到顶部</span
    >
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

/**
 */
interface Props {
  threshold?: number;
  container?: string | HTMLElement;
}

/**
 */
interface EmitEvents {
  click: [];
  "visibility-change": [visible: boolean];
}

const props = withDefaults(defineProps<Props>(), {
  threshold: 400,
  container: undefined,
});

const clientType = ref<"mobile" | "desktop">("mobile");

const emit = defineEmits<EmitEvents>();

/**
 * @param element
 * @returns
 */
const getScrollTop = (element?: HTMLElement | Window): number => {
  if (!element) return 0;

  if (element === window) {
    return (
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0
    );
  }

  return (element as HTMLElement).scrollTop || 0;
};

/**
 * @param scrollTop
 * @returns
 */
const shouldShowButton = (scrollTop: number, threshold: number): boolean => {
  return scrollTop > threshold;
};

/**
 * @returns
 */
const getScrollContainer = (
  container?: string | HTMLElement
): HTMLElement | Window => {
  if (!container) return window;

  if (typeof container === "string") {
    const element = document.querySelector(container) as HTMLElement;
    return element || window;
  }

  // 处理 Vue ref 对象
  if (container && typeof container === "object" && "value" in container) {
    return (container as any).value || window;
  }

  return container;
};

const visible = ref(true);

let scrollContainer: HTMLElement | Window = window;

let throttleTimer: number | null = null;

const handleScroll = (): void => {
  if (throttleTimer) return;

  throttleTimer = window.setTimeout(() => {
    const scrollTop = getScrollTop(scrollContainer);
    const newVisible = shouldShowButton(scrollTop, props.threshold);

    if (visible.value !== newVisible) {
      visible.value = newVisible;
      emit("visibility-change", newVisible);
    }

    throttleTimer = null;
  }, 100);
};

const scrollToTop = (): void => {
  emit("click");

  // 确保获取到正确的滚动容器
  const currentContainer = getScrollContainer(props.container);

  const startTime = Date.now();
  const startScrollTop = getScrollTop(currentContainer);
  const duration = 400; // 滚动时间减半

  const animateScroll = (): void => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // 由慢变快的缓动函数 (easeInQuart)
    const easeInQuart = progress * progress * progress * progress;
    const scrollTop = startScrollTop * (1 - easeInQuart);

    if (currentContainer === window) {
      window.scrollTo(0, scrollTop);
    } else {
      (currentContainer as HTMLElement).scrollTop = scrollTop;
    }

    if (progress < 1) {
      requestAnimationFrame(animateScroll);
    }
  };

  requestAnimationFrame(animateScroll);
};

onMounted(() => {
  scrollContainer = getScrollContainer(props.container);

  scrollContainer.addEventListener("scroll", handleScroll, { passive: true });

  handleScroll();
});

onUnmounted(() => {
  if (throttleTimer) {
    clearTimeout(throttleTimer);
  }

  scrollContainer?.removeEventListener("scroll", handleScroll);
});
</script>

<style scoped>
.return-to-top {
  pointer-events: auto;
}

button {
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

@media (pointer: coarse) {
  button {
    touch-action: manipulation;
  }
}
</style>
