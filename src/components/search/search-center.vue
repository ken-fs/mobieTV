<template>
  <div class="search_center" ref="search_center" @childFocus="childFocus">
    <!-- 垂直竖线-->
    <div class="search_center_view_line" />
    <!--顶部提示-->
    <div class="search_center_view_top">
      <!-- 当type为3（猜你想搜）时显示标签切换，其他情况显示原标题 -->
      <div v-if="title === '猜你想搜'" class="search-tabs">
        <div 
          :class="['search-tab', { 'active': activeTab === 'courses' }]" 
          @click="switchTab('courses')"
        >
          课程({{ courseCount }})
        </div>
        <div 
          :class="['search-tab', { 'active': activeTab === 'teachers' }]" 
          @click="switchTab('teachers')"
        >
          教师({{ teacherCount }})
        </div>
      </div>
      <span v-else class="search_center_view_title">{{ title }}</span>
      
      <!-- <search-btn v-if="title === '搜索历史'" @click="clearHistoryBtnClick"
        searchBtnClass="search_center_clear_history_btn"
        :icon-width="22" :icon-height="27" :icon-normal="ic_search_input_clear"
        :icon-focus="ic_search_input_clear_focus" search-txt-class="btn_clear_text" :font-size="26" text="清空" /> -->
    </div>
    <!-- 搜索词条列表-->
    <div class="search_center_view_list" name="search_center_view_list"
      ref="search_center_view_list">
      <!-- 无词条提示-->
      <div v-if="title === ''" class="empty_text_box">
        <img :src="ic_data_empty" class="w-[214px] h-[220px]">
        <span class="empty_text">没有找到相关结果，请尝试其他关键词</span>
      </div>

      <!-- 词条列表 - 热门课程使用图片展示 -->
      <div v-else-if="title === '热门课程'" class="course-grid">
        <div v-for="(course, index) in listDataRec" :key="index"
          :class="['course-item', { 'focused': currentItemIndex === index }]"
          @click="onCourseClick(course, index)"
          tabindex="0">
          <img :src="course.image" :alt="course.title" class="course-image">
        </div>
      </div>

      <!-- 普通词条列表 - 根据标签类型显示不同布局 -->
      <div v-else>
        <!-- 课程标签布局 -->
        <div v-if="activeTab === 'courses'" class="course-grid">
          <div v-for="(item, index) in filteredItems" :key="index"
            :class="['course-item', { 'focused': currentItemIndex === index }]"
            @click="handleItemClick(item, index)"
            tabindex="0">
            <img :src="item.image" :alt="item.title || item.name" class="course-image">
          </div>
        </div>
        
        <!-- 教师标签布局 -->
        <div v-else-if="activeTab === 'teachers'" class="teachers-list">
          <div v-for="(item, index) in filteredItems" :key="index"
            :class="['teacher-item', { 'focused': currentItemIndex === index }]"
            @click="handleItemClick(item, index)"
            tabindex="0">
            <!-- 第一行：头像和基本信息 -->
            <div class="teacher-item-top">
              <div class="teacher-avatar-container">
                <img :src="item.image" :alt="item.title || item.name" class="teacher-avatar">
              </div>
              <div class="teacher-info">
                <h3 class="teacher-name">{{ item.title || item.name }}</h3>
                <p class="teacher-personality-label">{{ item.personality_label || '' }}</p>
              </div>
            </div>
            <!-- 第二行：详细描述，与头像左对齐 -->
            <div class="teacher-description">{{ item.description || '暂无简介' }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { nextTick, onMounted, ref, watch, computed, defineComponent } from "vue"
import SearchBtn from "./search-btn.vue"
import SearchConfig from "@/utils/search/SearchConfig"
import ic_search_input_clear from "@/assets/images/search/ic_search_input_clear.png"
import ic_search_input_clear_focus from "@/assets/images/search/ic_search_input_clear_focus.png"
import ic_data_empty from "@/assets/images/search/ic_data_empty.png"
import { apiService } from "@/http/api"; // 确保导入了 apiService
// 导入学习相关的 store
import { useLearningStore } from "@/stores/learning"
import { useAuthStore } from "@/stores/auth";
import teacher_default_head_small from "@/assets/images/common/teacher_default_head_small.png"

export default defineComponent({
  name: "search_center",
  components: { SearchBtn },
  emits: ["keyword-select", "scroll-to-index", "close-loading", 'start-loading'],
  props: {
    searchLetter: {
      type: String,
      default: ""
    },
    resultItemSid: {
      type: String,
      default: ""
    },
    defaultItemSid: {
      type: String,
      default: ""
    }
  },
  setup(props, context) {
    const centerWidth = computed(() => SearchConfig.centerWidth)


    const search_center = ref()
    const title = ref("热门课程")
    const targetSid = ref()
    
    // 获取学习 store 实例
    const learningStore = useLearningStore()
    const authStore = useAuthStore();

    let curTitleType = 1
    let currentItemIndex: number = -1
    const listDataRec = ref<Array<any>>([]) // 修改为响应式变量
    let pageNum = 1
    let isStopPage = false
    let curValue = ""
    let curKeyWorkValue = ""

    
    // 新增：标签相关状态
    const activeTab = ref('courses') // 默认选中课程标签
    const courseCount = ref(30)      // 课程数量，可根据实际数据动态更新
    const teacherCount = ref(10)     // 教师数量，可根据实际数据动态更新
    
    // 新增：教师数据（假设从API获取）
    const teacherDataRec = ref<Array<any>>([])
    // 获取列表容器的引用
    const search_center_view_list = ref()

    // 计算属性：根据当前选中的标签筛选显示的内容
    const filteredItems = computed(() => {
      if (activeTab.value === 'courses') {
        return listDataRec.value
      } else {
        return teacherDataRec.value
      }
    })

    watch(() => props.searchLetter, async (newVal) => {
      initParams()
      await setListData(newVal ?? "", newVal ? 3 : 1)
      setListSelect(false)
      context.emit("close-loading")
    })
    
    watch(() => props.resultItemSid, (newVal) => {
      targetSid.value = newVal
    })
    
    watch(() => props.defaultItemSid, (newVal) => {
      targetSid.value = newVal
    })

    onMounted(() => {
      nextTick(async () => {
        await setListData("", 1)
      })
    })

    const initParams = () => {
      pageNum = 1
      isStopPage = false
      listDataRec.value = [] // 修改为响应式访问
      teacherDataRec.value = [] // 清空教师数据
      curValue = ""
      activeTab.value = 'courses' // 重置为默认选中课程标签
    }

    // 设置列表数据 - 修改为调用真实 API
    const setListData = async (value: string, type: number) => {
      curKeyWorkValue = value
      setTitle(type)
      
      // 显示加载状态
      context.emit("start-loading", true)
      
      try {
        
        // 不同类型的数据处理
        if (type === 1) {
          // 热门课程 - 调用真实 API
          const success = await learningStore.fetchPopularCourses({
            ...authStore.appConfig,
            uid: authStore.userInfo.id,
            //先用其他产品调试，后续修改回authStore.appConfig
            // product_id: "13",
            // channel_id: "26",
            // terminal_id: "3",
            // uid:"14857814"
          })
          
          // 如果 API 调用成功，格式化数据
          if (success && learningStore.popularCourses.length > 0) {
            // 将 API 返回的数据转换为组件需要的格式
            listDataRec.value = learningStore.popularCourses.map(course => ({
              id: course.id || `course${Math.random().toString(36).substr(2, 9)}`,
              title: course.name || '未命名课程',
              image: course.bgimg
            }))
          } else {
            // API 调用失败或没有数据，使用模拟数据作为备选
            listDataRec.value = []
          }
        } else if (type === 3) {
          await handleSearch(curKeyWorkValue)
        } else {
          listDataRec.value = []
          teacherDataRec.value = []
        }
        
        // 判断是否还有更多数据
        if (listDataRec.value.length < SearchConfig.searchCenterPageSize) {
          isStopPage = true
        }
      } catch (error) {
        console.error("获取数据失败:", error)
        listDataRec.value = []
        teacherDataRec.value = []
        isStopPage = true
      } finally {
        // 关闭加载状态
        context.emit("close-loading")
      }
    }
    
    // 新增：切换标签方法
    // 优化切换标签方法
    const switchTab = (tab: string) => {
      activeTab.value = tab;
      currentItemIndex = -1; // 重置当前选中项
       // 滚动到顶部
      nextTick(() => {
        if (search_center_view_list.value) {
          search_center_view_list.value.scrollTop = 0;
        }
      });
      // 移除加载教师数据的调用，因为数据已在搜索时加载完成
      // 仅在数据为空时给出提示
      if (tab === 'teachers' && teacherDataRec.value.length === 0) {
        console.log("教师数据已在搜索时加载，但当前为空");
      }
    };
    
    // 优化处理搜索函数
    const handleSearch = async (keyword: string) => {
      // 显示加载状态
      context.emit("start-loading", true);
      
      try {
        // 同时发起课程和教师搜索请求
        const [coursesResult, teachersResult] = await Promise.all([
          // 搜索课程
          learningStore.fetchSearchCourse({
            ...authStore.appConfig,
            uid: authStore.userInfo.id,
            keyword: keyword,
            limits:3000
          }),
          
          // 搜索教师
          learningStore.fetchSearchTeachers({
            ...authStore.appConfig,
            uid: authStore.userInfo.id,
            keyword: keyword,
            limits:3000
          })
        ]);
        
        // 处理课程搜索结果
        if (coursesResult && learningStore.searchResults.length > 0) {
          listDataRec.value = learningStore.searchResults.map(course => ({
            id: course.id,
            title: course.name,
            image: course.bgimg
          }));
          courseCount.value = learningStore.searchCourseCount || listDataRec.value.length;
        } else {
          listDataRec.value = [];
          courseCount.value = 0;
        }
        // 处理教师搜索结果
        if (teachersResult) {
          teacherDataRec.value = learningStore.teacherSearchResults.map(teacher => ({
            id: teacher.id,
            title: teacher.name,
            image: teacher.bigimg || teacher_default_head_small, // 如果没有头像则使用默认图片
            personality_label:teacher.personality_label, // 教师标签
            description: teacher.content // 使用教师的描述或职位信息
          }));
          teacherCount.value = learningStore.searchTeacherCount || teacherDataRec.value.length;
        } else {
          teacherDataRec.value = [];
          teacherCount.value = 0;
        }
        
        // 判断是否还有更多数据
        if (activeTab.value === 'courses') {
          isStopPage = listDataRec.value.length < SearchConfig.searchCenterPageSize;
        } else {
          isStopPage = teacherDataRec.value.length < SearchConfig.searchCenterPageSize;
        }
      } catch (error) {
        console.error("搜索失败:", error);
        // 出错时清空所有数据
        listDataRec.value = [];
        teacherDataRec.value = [];
        courseCount.value = 0;
        teacherCount.value = 0;
      } finally {
        // 隐藏加载状态
        context.emit("close-loading");
      }
    };
    
    // 新增：根据当前标签处理点击事件
    const handleItemClick = (item: any, index: number) => {
      currentItemIndex = index
      
      // 根据当前标签类型判断是课程还是教师
      if (activeTab.value === 'courses') {
        onCourseClick(item, index);
      } else {
        // 教师点击处理逻辑
        context.emit("keyword-select", item.name, false);
        console.log("选择教师:", item);
      }
    }

    const setTitle = (type: number) => {
      curTitleType = type
      title.value = type == 1 ? "热门课程" : type == 2 ? "搜索历史" : type == 3 ? "猜你想搜" : ""
    }

    const clearHistoryBtnClick = async () => {
      initParams()
      // 实际项目中这里应该调用清除历史记录的API
      await new Promise(resolve => setTimeout(resolve, 300))
      await setListData("", 1)
      //设置焦点
      context.emit("start-loading", true)
      setTimeout(() => {
        context.emit("keyword-select", curValue, true)
      }, 300)
    }

    const onItemClick = (item: { text: string }, index: number) => {
      currentItemIndex = index
      context.emit("keyword-select", item.text, false)
    }

    // 新增：处理课程卡片点击
    const onCourseClick = (course: any, index: number) => {
      currentItemIndex = index
      context.emit("keyword-select", course.title, false)
      
      // 调用 addCourseSearchRecord 接口记录搜索行为
      try {
        // 记录搜索记录到后台
        apiService.addCourseSearchRecord({
          ...authStore.appConfig,
          uid: authStore.userInfo.id,
          course_id:course.id
        });
      } catch (error) {
        console.error("记录搜索行为失败:", error);
        // 记录失败不影响主流程，继续执行后续操作
      }
      
      // 这里可以添加跳转到课程详情页的逻辑
      console.log("选择课程:", course)
    }

    const childFocus = (e) => {
      if (e.target) {
        context.emit("scroll-to-index", 1, 100)
        targetSid.value = props.defaultItemSid
      }
    }

    const setListSelect = (isSelect: boolean) => {
      // 实现列表选中状态的逻辑
    }

    const loadMore = () => {
      // 实现加载更多的逻辑
      if (!isStopPage) {
        pageNum++
        setListData(curKeyWorkValue, curTitleType)
      }
    }

    return {
      search_center, 
      title,
      onItemClick,
      onCourseClick,
      handleItemClick, // 导出新方法
      childFocus, 
      loadMore,
      clearHistoryBtnClick, 
      ic_search_input_clear, 
      ic_search_input_clear_focus, 
      ic_data_empty,
      centerWidth,
      targetSid,
      listDataRec,
      teacherDataRec, // 导出教师数据
      currentItemIndex,
      activeTab, // 导出标签状态
      courseCount, // 导出课程数量
      teacherCount, // 导出教师数量
      switchTab, // 导出标签切换方法
      filteredItems, // 导出过滤后的项目
      curTitleType, // 导出标题类型
      search_center_view_list // 确保导出了这个引用

    }
  }
})
</script>

<style scoped>
/* 导入原有样式 */
@import "@/assets/styles/search/search-center.css";

/* 课程卡片网格布局 - 保持不变 */
.course-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  padding-right: 64px;
  height: 100%;
}

