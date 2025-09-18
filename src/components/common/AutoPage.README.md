# AutoPage 组件使用指南

## 🎯 组件简介

AutoPage 是一个高度可配置的动态页面渲染组件，专门用于展示教育平台的课程内容。该组件融合了原 coursecard 的所有功能，支持多种布局方式和丰富的交互特性。

## ✨ 主要特性

### 🎨 多布局支持
- **标题区域 (type: 1)** - 支持主标题和副标题
- **间隔区域 (type: 2)** - 可自定义高度的空白间隔
- **网格布局 (type: 3)** - 3/4/5列响应式网格
- **横向滚动 (type: 4)** - 水平滚动卡片展示，专门优化banner图片显示

### 💰 课程信息展示
- ✅ VIP标签 (免费/VIP/付费)
- ✅ 价格信息 (原价/现价/优惠标签)
- ✅ 课程元数据 (课时数/学习人数)
- ✅ 音频/视频格式标识
- ✅ 课程描述和备注

### 🔥 交互功能
- ✅ 点击播放课程
- ✅ 收藏/取消收藏
- ✅ 已下架课程提示
- ✅ VIP权益区分显示
- ✅ 智能类型标签识别 (课程/专题/页面/教师)

## 📋 Props 参数

```typescript
interface Props {
  data: PageItem[]           // 页面数据
  maxItems?: number          // 最大显示数量 (默认: 20)
  showNoData?: boolean       // 是否显示无数据状态 (默认: true)
  showPriceInfo?: boolean    // 是否显示价格信息 (默认: false)
  showCollection?: boolean   // 是否显示收藏功能 (默认: false)
  userInfo?: {              // 用户信息
    uid?: string
    is_vip?: boolean
    [key: string]: any
  }
}
```

## 🎭 Events 事件

```typescript
interface Emits {
  (event: 'click-callback', item: ContentItem): void      // 课程点击事件
  (event: 'collection-callback', item: ContentItem): void // 收藏操作事件
}
```

## 📊 数据结构

### PageItem 页面项
```typescript
interface PageItem {
  type: 1 | 2 | 3 | 4        // 区域类型
  content?: string           // 标题内容 (type: 1)
  vice_title?: string        // 副标题 (type: 1)
  height?: number           // 高度 (type: 2)
  num?: number              // 列数 (type: 3, 值: 3|4|5)
  content_area?: ContentItem[] // 内容列表
}
```

### ContentItem 内容项
```typescript
interface ContentItem {
  id: number
  name: string              // 课程名称
  cover_img1: string        // 封面图片
  format_id?: 1 | 2        // 格式 (1: 视频, 2: 音频)
  is_free?: 1 | 2 | 3      // 类型 (1: 免费, 2: VIP, 3: 付费)
  type?: number
  price?: number           // 价格
  vip_price?: number       // VIP价格
  original_price?: number   // 原价
  buy_num?: number         // 购买人数
  is_activity?: boolean    // 是否活动商品
  discount?: number        // 折扣
  is_collection?: boolean  // 是否已收藏
  course_status?: number   // 课程状态 (2: 已下架)
  course_del?: number      // 是否删除 (2: 已删除)
  element_content?: {
    resources_num?: number  // 课时数
    study_num?: number     // 学习人数  
    remark?: string        // 课程描述
  }
  banner?: Array<{         // Banner图片 (用于type: 4)
    img?: string
    https_domain?: string
  }>
}
```

## 💡 使用示例

### 基础用法
```vue
<template>
  <AutoPage 
    :data="pageData"
    @click-callback="handleCourseClick"
  />
</template>

<script setup>
import AutoPage from '@/components/common/AutoPage.vue'

const pageData = ref([
  {
    type: 1,
    content: '推荐课程',
    vice_title: '精选优质内容'
  },
  {
    type: 3,
    num: 3,
    content_area: [
      {
        id: 1,
        name: '小学语文基础',
        cover_img1: 'https://example.com/cover.jpg',
        format_id: 1,
        is_free: 1,
        element_content: {
          resources_num: 24,
          study_num: 1520,
          remark: '课程描述'
        }
      }
    ]
  }
])

const handleCourseClick = (item) => {
  console.log('点击课程:', item)
}
</script>
```

### 完整功能示例
```vue
<template>
  <AutoPage 
    :data="courseData"
    :maxItems="12"
    :showPriceInfo="true"
    :showCollection="true"
    :userInfo="currentUser"
    @click-callback="handleContentClick"
    @collection-callback="handleCollection"
  />
</template>

<script setup>
const currentUser = ref({
  uid: 'user123',
  is_vip: true
})

const handleContentClick = (item) => {
  // 根据action类型进行不同处理
  switch (item.action) {
    case 'course':
      // 跳转课程播放页
      router.push(`/${item.courseType}/${item.element_content?.id}`)
      break
      
    case 'subject':
      // 跳转专题详情页
      router.push(`/subject/${item.element_content?.id}`)
      break
      
    case 'link':
      // 处理链接跳转（外部链接已自动打开）
      router.push(item.url)
      break
      
    case 'page':
      // 跳转页面并传递参数
      router.push({ name: 'SyncBooks', query: item.query })
      break
      
    case 'teacher':
      // 跳转教师详情页
      router.push(`/teacher/${item.element_content?.id}`)
      break
      
    default:
      // 处理传统点击方式
      console.log('点击内容:', item)
  }
}

const handleCollection = async (item) => {
  try {
    await api.toggleCollection(item.id)
    item.is_collection = !item.is_collection
    showToast(item.is_collection ? '收藏成功' : '取消收藏')
  } catch (error) {
    showToast('操作失败')
  }
}
</script>
```


