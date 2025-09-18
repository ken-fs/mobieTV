<template>
  <div class="auto-page-test">
    <h2>AutoPage 组件测试</h2>
    
    <!-- 测试数据展示 -->
    <AutoPage 
      :data="testData"
      :maxItems="10"
      :showPriceInfo="true"
      :showCollection="true"
      :userInfo="mockUserInfo"
      @click-callback="handleContentClick"
      @collection-callback="handleCollection"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AutoPage from './AutoPage.vue'

// 模拟用户信息
const mockUserInfo = ref({
  uid: '12345',
  is_vip: false
})

// 模拟测试数据
const testData = ref([
  {
    type: 1,
    content: '推荐课程',
    vice_title: '精选优质内容'
  },
  {
    type: 2,
    height: 20
  },
  {
    type: 3,
    num: 3,
    content_area: [
      {
        id: 1,
        name: '小学语文：基础知识详解',
        cover_img1: 'https://via.placeholder.com/280x160?text=Course+1',
        format_id: 1,
        is_free: 1,
        type: 3,
        price: 99,
        original_price: 199,
        buy_num: 1520,
        is_activity: true,
        discount: 50,
        is_collection: false,
        element_content: {
          resources_num: 24,
          study_num: 3250,
          remark: '本课程涵盖小学语文基础知识点，通过生动的教学方式帮助孩子打好语文基础'
        }
      },
      {
        id: 2,
        name: '小学数学：数学思维训练',
        cover_img1: 'https://via.placeholder.com/280x160?text=Course+2',
        format_id: 2,
        is_free: 2,
        type: 3,
        vip_price: 69,
        original_vip_price: 129,
        buy_num: 890,
        is_collection: true,
        element_content: {
          resources_num: 18,
          study_num: 1890,
          remark: '培养数学思维，提升逻辑推理能力'
        }
      },
      {
        id: 3,
        name: '小学英语：口语表达能力提升',
        cover_img1: 'https://via.placeholder.com/280x160?text=Course+3',
        format_id: 1,
        is_free: 3,
        type: 3,
        price: 159,
        buy_num: 2100,
        course_status: 1,
        is_collection: false,
        element_content: {
          resources_num: 32,
          study_num: 5600,
          remark: '外教一对一口语训练，提升英语表达能力'
        }
      }
    ]
  },
  {
    type: 1,
    content: '热门推荐'
  },
  {
    type: 4,
    content_area: [
      {
        id: 4,
        name: '科学实验课',
        cover_img1: 'https://via.placeholder.com/280x160?text=Science',
        format_id: 1,
        banner: [{
          img: 'https://via.placeholder.com/280x160?text=Banner+1'
        }]
      },
      {
        id: 5,
        name: '艺术创作课',
        cover_img1: 'https://via.placeholder.com/280x160?text=Art',
        format_id: 2,
        banner: [{
          img: 'https://via.placeholder.com/280x160?text=Banner+2'
        }]
      }
    ]
  }
])

// 处理内容点击
const handleContentClick = (item: any) => {
  console.log('点击课程:', item)
  // 这里可以添加导航逻辑
}

// 处理收藏操作
const handleCollection = (item: any) => {
  console.log('收藏操作:', item)
  // 这里可以添加收藏API调用
  item.is_collection = !item.is_collection
}
</script>

<style lang="less" scoped>
.auto-page-test {
  padding: 20px;
  
  h2 {
    color: white;
    margin-bottom: 20px;
    text-align: center;
  }
}
</style>