<template>
  <div class="auto-page">
    <!-- 渲染页面内容 - 使用一致的ID格式 -->
    <div v-for="(item, index) in processedData" :key="`section-${index}`" class="content-section">
      <!-- 间隔元素 -->
      <div v-if="item.type === 2" class="spacer" :style="{ height: `${item.height || 24}px` }"></div>

      <!-- 标题元素 -->
      <div v-else-if="item.type === 1" class="section-title" :id="`section-${getTitleIndex(index)}`">
        <h3>{{ item.content }}</h3>
        <p v-if="item.vice_title" class="vice-title">{{ item.vice_title }}</p>
      </div>


      <!-- 内容区域 - 网格布局卡片 (type 3) -->
      <div v-else-if="item.type === 3 && item.content_area" class="grid-section" :style="{ height: `${item.height}px` }">
        <div class="grid-container" :class="getGridClass(item.num)">
          <div v-for="contentItem in item.content_area.slice(0, maxItems)" :key="contentItem.id"
            class="grid-card course-card" :class="{ disabled: isContentDisabled(contentItem) }"
            @click="handleContentClick(contentItem)">
            <!-- 课程封面 -->
            <div class="card-image">
              <img :src="getCoverImage(contentItem)" :alt="contentItem.name" @error="handleImageError" :style="{ height: `${item.height}px` }" />
              <!-- VIP 标签 -->
              <div v-if="showVipTip(contentItem)" class="vip-tip">
                <span v-if="contentItem.is_free === 1" class="free-tip">免费</span>
                <span v-else-if="contentItem.is_free === 2" class="vip-tip-label">VIP</span>
              </div>
              <!-- 音频标识 -->
              <img v-if="contentItem.format_id === 2" class="audio-icon" :src="getAudioIcon()" alt="音频">
              <!-- 播放覆盖层 -->
              <div class="play-overlay">
                <div class="play-button">▶</div>
              </div>
            </div>

            <!-- 课程信息 -->
            <!-- <div class="card-info">
              <h4 class="card-title">{{ formatTitle(contentItem.name) }}</h4>
              <div v-if="contentItem.element_content" class="card-meta">
                <div v-if="contentItem.element_content.resources_num || contentItem.resources_count" class="meta-item">
                  <img :src="getResourceIcon()" class="meta-icon">
                  {{ contentItem.element_content.resources_num || contentItem.resources_count }}课时
                </div>
                <div v-if="contentItem.element_content.study_num || contentItem.hits" class="meta-item">
                  <img :src="getStudyIcon()" class="meta-icon">
                  {{ formatStudyCount(contentItem.element_content.study_num || contentItem.hits) }}
                </div>
              </div> -->

              <!-- 价格信息 (仅type=3时显示) -->
              <!-- <div v-if="shouldShowPriceSection(contentItem)" class="price-info"> -->
                <!-- VIP专属价标签 -->
                <!-- <div v-if="showVipPriceTag(contentItem)" class="vip-price-tag">
                  <span class="vip-label">VIP专属价</span>
                </div> -->

                <!-- 活动优惠标签 -->
                <!-- <div v-if="contentItem.is_activity && contentItem.discount" class="discount-tip">
                  <span class="discount-label">限时优惠</span>
                </div> -->

                <!-- VIP开通提示 -->
                <!-- <div v-if="showVipUpgradeTip(contentItem)" class="vip-tip-section">
                  开通VIP后购买仅需¥{{ contentItem.vip_price }}
                  <span class="vip-link">开通></span>
                </div> -->

                <!-- 价格显示 -->
                <!-- <div class="price-section">
                  <span class="current-price">¥{{ getCurrentPrice(contentItem) }}</span>
                  <span v-if="getOriginalPrice(contentItem) > getCurrentPrice(contentItem)" class="original-price">¥{{
                    getOriginalPrice(contentItem) }}</span>
                </div> -->

                <!-- 购买人数 -->
                <!-- <div v-if="contentItem.buy_num" class="buy-count">{{ contentItem.buy_num }}人已购买</div>
              </div> -->

              <!-- <p v-if="contentItem.element_content && contentItem.element_content.remark" class="card-desc">
                {{ truncateText(contentItem.element_content.remark, 60) }}
              </p> -->

              <!-- 收藏按钮 -->
              <!-- <div v-if="showCollection" class="collection-section" @click.stop="handleCollection(contentItem)">
                <img :src="getCollectionIcon(contentItem.is_collection)" class="collection-icon">
                <span>{{ contentItem.is_collection ? '已收藏' : '收藏' }}</span>
              </div>
            </div> -->
          </div>
        </div>
      </div>

      <!-- 新增内容区域 - 大横幅+小卡片组合布局 (type 4) -->
      <div v-else-if="item.type === 4 && item.content_area" class="combo-section">
        <!-- 布局容器 -->
        <div class="combo-layout">
          <!-- Banner 区域 (左侧) -->
          <div class="banner-container">
            <template v-for="contentItem in item.content_area.slice(0, maxItems)" :key="contentItem.id">
              <div v-if="contentItem.type === 8" @click="handleContentClick(contentItem)">
                <CustomSwipe v-if="contentItem.banner && contentItem.banner.length > 0"
                  :items="getSwipeItems(contentItem.banner)" height="240" @change="onSwipeChange" link-field="url"
                  new-window="false" />
              </div>
            </template>
          </div>

          <!-- 课程卡片区域 (右侧) -->
          <div class="cards-container">
            <template v-for="contentItem in item.content_area.slice(0, maxItems)" :key="contentItem.id">
              <div v-if="contentItem.type !== 8" class="small-card" @click="handleContentClick(contentItem)">
                <img :src="getSmallCardImage(contentItem)" :alt="contentItem.name" class="small-card-image" />
                <!-- <div class="small-card-info">
                  <h4 class="small-card-title">{{ contentItem.name }}</h4>
                  <div v-if="contentItem.element_content && contentItem.element_content.resources_num"
                    class="small-card-meta">
                    {{ contentItem.element_content.resources_num }}课时
                  </div>
                </div> -->
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- 无数据提示 -->
    <div v-if="showNoData && processedData.length === 0" class="no-data">
      暂无内容
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import CustomSwipe from "@/components/common/CustomSwipe.vue";
import { useAutoPageEducation } from "@/composable/useAutoPageEducation";

