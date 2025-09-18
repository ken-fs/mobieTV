import type { Component } from 'vue'

export interface RouteConfig {
  path: string
  name: string
  component: Component | (() => Promise<Component>)
  meta?: {
    title?: string
    icon?: string
    requiresAuth?: boolean
    showInNav?: boolean
  }
  children?: RouteConfig[]
}

export interface NavigationItem {
  name: string
  path: string
  title: string
  icon: string
}