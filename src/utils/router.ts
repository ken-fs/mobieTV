import { useRouter } from 'vue-router'
import type { NavigationItem } from '@/types/router'

export const useAppRouter = () => {
  const router = useRouter()

  const navigateTo = (path: string) => {
    router.push(path)
  }

  const navigateToRoute = (name: string, params?: Record<string, any>) => {
    router.push({ name, params })
  }

  const goBack = () => {
    router.back()
  }

  const goForward = () => {
    router.forward()
  }

  const replace = (path: string) => {
    router.replace(path)
  }

  return {
    navigateTo,
    navigateToRoute,
    goBack,
    goForward,
    replace
  }
}