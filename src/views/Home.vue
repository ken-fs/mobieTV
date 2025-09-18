<template>
  <div class="home-view">
    <!-- 主页内容 -->
    <Transition name="content-fade">
      <div v-if="!isLoading" class="main-content">
        <HomePage
          @stage-selected="onStageSelected"
          @start-learning="onStartLearning"
        />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { showLoadingToast, showSuccessToast, showFailToast } from "vant";
import HomePage from "@/components/HomePage.vue";
import { useLearningStore } from "@/stores/learning";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const route = useRoute();
const isLoading = ref(true);

// Store 实例
const learningStore = useLearningStore();
const authStore = useAuthStore();

const STAGE_MAP = {
  preschool: "1",
  primary: "2",
  middle: "3",
  high: "4",
};

// 加载
onMounted(() => {
  isLoading.value = false;
  // 检查URL参数中是否有选中的阶段
  checkRouteParams();
});

// 监听路由参数变化
watch(
  () => route.query,
  () => {
    checkRouteParams();
  }
);

// 检查路由参数中的选中阶段
function checkRouteParams() {
  const selectedStage = route.query.selectedStage;
  const fromLearning = route.query.fromLearning;

  if (selectedStage && fromLearning) {
    // 如果是从学习页面返回的，设置选中的阶段到 localStorage
    localStorage.setItem("selectedStage", selectedStage as string);

    // 可以选择清除URL参数，避免刷新后重复处理
    // router.replace({ query: {} })
  }
}

// 处理学习阶段选择
const onStageSelected = (stageId: string) => {
  console.log("选择的学习阶段:", stageId);
  localStorage.setItem("selectedStage", String(stageId));
};

// 处理开始学习
const onStartLearning = async (stageId: string) => {
  localStorage.setItem("selectedStage", String(stageId));

  const selectedStage = STAGE_MAP[stageId as keyof typeof STAGE_MAP];

  try {
    // 显示加载提示
    const loadingToast = showLoadingToast({
      message: "正在加载学习内容...",
      forbidClick: true,
      duration: 0,
    });

    // 使用应用配置中的 product_id 获取页面Tab列表
    const success = await learningStore.fetchPageTabList({
      ...authStore.appConfig,
      xueduan_id: selectedStage,
    });
    // 关闭加载提示
    loadingToast.close();

    if (success) {
      console.log("Tab列表获取成功:", learningStore.pageTabList);
      // showSuccessToast("学习内容加载完成");

      // 导航到对应的学习页面
      router.push(`/learning/${stageId}`);
    } else {
      showFailToast(learningStore.errorMessage || "获取学习内容失败");
    }
  } catch (error) {
    console.error("获取学习内容时发生错误:", error);
    showFailToast("获取学习内容时发生错误，请稍后重试");
  }
};
</script>

<style scoped>
.home-view {
  width: 100%;
  height: 100vh;
  position: relative;
}

/* 主内容过渡动画 */
.main-content {
  width: 100%;
  height: 100%;
}

.content-fade-enter-active,
.content-fade-leave-active {
  transition: all 0.5s ease-in-out;
}

.content-fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.content-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
