import type { RouteConfig } from '@/types/router'

export const routeConfigs: RouteConfig[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/Home.vue'),
    meta: {
      title: '首页',
      icon: 'home',
      showInNav: true
    }
  },
  {
    path: '/movies',
    name: 'movies',
    component: () => import('@/views/Movies.vue'),
    meta: {
      title: '电影',
      icon: 'video',
      showInNav: true
    }
  },
  {
    path: '/tv',
    name: 'tv',
    component: () => import('@/views/TV.vue'),
    meta: {
      title: '电视剧',
      icon: 'tv',
      showInNav: true
    }
  },
  {
    path: '/search',
    name: 'search',
    component: () => import('@/views/Search.vue'),
    meta: {
      title: '搜索',
      icon: 'search',
      showInNav: true
    }
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/Profile.vue'),
    meta: {
      title: '我的',
      icon: 'user',
      showInNav: true
    }
  }
]

export const navigationItems = routeConfigs
  .filter(route => route.meta?.showInNav)
  .map(route => ({
    name: route.name,
    path: route.path,
    title: route.meta?.title || route.name,
    icon: route.meta?.icon || 'default'
  }))