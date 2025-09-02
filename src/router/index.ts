import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { routeConfigs } from './routes'

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
  document.title = `${to.meta?.title || 'MobieTV'} - MobieTV`
  next()
})

export default router