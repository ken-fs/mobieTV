<template>
  <div class="p-4 min-h-screen">
    <div class="search_root relative overflow-hidden" ref="search_root">
      <!-- 返回按钮 -->
      <button 
        class="back-button absolute mt-8 ml-10 z-10 w-20 h-20 flex items-center justify-center"
        @click="onBackPressed"
      >
        <van-icon name="arrow-left" size="30" class="back-icon" />
      </button>
      
      <!-- 背景渐变 -->
      <div class="search_root_bg absolute inset-0 bg-gradient-to-bl from-[#101855] to-[#060E2D]" />
      
      <!-- scroll-view -->
      <div ref="search_scroll_view" class="search_scroll_view relative w-full h-full bg-transparent">
        <div class="scroll_view_content h-full flex flex-row" :style="{ width: rootWidth }">
          <!-- 搜索键盘 -->
          <search-keyboard ref="search_keyboard" 
            @inputChange="onInputChange" @scroll-to-index="onNeedScrollTo" />
          <!-- 搜索内容 -->
          <search-center v-if="isShowCenterSearch" :visible="!loading && !showResultLoading" 
            ref="search_center" 
            @keyword-select="onKeywordSelect"
            @close-loading="closeLoading" 
            @start-loading="startLoadResultLoading" 
            :search-letter="searchLetter"
            @scroll-to-index="onNeedScrollTo" />
            
          <!-- 搜索结果 -->
          <!-- <search-result :visible="!loading && !showResultLoading" 
            ref="search_result" 
            :keyword="selectKeyword"
            :show-is-full-screen="scrollState === 1" 
            @scroll-to-index="onNeedScrollTo" 
            @close-loading="closeLoading" 
            @close-self-loading="closeResultLoading" /> -->
        </div>
        
      </div>
      
      <!-- 加载状态 - 使用新的Loading组件 -->
      <div v-if="showResultLoading" 
        class="search_start_loading absolute top-0 left-0 h-full w-full flex items-center justify-center bg-gradient-to-bl from-[#101855]/80 to-[#060E2D]/80"
      >
        <searchLoading visible="true" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, computed, defineComponent, onMounted, onUnmounted } from "vue";
import { useRouter } from 'vue-router';
import searchKeyboard from "../components/search/search-keyboard.vue";
import searchCenter from "../components/search/search-center.vue";
import searchLoading from "../components/loading/index.vue";
import SearchConfig from "../utils/search/SearchConfig"

export default defineComponent({
  name: "search",
  components: { searchKeyboard, searchCenter, searchLoading },
  props: {
    height: {
      type: String,
      default: "80px"
    }
  },
  setup(props) {
    const isShowCenterSearch = computed(() => SearchConfig.isShowCenterSearch)
    const rightLoadingWidth = computed(() => SearchConfig.rightLoading)
    const rootWidth = computed(() => SearchConfig.isShowCenterSearch ? 3073 : 2554)
    const loadingWidth = computed(() => (1920 - SearchConfig.leftWidth))
    const loadingLeft = computed(() => SearchConfig.leftWidth)
    const router = useRouter()
    const search_root = ref()
    const search_scroll_view = ref()
    const search_keyboard = ref()
    const search_center = ref()
    let selectKeyword = ref('')
    let searchLetter = ref('')
    let scrollState = ref(0)
    let showResultLoading = ref(true)
    let loading = ref(false)
    let curChildIndex = 0
    let delayHandleFocusChange: any = -1
    let selectKeyWordTimer: any = -1

    // 生命周期
    onMounted(() => {
      //无词条列表时，直接获取推荐列表
      if (!isShowCenterSearch.value) {
        showResultLoading.value = false
      }
      // 组件初始化时的其他逻辑
    })

    const onInputChange = (value: string) => {
      searchLetter.value = value
      if (selectKeyWordTimer) {
        clearTimeout(selectKeyWordTimer)
      }
      selectKeyWordTimer = setTimeout(() => {
        selectKeyword.value = ''
      }, 500)
    }

    const onKeywordSelect = (keyword: string, isFocus: boolean) => {
      if (selectKeyWordTimer) {
        clearTimeout(selectKeyWordTimer)
      }
      if (isFocus) {
        selectKeyWordTimer = setTimeout(() => {
          selectKeyword.value = keyword
        }, 300)
      } else {
        selectKeyword.value = keyword
      }
    }

    const startLoadResultLoading = () => {
      showResultLoading.value = true
    }

    const closeLoading = () => {
      showResultLoading.value = false
      // loading.value = false
    }

    // 删除与search-result相关的方法
    // const closeResultLoading = () => {
    //   showResultLoading.value = false
    // }

    const onNeedScrollTo = (index: number, delay: number) => {
      curChildIndex = index
      delayHandleFocusChange && clearTimeout(delayHandleFocusChange)
      delayHandleFocusChange = setTimeout(() => {
        if (index == 0 || index == 1) {
          if (scrollState.value == 0) return;
          scrollState.value = 0;
        }
        if (index == 2) {
          if (scrollState.value == 1) return;
          scrollState.value = 1;
        }
      }, delay)
    }

    //按键 返回
    const onBackPressed = () => {
      if (scrollState.value === 1) {
        onNeedScrollTo(0, 0)
        search_keyboard.value?.requestDefaultFocus();
        return
      } else {
        router.back()
      }
    }

    onUnmounted(() => {
      // 清理定时器和资源
      if (delayHandleFocusChange) {
        clearTimeout(delayHandleFocusChange)
      }
      if (selectKeyWordTimer) {
        clearTimeout(selectKeyWordTimer)
      }
    })

    return {
      search_root, search_scroll_view, scrollState,
      search_keyboard, onInputChange,
      search_center, onKeywordSelect, startLoadResultLoading,
      selectKeyword, searchLetter, isShowCenterSearch, rootWidth, loading, loadingWidth,
      loadingLeft, showResultLoading, rightLoadingWidth,
      onNeedScrollTo, onBackPressed, closeLoading
      // 删除返回值中的search-result相关内容
    }
  }
})
</script>

<style scoped>
/* 返回按钮样式 */
.back-button {
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  outline: none;
  color: white;
}

.back-button:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.back-button:active {
  transform: scale(0.95);
}

.back-icon {
  transition: transform 0.2s ease;
}

.back-button:hover .back-icon {
  transform: translateX(-2px);
}

/* 移除原来的loading-spinner样式，使用Loading组件自带样式 */
.loading-spinner {
  display: none;
}
</style>
