<template>
  <div class="homepage-container">
    <!-- 主标题 -->
    <h1 class="main-title">请选择学习阶段</h1>

    <!-- 学习阶段选择卡片 -->
    <div class="learning-stages">
      <div
        v-for="stage in learningStages"
        :key="stage.id"
        class="stage-card"
        :class="{ selected: selectedStage === stage.id }"
        @click="selectStage(stage.id)"
      >
        <div class="avatar-container">
          <div class="avatar">
            <Picture
              :src="stage.image"
              :alt="stage.name"
              img-class="avatar-image"
            />
          </div>
        </div>
        <h3 class="stage-name">{{ stage.name }}</h3>
      </div>
    </div>

    <!-- 开始学习按钮 -->
    <button
      class="start-button"
      :disabled="!selectedStage"
      @click="startLearning"
    >
      开启智学之旅
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="currentColor"
        class="arrow-icon"
      >
        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
      </svg>
    </button>
  </div>
  <CustomDialog
    :visible="dialogVisible"
    title="温馨提示"
    message="网络异常，请检查网络后重试"
    buttonText="确认"
    @close="handleDialogClose"
  />
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import Picture from "./Picture.vue";

// 获取路由对象
const route = useRoute();

// 定义学习阶段数据
const learningStages = [
  {
    id: "preschool",
    name: "学龄前",
    image: "/src/assets/images/home/preschool",
  },
  {
    id: "primary",
    name: "小学",
    image: "/src/assets/images/home/primary",
  },
  {
    id: "middle",
    name: "初中",
    image: "/src/assets/images/home/middle",
  },
  {
    id: "high",
    name: "高中",
    image: "/src/assets/images/home/high",
  },
];

// 选中的学习阶段，默认为学龄前
const selectedStage = ref("preschool");

// 组件挂载时检查URL参数
onMounted(() => {
  // 检查URL中是否有selectedStage参数
  if (route.query.selectedStage) {
    const paramValue = route.query.selectedStage.toString();

    // 验证参数值是否在有效范围内
    const isValidStage = learningStages.some(
      (stage) => stage.id === paramValue
    );

    // 如果参数有效，使用参数值替换默认值
    if (isValidStage) {
      selectedStage.value = paramValue;
    }
  }
});

// 事件定义
const emit = defineEmits(["stage-selected", "start-learning"]);

// 选择学习阶段
const selectStage = (stageId) => {
  selectedStage.value = stageId;
  emit("stage-selected", stageId);
};

// 开始学习
const startLearning = () => {
  if (selectedStage.value) {
    emit("start-learning", selectedStage.value);
    console.log("开始学习:", selectedStage.value);
  }
};
</script>

<style scoped lang="less">
// 变量定义
@avatar-size: 80px;
@avatar-size-tablet: 60px;
@card-width: 270px;
@card-height: 360px;
@card-height-tablet: 320px;
@card-height-mobile: 240px;
@button-width: 450px;
@button-height: 90px;

// 混合函数 (Mixins)
.flex-center() {
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-base() {
  background: @card-bg;
  border: 2px solid transparent;
  border-radius: @card-border-radius;
  transition: @transition-normal;
  backdrop-filter: @backdrop-blur;
  overflow: hidden;
}

.text-ellipsis() {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// 主容器
.homepage-container {
  min-height: 100vh;
  background: @background-gradient;
  .flex-center();
  flex-direction: column;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

  // 主标题
  .main-title {
    color: @text-white;
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 64px;
    text-align: center;
    letter-spacing: 0.02em;
  }

  // 学习阶段网格
  .learning-stages {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1em;
    margin-bottom: 64px;
    max-width: 1152px;
    width: 100%;
  }

  // 阶段卡片
  .stage-card {
    .card-base();
    .flex-center();
    width: @card-width;
    height: @card-height;
    padding: 2rem 1.5rem;
    text-align: center;
    cursor: pointer;
    flex-direction: column;
    position: relative;

    // 悬停效果
    &:hover {
      transform: translateY(-5px);
      background: @card-bg-hover;
    }

    // 选中状态
    &.selected {
      border: 4px solid @primary-color;
      background: @primary-light;
      box-shadow: @shadow-primary;

      &::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border-radius: 18px;
        padding: 2px;
      }
    }

    // 头像容器
    .avatar-container {
      .flex-center();
      margin-bottom: 2rem;

      .avatar {
        width: @avatar-size;
        height: @avatar-size;
        border-radius: 50%;
        .flex-center();
        position: relative;
        overflow: hidden;

        :deep(.avatar-image) {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
        }
      }
    }

    // 阶段名称
    .stage-name {
      color: @text-white;
      font-size: 1.3rem;
      font-weight: 500;
      margin: 0;
      letter-spacing: 0.02em;
    }
  }

  // 开始按钮
  .start-button {
    width: @button-width;
    height: @button-height;
    background: linear-gradient(270deg, #008ed4 0%, #03caa1 100%);
    box-shadow: inset 0px 0px 12px 0px rgba(255, 255, 255, 0.8);
    border-radius: 999px;
    color: @text-white;
    border: none;
    padding: 1rem 2.5rem;
    font-size: 30px;
    font-weight: 400;
    cursor: pointer;
    transition: @transition-normal;
    .flex-center();
    gap: 0.5rem;
    letter-spacing: 0.02em;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .arrow-icon {
      transition: transform 0.3s ease;
    }

    &:hover:not(:disabled) {
      .arrow-icon {
        transform: translateX(3px);
      }
    }
  }
}

// 动画定义
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 动画应用
.homepage-container {
  > * {
    animation: fadeInUp 0.6s ease forwards;
  }
}

// 阶段卡片动画延迟
.stage-card {
  &:nth-child(1) {
    animation-delay: 0.1s;
  }
  &:nth-child(2) {
    animation-delay: 0.2s;
  }
  &:nth-child(3) {
    animation-delay: 0.3s;
  }
  &:nth-child(4) {
    animation-delay: 0.4s;
  }
}

// 响应式设计
@media (max-width: @tablet) {
  .homepage-container {
    padding: 1rem;

    .main-title {
      font-size: 1.5rem;
      margin-bottom: 2rem;
    }

    .learning-stages {
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stage-card {
      height: @card-height-tablet;
      padding: 1.5rem 1rem;

      .avatar-container .avatar {
        width: @avatar-size-tablet;
        height: @avatar-size-tablet;
      }

      .stage-name {
        font-size: 1.1rem;
      }
    }

    .start-button {
      padding: 0.9rem 2rem;
      font-size: 1.1rem;
    }
  }
}

@media (max-width: @mobile) {
  .homepage-container {
    .learning-stages {
      grid-template-columns: 1fr;
      max-width: 280px;
    }

    .main-title {
      font-size: 1.8rem;
    }

    .stage-card {
      height: @card-height-mobile;
      padding: 1.2rem;
    }

    .start-button {
      padding: 0.8rem 1.8rem;
      font-size: 1rem;
    }
  }
}
</style>