// 导入 composable 并解构需要的函数
const { handleContentClick } = useAutoPageEducation();

// ============================================================================
// 类型定义
// ============================================================================
interface ContentItem {
  id: number
  name: string
  type: number
  content_id: number
  cover_img1?: string
  bgimg?: string           // 背景图片
  course_icon?: string     // 课程图标
  link_url?: string        // 链接地址（type=3时使用）
  cover_img2?: string
  format_id?: number  // 1: 视频, 2: 音频
  is_free?: number    // 1: 免费, 2: VIP, 3: 付费
  is_collection?: boolean
  price?: number
  vip_price?: number
  original_price?: number
  original_vip_price?: number
  buy_num?: number
  is_activity?: boolean
  discount?: number
  course_status?: number  // 课程状态
  course_del?: number     // 是否删除
  hits?: number          // 观看次数
  resources_count?: number // 资源数量
  resources_num?: number   // 资源数量（另一个字段）
  resource_count?: number  // 资源数量（第三个字段）
  banner?: Array<{         // Banner图片数组
    img?: string
    https_domain?: string
    title?: string
    name?: string
    [key: string]: any
  }>
  element_content?: {
    id?: number
    format_id?: number
    type?: number
    remark?: string
    price?: number
    resources_num?: number
    study_num?: number
    [key: string]: any
  }
}

interface PageItem {
  content?: string
  vice_title?: string
  type: number
  height?: number
  num?: number
  content_area?: ContentItem[]
}

interface Props {
  data: PageItem[]
  maxItems?: number
  showNoData?: boolean
  showPriceInfo?: boolean
  showCollection?: boolean
  userInfo?: {
    uid?: string
    is_vip?: boolean
    [key: string]: any
  }
}

interface Emits {
  (event: 'click-callback', item: ContentItem): void
  (event: 'collection-callback', item: ContentItem): void
}

// ============================================================================
// 组件属性和事件
// ============================================================================
const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  maxItems: 20,
  showNoData: true,
  showPriceInfo: false,
  showCollection: false,
  userInfo: () => ({})
})

const emit = defineEmits<Emits>()

// ============================================================================
// 纯函数工具
// ============================================================================

/**
 * 截断文本到指定长度
 */
