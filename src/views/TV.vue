<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4 text-gray-800">电视剧</h1>
    
    <div class="grid grid-cols-2 gap-4">
      <div 
        v-for="show in tvShows" 
        :key="show.id"
        class="bg-white p-4 rounded-lg shadow-sm border"
        @click="viewShow(show)"
      >
        <h3 class="font-semibold text-gray-800">{{ show.name }}</h3>
        <p class="text-sm text-gray-600">{{ show.genre }}</p>
        <p class="text-xs text-gray-500 mt-2">{{ show.year }} · {{ show.seasons }}季</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { showToast } from 'vant'

interface TVShow {
  id: number
  name: string
  genre: string
  year: number
  seasons: number
}

const tvShows = ref<TVShow[]>([
  { id: 1, name: '权力的游戏', genre: '奇幻', year: 2011, seasons: 8 },
  { id: 2, name: '绝命毒师', genre: '犯罪', year: 2008, seasons: 5 },
  { id: 3, name: '老友记', genre: '喜剧', year: 1994, seasons: 10 },
  { id: 4, name: '生活大爆炸', genre: '喜剧', year: 2007, seasons: 12 },
  { id: 5, name: '纸牌屋', genre: '政治', year: 2013, seasons: 6 },
  { id: 6, name: '黑镜', genre: '科幻', year: 2011, seasons: 5 }
])

const viewShow = (show: TVShow) => {
  showToast(`查看电视剧: ${show.name}`)
}
</script>