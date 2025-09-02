<template>
  <van-tabbar 
    v-model="activeTab" 
    @change="handleTabChange"
    fixed
    placeholder
  >
    <van-tabbar-item
      v-for="item in navigationItems"
      :key="item.name"
      :name="item.name"
      :icon="getIconName(item.icon)"
    >
      {{ item.title }}
    </van-tabbar-item>
  </van-tabbar>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { navigationItems } from '@/router/routes'

const router = useRouter()
const route = useRoute()

const activeTab = ref(route.name as string)

const iconMap: Record<string, string> = {
  home: 'home-o',
  video: 'video-o',
  tv: 'tv-o',
  search: 'search',
  user: 'user-o'
}

const getIconName = (icon: string) => {
  return iconMap[icon] || 'home-o'
}

const handleTabChange = (name: string | number) => {
  const targetRoute = navigationItems.find(item => item.name === name)
  if (targetRoute) {
    router.push(targetRoute.path)
  }
}

watch(() => route.name, (newName) => {
  if (newName) {
    activeTab.value = newName as string
  }
}, { immediate: true })
</script>