/* 课程卡片样式 - 保持不变 */
.course-item {
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
}

.course-item:focus,
.course-item.focused {
  transform: scale(1.03);
}

/* 课程图片样式 - 保持不变 */
.course-image {
  width: 100%;
  height: 190px;
  object-fit: cover;
  border-radius: 20px;
}

/* 教师列表布局 - 保持不变 */
.teachers-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-right: 64px;
  height: 100%;
}

/* 教师项样式 - 调整为列布局 */
.teacher-item {
  display: flex;
  flex-direction: column;
  gap: 10px; /* 第一行和第二行之间的间距 */
  padding: 25px;
  background-color: rgba(255, 255, 255, 0.16);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
}

.teacher-item:focus,
.teacher-item.focused {
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateX(5px);
}

/* 第一行内容容器 */
.teacher-item-top {
  display: flex;
  align-items: center;
  gap: 20px;
}

/* 教师头像容器 - 保持不变 */
.teacher-avatar-container {
  flex-shrink: 0;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  background-color: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 教师头像 - 保持不变 */
.teacher-avatar {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  object-fit: cover;
}

/* 教师信息 - 保持不变 */
.teacher-info {
  flex: 1;
  min-width: 0; /* 防止内容溢出 */
}

/* 教师姓名 - 保持不变 */
.teacher-name {
  color: #FFFFFF;
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 10px 0;
}

/* 教师简介 - 保持不变 */
.teacher-personality-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 22px;
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 详细描述样式 - 修改为与头像左对齐 */
.teacher-description {
  color: rgba(255, 255, 255, 0.7);
  font-size: 22px;
  margin: 0;
  line-height: 1.6;
}

/* 响应式调整 - 更新详细描述样式 */
@media (max-width: 1200px) {
  .teacher-name {
    font-size: 24px;
  }
  
  .teacher-personality-label,
  .teacher-description {
    font-size: 18px;
  }
  
  .teacher-description {
    padding-left: 100px; /* 响应式调整间距 */
  }
}

@media (max-width: 900px) {
  .teacher-avatar-container {
    width: 80px;
    height: 80px;
  }
  
  .teacher-avatar {
    width: 70px;
    height: 70px;
  }
  
  .teacher-name {
    font-size: 22px;
  }
  
  .teacher-personality-label,
  .teacher-description {
    font-size: 16px;
  }
  
  .teacher-description {
    padding-left: 100px; /* 响应式调整间距 */
  }
}

/* 标签样式 - 保持不变 */
.search-tabs {
  display: flex;
  gap: 16px;
}

.search-tab {
  color: #FFFFFF;
  font-size: 30px;
  cursor: pointer;
  padding-bottom: 4px;
  border-bottom: 2px solid transparent;
  transition: all 0.3s ease;
  font-weight: 400;
  font-family: Source Han Sans SC-Medium;
  opacity: 0.7;
}

.search-tab.active {
  /* color: #FFD700; */
  border-bottom-color: transparent;
  font-weight: 500;
  opacity: 1;
}


/* 响应式调整 */
@media (max-width: 1200px) {
  .course-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .search-tab {
    font-size: 22px;
  }
  
  .teacher-name {
    font-size: 24px;
  }
  
  .teacher-personality-label {
    font-size: 18px;
  }
}

@media (max-width: 900px) {
  .course-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .search-tab {
    font-size: 20px;
  }
  
  .search-tabs {
    gap: 12px;
  }
  
  .teacher-avatar-container {
    width: 80px;
    height: 80px;
  }
  
  .teacher-avatar {
    width: 70px;
    height: 70px;
  }
  
  .teacher-name {
    font-size: 22px;
  }
  
  .teacher-personality-label {
    font-size: 16px;
  }
}
</style>
