<!--
  Picture 组件 - 支持 WebP 格式优先加载的图片组件
  
  功能特性:
  - 优先使用 WebP 格式图片以提升性能和减少带宽
  - 自动回退到原格式图片作为兜底方案
  - 支持路径带扩展名或不带扩展名的情况
  - 支持懒加载和立即加载模式
  - 提供加载成功和失败的事件回调
  
  使用示例:
  <Picture 
    src="/images/example" 
    alt="示例图片"
    img-class="w-full h-auto"
    loading="lazy"
    @load="handleLoad"
    @error="handleError"
  />
-->
<template>
  <picture :class="containerClass">
    <!-- WebP 格式作为首选 -->
    <source :srcset="webpSrc" type="image/webp" />
    <!-- 原格式作为兜底方案 -->
    <img
      :src="fallbackSrc"
      :alt="alt"
      :class="imgClass"
      :loading="loading"
      @load="onLoad"
      @error="onError"
    />
  </picture>
</template>

<script setup lang="ts">
import { computed } from 'vue'

/**
 * 组件属性接口定义
 */
interface Props {
  /** 图片源路径，支持带或不带扩展名 */
  src: string
  /** 图片替代文本 */
  alt?: string
  /** picture 容器的 CSS 类名 */
  containerClass?: string
  /** img 标签的 CSS 类名 */
  imgClass?: string
  /** 图片加载策略：lazy(懒加载) 或 eager(立即加载) */
  loading?: 'lazy' | 'eager'
}

/**
 * 组件事件接口定义
 */
interface Emits {
  /** 图片加载成功时触发 */
  (e: 'load', event: Event): void
  /** 图片加载失败时触发 */
  (e: 'error', event: Event): void
}

// 组件属性默认值配置
const props = withDefaults(defineProps<Props>(), {
  alt: '',
  containerClass: '',
  imgClass: '',
  loading: 'lazy'
})

// 事件发射器
const emit = defineEmits<Emits>()

/**
 * 生成 WebP 格式的图片路径
 * 逻辑：
 * - 如果原路径无扩展名，直接添加 .webp
 * - 如果原路径有扩展名，替换为 .webp
 */
const webpSrc = computed(() => {
  if (!props.src) return ''
  
  const lastDotIndex = props.src.lastIndexOf('.')
  if (lastDotIndex === -1) return props.src + '.webp'
  
  return props.src.substring(0, lastDotIndex) + '.webp'
})

/**
 * 生成兜底图片路径
 * 逻辑：
 * - 如果原路径无扩展名，添加 .png 作为默认格式
 * - 如果原路径有扩展名，使用原路径
 */
const fallbackSrc = computed(() => {
  if (!props.src) return ''
  
  const lastDotIndex = props.src.lastIndexOf('.')
  if (lastDotIndex === -1) return props.src + '.png'
  
  return props.src
})

/**
 * 图片加载成功事件处理
 */
const onLoad = (event: Event) => {
  emit('load', event)
}

/**
 * 图片加载失败事件处理
 */
const onError = (event: Event) => {
  emit('error', event)
}
</script>