const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/**
 * 获取网格布局的CSS类
 */
const getGridClass = (num?: number): string => {
  switch (num) {
    case 2: return 'grid-2'
    case 3: return 'grid-3'
    case 4: return 'grid-4' 
    case 5: return 'grid-5'
    case 6: return 'grid-6'
    default: return 'grid-3'
  }
}

/**
 * 格式化标题（处理冒号分割）
 */
const formatTitle = (title: string): string => {
  if (!title) return ''
  const parts = title.split(/[:：]/)
  return parts[1] || parts[0]
}

/**
 * 格式化学习人数显示
 */
const formatStudyCount = (count: number): string => {
  if (!count) return '0人学习'
  if (count > 10000) {
    return `${(count / 10000).toFixed(1)}万人学习`
  }
  return `${count}人学习`
}

/**
 * 获取收藏图标
 */
const getCollectionIcon = (isCollected: boolean): string => {
  return isCollected 
    ? '/src/assets/images/common/star_07.png'
    : '/src/assets/images/common/star_03.png'
}

/**
 * 获取课时图标
 */
const getResourceIcon = (): string => {
  return '/src/assets/images/common/audio_ico_07.png'
}

/**
 * 获取学习人数图标
 */
const getStudyIcon = (): string => {
  return '/src/assets/images/common/audio_ico_10.png'
}

/**
 * 获取音频图标
 */
const getAudioIcon = (): string => {
  return '/src/assets/images/common/voice.png'
}

/**
 * 获取课程封面图片 - 完全参考coursecard的bgKey逻辑
 */
const getCoverImage = (item: ContentItem, cardType: string = 'normal'): string => {
  // 参考coursecard.vue的bgKey计算逻辑
  const bgKey = cardType === 'my-course' ? 'course_icon' : 'bgimg'
  
  // 获取主图片
  let primaryImage: string = ''
  if (bgKey === 'course_icon') {
    primaryImage = item.course_icon || ''
  } else {
    primaryImage = item.bgimg || ''
  }
  
  // 如果主图片不存在，按优先级查找其他图片源
  return primaryImage ||
         item.cover_img1 || 
         item.bgimg || 
         item.course_icon || 
         (item.banner && item.banner[0] && (item.banner[0].img || item.banner[0].https_domain)) ||
         'https://via.placeholder.com/280x160?text=No+Image'
}

/**
 * 新增：获取Banner图片
 */
