<template>
  <div class="search_result h-screen flex flex-col bg-transparent" ref="search_result" @childFocus="childFocus">
    <div class="search_result_title_root_top flex flex-row items-center absolute left-[69px] top-[94px] z-[666]" 
         v-show="(keyword || recommendTitle) && isShowTopTip">
      <img v-if="showIsFullScreen" :src="ic_search_left_arrow" class="ic_search_left_arrow w-[22px] h-[38px] absolute left-[-10px] top-[10px]" />
      <span class="search_result_view_title_result ml-[24px] h-[50px] text-[40px] text-white" 
            v-if="keyword">{{ `全部 "${keyword}" 结果 ` }}</span>
      <span class="search_result_view_title_result ml-[24px] h-[50px] text-[40px] text-white" 
            v-else-if="recommendTitle">{{ recommendTitle }}</span>
    </div>

    <div class="qt_tabs_css absolute h-full bg-transparent">
      <!-- 自定义tab导航 -->
      <!-- <div class="qt_tabs_waterfall_tab_css w-full h-[80px] bg-transparent mt-[155px] z-[100] clip-children:false">
        <div v-for="(tab, index) in tabs" :key="index"
          :class="['waterfall_nav_item h-[60px] px-[24px] bg-transparent rounded-[30px] flex flex-col justify-center items-center', 
                  { 'focus-background-color:#ffffff': activeTabIndex === index }]"
          @click="onTabClick(tab, index)"
          @focus="onTabFocus(index)"
          tabindex="0">
          <span class="waterfall_nav_item_text h-[70px] text-white/70">
            {{ tab.text }}
          </span>
        </div>
      </div> -->

      <!-- 内容区域 -->
      <div class="qt_tabs_waterfall_css absolute mt-0 w-full h-full bg-transparent clip-children:false">
        <!-- 这里应该是瀑布流内容，简化为基本的内容展示 -->
        <div v-for="(tab, tabIndex) in tabs" :key="tabIndex" v-show="activeTabIndex === tabIndex"
          class="tab-content">
          <!-- 实际项目中这里应该是相应tab的数据 -->
          <div v-if="isHasData" class="empty_view absolute w-[1920px] h-[1080px] pt-[130px] flex flex-col justify-center items-center">
            <img :src="ic_data_empty" class="empty_view_image w-[560px] h-[350px]" />
            <span class="empty_view_text text-white/50 mt-[26px]">没有更多内容了</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, computed, defineComponent, onMounted, watch } from "vue"
import SearchConfig from "@/utils/search/SearchConfig"

// 使用 import 导入图片资源
import ic_search_left_arrow from "@/assets/images/search/ic_search_left_arrow.png"
import ic_data_empty from "@/assets/images/search/ic_data_empty.png"

export default defineComponent({
  name: "search_result",
  props: {
    keyword: {
      type: String,
      default: ""
    },
    showIsFullScreen: {
      type: Boolean,
      default: false
    },
    visible: {
      type: Boolean,
      default: false
    },
    descendantFocusability: {
      type: Number,
      default: 1
    }
  },
  emits: ["close-loading", "close-self-loading", "scroll-to-index"],
  setup(props, context) {
    const search_result = ref()
    // 移除 const 声明，直接使用导入的变量
    const isShowTopTip = ref(true)
    const recommendTitle = ref("")
    const isHasData = ref(false)
    const activeTabIndex = ref(0)
    
    // 模拟标签数据
    const tabs = [
      { id: 'all', text: '全部' },
      { id: 'movie', text: '电影' },
      { id: 'tv', text: '电视剧' },
      { id: 'variety', text: '综艺' },
      { id: 'anime', text: '动漫' }
    ]

    onMounted(() => {
      initTab()
    })

    const initTab = () => {
      // 初始化标签相关逻辑
    }

    const childFocus = (e) => {
      // 子元素获取焦点时的处理
    }

    const onTabClick = (tab, index) => {
      activeTabIndex.value = index
      // 处理标签点击事件
    }

    const onTabFocus = (index) => {
      activeTabIndex.value = index
    }

    // 其他事件处理方法
    const onTabPageChanged = () => {}
    const onTabMoveToTopStart = () => {}
    const onTabMoveToTopEnd = () => {}
    const onTabMoveToBottomStart = () => {}
    const onTabMoveToBottomEnd = () => {}
    const onTabPageScrollToEnd = () => {}
    const onTabPageScrollToStart = () => {}
    const onTabPageItemClick = () => {}
    const onTabPageItemFocused = () => {}
    const onTabPageLoadData = () => {}
    const onTabPageScroll = () => {}
    const onTabPageSectionAttached = () => {}

    // 触发任务
    const triggerTask = (taskId: string, params: any) => {
      // 处理各种任务
    }

    return {
      search_result,
      ic_search_left_arrow,
      ic_data_empty,
      isShowTopTip,
      recommendTitle,
      isHasData,
      tabs,
      activeTabIndex,
      childFocus,
      triggerTask,
      onTabClick,
      onTabPageChanged,
      onTabMoveToTopStart,
      onTabMoveToTopEnd,
      onTabMoveToBottomStart,
      onTabMoveToBottomEnd,
      onTabPageScrollToEnd,
      onTabPageScrollToStart,
      onTabPageItemClick,
      onTabPageItemFocused,
      onTabPageLoadData,
      onTabPageScroll,
      onTabPageSectionAttached,
      initTab
    }
  }
})
</script>

<style scoped>
/* 移除外部CSS文件引用，使用Tailwind类 */
.waterfall_nav_item_text {
  color: rgba(255,255,255,0.7);
  select-color:#FF4e46;
  focus-color:black;
}
</style>
