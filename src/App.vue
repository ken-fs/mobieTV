<template>
  <div class="min-h-screen bg-gray-50">
    <router-view />
    <TabBar />
  </div>
</template>

<script setup lang="ts">
import TabBar from '@/components/TabBar.vue'
</script>