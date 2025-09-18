<template>
  <div class="learning-container">
    <nav-bar />

    <!-- 内容区域 -->
    <router-view />
  </div>
</template>

<script setup lang="ts">
import NavBar from '@/components/layout/NavBar.vue'
</script>

<style scoped lang="less">
.learning-container {
  min-height: 100vh;
  background: @background-gradient;
  display: flex;
  flex-direction: column;
}

</style>