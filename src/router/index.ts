import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { routeConfigs } from './routes'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = routeConfigs.map(config => ({
  path: config.path,
  name: config.name,
  component: config.component,
  meta: config.meta,
  children: config.children?.map(child => ({
    path: child.path,
    name: child.name,
    component: child.component,
    meta: child.meta
  }))
}))

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = `${to.meta?.title || 'MobieTV'} - MobieTV`
  
  // 获取认证store
  const authStore = useAuthStore()
  
  // 检查路由是否需要认证
  const requiresAuth = to.meta?.requiresAuth !== false
  
  // 如果需要认证但未登录
  if (requiresAuth && !authStore.isAuthenticated) {
    // 保存当前路径作为重定向目标
    const redirect = to.fullPath
    next({
      name: 'login',
      query: redirect !== '/login' ? { redirect } : {}
    })
    return
  }
  
  // 如果已登录但访问登录页，重定向到首页
  if (to.name === 'login' && authStore.isAuthenticated) {
    next({ name: 'home' })
    return
  }
  
  next()
})

export default router