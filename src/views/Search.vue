<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4 text-gray-800">搜索</h1>
    
    <van-search 
      v-model="searchValue" 
      placeholder="搜索电影、电视剧..."
      @search="onSearch"
      @clear="onClear"
    />
    
    <div v-if="searchResults.length > 0" class="mt-4">
      <h2 class="text-lg font-semibold mb-3 text-gray-700">搜索结果</h2>
      <van-cell-group>
        <van-cell 
          v-for="result in searchResults" 
          :key="result.id"
          :title="result.title"
          :label="result.type"
          is-link
          @click="viewDetail(result)"
        />
      </van-cell-group>
    </div>
    
    <div v-else-if="hasSearched" class="mt-8 text-center text-gray-500">
      <p>未找到相关内容</p>
    </div>
    
    <div v-else class="mt-8">
      <h2 class="text-lg font-semibold mb-3 text-gray-700">热门搜索</h2>
      <van-tag 
        v-for="tag in hotTags" 
        :key="tag"
        type="primary" 
        plain 
        size="medium"
        class="mr-2 mb-2"
        @click="searchValue = tag"
      >
        {{ tag }}
      </van-tag>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { showToast } from 'vant'

interface SearchResult {
  id: number
  title: string
  type: string
}

const searchValue = ref('')
const searchResults = ref<SearchResult[]>([])
const hasSearched = ref(false)

const hotTags = ref([
  '星际穿越', '权力的游戏', '复仇者联盟', '老友记', 
  '泰坦尼克号', '绝命毒师', '阿凡达', '生活大爆炸'
])

const mockData: SearchResult[] = [
  { id: 1, title: '星际穿越', type: '电影' },
  { id: 2, title: '权力的游戏', type: '电视剧' },
  { id: 3, title: '复仇者联盟', type: '电影' },
  { id: 4, title: '老友记', type: '电视剧' }
]

const onSearch = () => {
  hasSearched.value = true
  searchResults.value = mockData.filter(item => 
    item.title.includes(searchValue.value)
  )
}

const onClear = () => {
  searchValue.value = ''
  searchResults.value = []
  hasSearched.value = false
}

const viewDetail = (result: SearchResult) => {
  showToast(`查看详情: ${result.title}`)
}
</script>