## 🎨 样式定制

组件使用 Less 变量，可通过修改 `variables.less` 文件进行主题定制：

```less
// 主题色彩
@primary-color: #33CA9E;
@text-white: #ffffff;
@text-white-50: rgba(255, 255, 255, 0.5);
@text-white-70: rgba(255, 255, 255, 0.7);

// 卡片样式
@card-bg: rgba(255, 255, 255, 0.1);
@card-bg-hover: rgba(255, 255, 255, 0.15);
@card-small-radius: 20px;
```

## 📱 响应式设计

- **桌面端**: 完整网格布局
- **平板端**: 自动缩减为2列布局  
- **移动端**: 单列纵向布局

## 🖼️ 资源文件

组件依赖以下图标文件，已复制到 `src/assets/images/common/`:

- `voice.png` - 音频课程标识
- `audio_ico_07.png` - 课时数图标
- `audio_ico_10.png` - 学习人数图标  
- `star_03.png` - 未收藏状态
- `star_07.png` - 已收藏状态

## 🔧 功能特性说明

### Type类型处理
组件现在完全支持coursecard的type处理逻辑：

- **Type 1 - 课程**: 根据 `element_content.format_id` 区分视频/音频课程
- **Type 2 - 专题**: 跳转到专题详情页面
- **Type 3 - 链接**: 支持外部链接跳转和付费商品展示  
- **Type 4 - 页面**: 带参数的页面内部跳转
- **Type 7 - 教师**: 跳转到教师详情页面

### VIP体系支持
- 根据 `userInfo.is_vip` 区分显示价格
- VIP用户显示专属价格和"VIP专属价"标签
- 非VIP用户显示VIP开通提示
- 支持VIP专属内容标记

### 价格显示逻辑
- **仅Type 3时显示价格信息**
- VIP用户优先显示vip_price，否则显示普通价格
- 支持原价对比显示（划线价格）
- 活动商品显示"限时优惠"标签
- 显示购买人数统计

### 多图片源支持
参考coursecard的bgKey逻辑，智能图片选择：

**普通模式优先级**：
```
bgimg > cover_img1 > course_icon > banner[0].img > banner[0].https_domain
```

**我的课程模式优先级**：
```
course_icon > cover_img1 > bgimg > banner[0].img > banner[0].https_domain
```

**横向滚动区域 (Type 4)**：
- 优先使用 `banner` 数组中的图片
- 支持 `banner[0].img` 和 `banner[0].https_domain` 字段
- 如无banner数据，回退到普通图片逻辑

### 课程状态管理
- 自动识别已下架课程 (`course_status: 2`)
- 已删除课程不可点击 (`course_del: 2`)  
- 灰度显示和禁用交互

### 灵活的字段映射
支持多个资源数量字段：
- `element_content.resources_num`
- `resources_count` 
- `resource_count`
- `resources_num`

### 横向滚动区域增强
- **专门的Banner处理**: 优先使用`banner`数组中的图片
- **类型标签展示**: 自动识别并显示内容类型(🎓课程/📚专题/📄页面/👨‍🏫教师)
- **响应式卡片**: 根据屏幕尺寸自动调整卡片宽度
- **视觉优化**: 类型标签使用不同颜色区分内容类型

## 🚀 性能优化

- 虚拟化长列表支持 (`maxItems` 限制)
- 图片懒加载和错误处理
- 响应式数据更新优化
- CSS动画硬件加速

---

## 🆕 更新日志

### v2.1.0 (2024-09-15)
- ✅ **Banner图片优化**: 参考coursecard实现专门的banner处理逻辑
- ✅ **横向滚动增强**: 优先使用banner数组图片，支持https_domain字段
- ✅ **类型标签显示**: 横向滚动区域增加可视化类型标识
- ✅ **图片选择优化**: 实现coursecard的bgKey逻辑，支持cardType参数
- ✅ **样式美化**: 类型标签使用不同颜色和图标区分

### v2.0.0 (2024-09-15)
- ✅ **重大更新**: 完全实现coursecard的type处理逻辑
- ✅ 新增Type 1/2/3/4/7的完整支持
- ✅ 完善VIP体系和价格显示逻辑  
- ✅ 支持多图片源智能切换
- ✅ 优化点击事件处理，支持action分发
- ✅ 增强数据字段兼容性

### v1.0.0 (2024-09-15)
- ✅ 基础AutoPage组件实现
- ✅ 网格和横向滚动布局支持
- ✅ 响应式设计
- ✅ 收藏功能集成

---

**当前版本**: v2.1.0  
**更新时间**: 2024-09-15  
**兼容性**: Vue 3.0+ / TypeScript 4.0+  
**数据兼容**: 完全兼容爱学教育coursecard数据格式  
**Banner支持**: 完整支持banner数组和多图片源切换