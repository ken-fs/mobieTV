<template>
  <div class="p-4 bg-gradient-to-b from-blue-50 to-white min-h-screen">
    <h1 class="text-3xl font-bold text-center mb-8 text-gray-800">MobieTV</h1>
    
    <div class="bg-white p-4 rounded-lg shadow-sm mb-6">
      <h2 class="text-lg font-semibold mb-3 text-gray-700">推荐电影</h2>
      <div class="grid grid-cols-2 gap-3">
        <div v-for="movie in movies" :key="movie.id" 
             class="bg-gray-100 p-3 rounded-lg">
          <h3 class="font-medium text-sm">{{ movie.title }}</h3>
          <p class="text-xs text-gray-500">{{ movie.year }} · ⭐ {{ movie.rating }}</p>
        </div>
      </div>
    </div>

    <div class="text-center space-y-3">
      <van-button type="primary" size="large" class="w-full">开始探索</van-button>
      <van-button type="default" size="large" class="w-full">查看更多</van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Movie } from '@/types'

const movies = ref<Movie[]>([
  { id: 1, title: '星际穿越', poster: '', year: 2014, rating: 9.3 },
  { id: 2, title: '盗梦空间', poster: '', year: 2010, rating: 9.3 },
  { id: 3, title: '阿凡达', poster: '', year: 2009, rating: 8.8 },
  { id: 4, title: '复仇者联盟', poster: '', year: 2012, rating: 8.1 }
])
</script>