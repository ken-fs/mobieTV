<template>
  <div class="filter-container">
    <!-- 年级筛选 -->
    <div class="filter-group">
      <h3 class="filter-title">年级</h3>
      <div class="filter-options single-line-scroll">
        <span 
          v-for="grade in grades" 
          :key="grade" 
          :class="['filter-option', { active: selectedGrade === grade }]"
          @click="selectGrade(grade)"
        >
          {{ grade }}
        </span>
      </div>
    </div>
    
    <!-- 教材筛选 -->
    <div class="filter-group">
      <h3 class="filter-title">教材</h3>
      <div class="filter-options multi-line-scroll">
        <span 
          v-for="textbook in textbooks" 
          :key="textbook" 
          :class="['filter-option', { active: selectedTextbook === textbook }]"
          @click="selectTextbook(textbook)"
        >
          {{ textbook }}
        </span>
      </div>
    </div>
    
    <!-- 年份筛选 -->
    <div class="filter-group">
      <h3 class="filter-title">年份</h3>
      <div class="filter-options single-line-scroll">
        <span 
          v-for="year in years" 
          :key="year" 
          :class="['filter-option', { active: selectedYear === year }]"
          @click="selectYear(year)"
        >
          {{ year }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

// 定义组件属性的 TypeScript 接口
interface FilterPanelProps {
  grades: string[]
  textbooks: string[]
  years: string[]
  selectedGrade: string
  selectedTextbook: string
  selectedYear: string
}

// 定义组件事件类型
type FilterPanelEmits = {
  'grade-change': [value: string]
  'textbook-change': [value: string]
  'year-change': [value: string]
}

// 定义组件属性
const props = defineProps<FilterPanelProps>()

// 定义组件事件
const emit = defineEmits<FilterPanelEmits>()

// 筛选方法
const selectGrade = (grade: string) => {
  emit('grade-change', grade)
}

const selectTextbook = (textbook: string) => {
  emit('textbook-change', textbook)
}

const selectYear = (year: string) => {
  emit('year-change', year)
}
</script>

<style scoped lang="less">
.filter-container {
  padding: 20px 64px;
  border-radius: 12px;
  
  .filter-group {
    margin-bottom: 20px;
    display: flex; /* 添加flex布局 */
    align-items: flex-start; /* 垂直居中对齐 */
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .filter-title {
      color: #ffffff;
      font-size: 24px;
      font-weight: 500;
      margin-bottom: 0; /* 移除底部边距 */
      margin-right: 20px; /* 添加右侧边距与选项分隔 */
      min-width: 60px; /* 确保标题有足够宽度 */
      flex-shrink: 0; /* 防止标题被压缩 */
    }
    
    .filter-options {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      flex: 1; /* 让选项区域占据剩余空间 */
      
      .filter-option {
        padding: 8px 20px;
        border-radius: 999px;
        color: rgba(255, 255, 255, 0.8);
        font-size: 24px;
        cursor: pointer;
        transition: all 0.3s ease;
        white-space: nowrap; /* 防止选项文字换行 */
         flex-shrink: 0;
        &:hover {
          background: rgba(255, 255, 255, 0.15);
        }
        
        &.active {
          background: #33CA9E; /* 使用具体的主色调 */
          color: #ffffff;
        }
      }
    }
    
    /* 单行滚动样式 */
    .single-line-scroll {
      flex-wrap: nowrap; /* 不换行 */
      overflow-x: auto; /* 允许横向滚动 */
      overflow-y: hidden; /* 隐藏垂直滚动条 */
      padding-bottom: 5px; /* 添加底部内边距，让滚动条不遮挡内容 */
      max-height: 50px; /* 设置最大高度 */
      
      .scrollbar-thin();
    }
    
    /* 多行滚动样式 */
     .multi-line-scroll {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      overflow-x: auto;
      overflow-y: auto;
      padding-bottom: 10px;
      max-height: calc(2 * 48px + 12px); /* 最多两行高度 */
      
      .scrollbar-normal();
    }
    
    /* 确保选项不会换行到第三行 */
    .multi-line-scroll::after {
      content: '';
      flex: auto;
    }
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .filter-container {
    margin: 0 20px;
    padding: 16px 20px;
    
    .filter-group {
      flex-direction: column; /* 在小屏幕上恢复垂直布局 */
      align-items: flex-start; /* 左对齐 */
      
      .filter-title {
        margin-bottom: 12px; /* 恢复底部边距 */
        margin-right: 0; /* 移除右侧边距 */
      }
    }
  }
}
</style>