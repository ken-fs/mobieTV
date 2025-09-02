<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4 text-gray-800">电影</h1>
    
    <van-cell-group>
      <van-cell 
        v-for="movie in movies" 
        :key="movie.id"
        :title="movie.title"
        :value="`${movie.year} · ⭐ ${movie.rating}`"
        is-link
        @click="viewMovie(movie)"
      />
    </van-cell-group>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { showToast } from 'vant'
import type { Movie } from '@/types'

const movies = ref<Movie[]>([
  { id: 1, title: '星际穿越', poster: '', year: 2014, rating: 9.3 },
  { id: 2, title: '盗梦空间', poster: '', year: 2010, rating: 9.3 },
  { id: 3, title: '阿凡达', poster: '', year: 2009, rating: 8.8 },
  { id: 4, title: '复仇者联盟', poster: '', year: 2012, rating: 8.1 },
  { id: 5, title: '泰坦尼克号', poster: '', year: 1997, rating: 9.5 },
  { id: 6, title: '教父', poster: '', year: 1972, rating: 9.3 }
])

const viewMovie = (movie: Movie) => {
  showToast(`查看电影: ${movie.title}`)
}
</script>