const getBannerImage = (bannerItem: any): string => {
  if (bannerItem.img) {
    return bannerItem.img.replace(/[`'" ]/g, '').trim()
  }
  if (bannerItem.https_domain) {
    return bannerItem.https_domain.replace(/[`'" ]/g, '').trim()
  }
  return 'https://via.placeholder.com/1200x300?text=Banner'
}

/**
 * 新增：获取小卡片图片
 */
const getSmallCardImage = (contentItem: ContentItem): string => {
  return getCoverImage(contentItem)
}

/**
 * 判断是否显示价格区域（仅type=3时显示）
 */
const shouldShowPriceSection = (item: ContentItem): boolean => {
  return item.type === 3 && props.showPriceInfo
}

/**
 * 获取当前用户应显示的价格
 */
const getCurrentPrice = (item: ContentItem): number => {
  if (!props.userInfo?.is_vip) {
    return item.price || 0
  }
  return item.vip_price || item.price || 0
}

/**
 * 获取当前用户的原价
 */
const getOriginalPrice = (item: ContentItem): number => {
  if (!props.userInfo?.is_vip) {
    return item.original_price || 0
  }
  return item.original_vip_price || item.original_price || 0
}

/**
 * 判断是否显示VIP专属价标签
 */
const showVipPriceTag = (item: ContentItem): boolean => {
  return !!(item.vip_price && props.userInfo?.is_vip && item.type === 3)
}

/**
 * 判断是否显示VIP开通提示
 */
const showVipUpgradeTip = (item: ContentItem): boolean => {
  return !!(item.vip_price && !props.userInfo?.is_vip && item.type === 3)
}

/**
 * 判断是否显示VIP标签
 */
const showVipTip = (item: ContentItem): boolean => {
  return item.is_free === 1 || item.is_free === 2
}

/**
 * 判断内容是否被禁用（下架等）
 */
const isContentDisabled = (item: ContentItem): boolean => {
  return item.course_status === 2 || item.course_del === 2
}

// ============================================================================
// 响应式状态
// ============================================================================
const lastProcessedDataId = ref<string>('')

// ============================================================================
// 计算属性
// ============================================================================

/**
 * 处理后的数据 - 过滤和验证
 */
const processedData = computed<PageItem[]>(() => {
  if (!Array.isArray(props.data) || props.data.length === 0) {
    return []
  }
  
  return props.data.filter(item => {
    // 保留间隔、标题和有内容区域的项
    return item.type === 1 || 
           item.type === 2 || 
           (item.type === 3 && item.content_area && Array.isArray(item.content_area) && item.content_area.length > 0) ||
           (item.type === 4 && item.content_area && Array.isArray(item.content_area) && item.content_area.length > 0)
  })
})

/**
 * 数据唯一标识，用于防重复处理
 */
const dataId = computed<string>(() => {
  return `${props.data.length}-${Date.now()}`
})

// ============================================================================
// 事件处理函数
// ============================================================================

/**
 * 处理内容项点击 - 根据type进行不同的处理
 */
// const handleContentClick = (item: ContentItem): void => {
//   if (isContentDisabled(item)) {
//     console.warn('该课程已下架')
//     return
//   }
  
//   // 根据type进行不同处理
//   const { type, element_content: content } = item
  
//   switch (type) {
//     case 1: // 课程
//       if (content) {
//         const courseType = content.format_id === 1 ? 'video' : 'audio'
//         console.log(`跳转到${courseType}课程: ${content.id}`)
//         emit('click-callback', { ...item, courseType, action: 'course' })
//       }
//       break
      
//     case 2: // 专题
//       if (content) {
//         console.log(`跳转到专题: ${content.id}`)
//         emit('click-callback', { ...item, action: 'subject' })
//       }
//       break
      
//     case 3: // 链接
//       if (item.link_url) {
//         const url = item.link_url.trim()
//         if (/^(https?:)?\/\//i.test(url)) {
//           window.location.href = url
//         } else {
//           emit('click-callback', { ...item, action: 'link', url })
//         }
//       }
//       break
    
//     case 4: // 同步名师课堂
//       if (content) {
//         console.log(`跳转到同步名师课堂: ${content.id}`)
//         emit('click-callback', { ...item, action: 'synchronize-teacher' })
//       }
//       break

//     case 7: // 教师
//       if (content) {
//         console.log(`跳转到教师详情: ${content.id}`)
//         emit('click-callback', { ...item, action: 'teacher' })
//       }
//       break
      
//     case 8: // 自然观察类型 (type=4中的大横幅可能是这种类型)
//       if (content) {
//         console.log(`跳转到自然观察: ${content.id}`)
//         emit('click-callback', { ...item, action: 'nature-observation' })
//       }
//       break
      
//     default:
//       // 默认处理
//       emit('click-callback', item)
//   }
// }

/**
 * 处理收藏操作
 */
const handleCollection = (item: ContentItem): void => {
  emit('collection-callback', item)
}

/**
 * 处理图片加载错误
 */
const handleImageError = (event: Event): void => {
  const target = event.target as HTMLImageElement
  if (target) {
    target.src = 'https://via.placeholder.com/280x160?text=No+Image'
  }
}
/**
 * 新增：获取轮播图数据
 */
const getSwipeItems = (bannerItems: any[]): any[] => {
  return bannerItems.map(item => ({
    id: item.id,
    img: item.img ? item.img.replace(/[`'" ]/g, '').trim() : '',
    title: item.title || '',
    url: '', // 可以根据需要设置链接
    params: item.params || []
  }));
}

/**
 * 新增：处理轮播图变化
 */
const onSwipeChange = (index: number): void => {
  console.log('轮播图切换到:', index);
}

/**
 * 计算指定索引位置之前（包括当前位置）的标题元素数量
 * @param currentIndex 当前元素在processedData中的索引
 * @returns 标题元素的索引（从0开始）
 */
const getTitleIndex = (currentIndex: number): number => {
  let titleCount = 0
  
  // 遍历processedData，计算当前索引之前的标题元素数量
  for (let i = 0; i <= currentIndex; i++) {
    if (processedData.value[i]?.type === 1) {
      // 只有当元素是标题类型时才增加计数器
      if (i < currentIndex) {
        titleCount++
      } else {
        // 对于当前元素，直接返回计数器值（不增加，保持从0开始）
        return titleCount
      }
    }
  }
  
  return titleCount
}
// ============================================================================
// 外部状态同步
// ============================================================================

/**
 * 监听数据变化，防重复处理
 */
watch(dataId, (newId) => {
  if (newId === lastProcessedDataId.value) return
  lastProcessedDataId.value = newId
}, { immediate: true })

// ============================================================================
// 生命周期管理
// ============================================================================
onMounted(() => {
  // 组件挂载后的初始化
})

onUnmounted(() => {
  // 清理工作
})
</script>

<style lang="less" scoped>
@import "@/assets/styles/variables.less";

.auto-page {
  width: 100%;
  
  .content-section {
    margin-bottom: 0;
    
    .spacer {
      width: 100%;
    }
    
    .section-title {
      // margin: 20px 0;
      
      h3 {
        color: @text-white;
        font-size: 24px;
        font-weight: 600;
      }
      
      .vice-title {
        color: @text-white-70;
        font-size: 14px;
        margin: 0;
      }
    }
    
    
    // 网格布局区域样式
    .grid-section {
      // margin: 20px 0;
      
      .grid-container {
        display: grid;
        gap: 24px;

        &.grid-2 {
          grid-template-columns: repeat(2, 1fr);
        }
        &.grid-3 {
          grid-template-columns: repeat(3, 1fr);
        }
        
        &.grid-4 {
          grid-template-columns: repeat(4, 1fr);
        }
        
        &.grid-5 {
          grid-template-columns: repeat(5, 1fr);
        }

        &.grid-6 {
          grid-template-columns: repeat(6, 1fr);
        }
        
        .grid-card {
          background: @card-bg;
          border-radius: @card-small-radius;
          overflow: hidden;
          transition: @transition-normal;
          cursor: pointer;
          
          &:hover {
            background: @card-bg-hover;
            transform: translateY(-2px);
            box-shadow: @shadow-hover;
            
            .play-overlay {
              opacity: 1;
            }
          }
          
          &.disabled {
            opacity: 0.6;
            cursor: not-allowed;
            
            &:hover {
              transform: none;
              box-shadow: none;
            }
          }
          
          .card-image {
            position: relative;
            width: 100%;
            // height: 160px;
            overflow: hidden;
            
            img {
              width: 100%;
              height: 100%;
              object-fit: fill;
            }
            
            .vip-tip {
              position: absolute;
              top: 8px;
              right: 8px;
              z-index: 2;
              
              .free-tip {
                background: #52c41a;
                color: white;
                font-size: 11px;
                padding: 2px 6px;
                border-radius: 3px;
              }
              
              .vip-tip-label {
                background: #ff8529;
                color: white;
                font-size: 11px;
                padding: 2px 6px;
                border-radius: 3px;
              }
            }
            
            .audio-icon {
              position: absolute;
              bottom: 8px;
              right: 8px;
              width: 20px;
              height: 20px;
              z-index: 2;
            }
            
            .play-overlay {
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: rgba(0, 0, 0, 0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              opacity: 0;
              transition: @transition-fast;
              
              .play-button {
                width: 50px;
                height: 50px;
                background: rgba(0, 0, 0, 0.7);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 18px;
              }
            }
          }
          
          .card-info {
            padding: 15px;
            
            .card-title {
              color: @text-white;
              font-size: 14px;
              font-weight: 500;
              margin: 0 0 8px 0;
              .text-ellipsis();
            }
            
            .card-meta {
              display: flex;
              gap: 12px;
              margin-bottom: 8px;
              font-size: 12px;
              color: @text-white-70;
              
              .meta-item {
                display: flex;
                align-items: center;
                
                .meta-icon {
                  width: 12px;
                  height: 12px;
                  margin-right: 4px;
                }
              }
            }
            
            .price-info {
              margin: 8px 0;
              
              .vip-price-tag {
                margin-bottom: 4px;
                
                .vip-label {
                  background: #ff8529;
                  color: white;
                  font-size: 11px;
                  padding: 2px 6px;
                  border-radius: 3px;
                }
              }
              
              .discount-tip {
                margin-bottom: 4px;
                
                .discount-label {
                  background: #ff4a40;
                  color: white;
                  font-size: 11px;
                  padding: 2px 6px;
                  border-radius: 3px;
                }
              }
              
              .vip-tip-section {
                font-size: 11px;
                color: @text-white-70;
                margin-bottom: 4px;
                
                .vip-link {
                  color: @primary-color;
                  cursor: pointer;
                  margin-left: 4px;
                  
                  &:hover {
                    text-decoration: underline;
                  }
                }
              }
              
              .price-section {
                margin-bottom: 4px;
                
                .current-price {
                  color: #ff4a40;
                  font-weight: 600;
                  font-size: 16px;
                }
                
                .original-price {
                  color: @text-white-50;
                  font-size: 12px;
                  text-decoration: line-through;
                  margin-left: 8px;
                }
              }
              
              .buy-count {
                color: @text-white-70;
                font-size: 11px;
              }
            }
            
            .collection-section {
              display: flex;
              align-items: center;
              gap: 4px;
              margin-top: 8px;
              cursor: pointer;
              color: @text-white-70;
              font-size: 12px;
              
              .collection-icon {
                width: 16px;
                height: 16px;
              }
              
              &:hover {
                color: @text-white;
              }
            }
            
            .card-desc {
              color: @text-white-70;
              font-size: 12px;
              line-height: 1.4;
              margin: 0;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              overflow: hidden;
            }
          }
        }
      }
    }
  }
}

// 课程卡片通用样式
.course-card {
  .card-content,
  .card-info {
    .card-title {
      .text-ellipsis();
    }
  }
  
  .card-image {
    .card-banner {
      width: 100%;
      height: 160px;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }
}

// 响应式设计
@media (max-width: @desktop) {
  .auto-page {
    .content-section {
      
      .grid-section .grid-container {
        &.grid-3,
        &.grid-4,
        &.grid-5,
        &.grid-6 {
          grid-template-columns: repeat(2, 1fr);
        }
      }
    }
  }
}

@media (max-width: @tablet) {
  .auto-page {
    .content-section {
      
      .grid-section .grid-container {
        &.grid-3,
        &.grid-4,
        &.grid-5,
        &.grid-6 {
          grid-template-columns: 1fr;
        }
      }
    }
  }
}

// 新增：组合布局区域样式 (type 4)
.combo-section {

  .combo-layout {
    display: flex;
    gap: 24px;
    
    // Banner 容器（左侧）
    .banner-container {
      flex: 1; // 占据剩余空间
      min-width: 0; // 防止flex子元素溢出
    }
    
    // 课程卡片容器（右侧）
   .cards-container {
      flex: 1;
      min-width: 0;
      display: grid;
      grid-template-columns: repeat(2, 1fr); // 保持两列
      grid-template-rows: repeat(2, 1fr);    // 显式设置两行
      grid-auto-rows: auto;                  // 超出的行自动调整高度
      gap: 24px;
      
      // 使用 order 属性调整显示顺序
      .small-card:nth-child(1) { order: 1; } // 左上
      .small-card:nth-child(3) { order: 2; } // 右上
      .small-card:nth-child(2) { order: 3; } // 左下
      .small-card:nth-child(4) { order: 4; } // 右下
    }
    
    // 小卡片样式
    .small-card {
      background: @card-bg;
      border-radius: @card-small-radius;
      overflow: hidden;
      transition: all 0.3s ease;
      cursor: pointer;
      
      &:hover {
        background: @card-bg-hover;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
      
      .small-card-image {
        width: 100%;
        height: 108px;
        object-fit: fill;
      }
      
      .small-card-info {
        padding: 8px;
        
        .small-card-title {
          color: @text-white;
          font-size: 12px;
          font-weight: 500;
          margin: 0 0 4px 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .small-card-meta {
          color: @text-white-70;
          font-size: 10px;
        }
      }
    }
  }
}
 // 无数据提示
 .no-data {
    text-align: center;
    padding: 60px 20px;
    color: @text-white-70;
    font-size: 16px;
  }
// 响应式设计
@media (max-width: 768px) {
  .combo-layout {
    flex-direction: column !important;
    
    .banner-container,
    .cards-container {
      flex: none !important;
      width: 100%;
    }
    
    .cards-container {
      grid-template-columns: repeat(2, 1fr) !important;
    }
  }
}
</style>