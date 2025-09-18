import { ref, Ref } from 'vue'
import http from '@/http'
import type { HttpService } from '@/http'

interface UseHttpOptions {
  immediate?: boolean
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
}

interface UseHttpReturn<T> {
  data: Ref<T | null>
  loading: Ref<boolean>
  error: Ref<any>
  execute: (params?: any) => Promise<void>
}

export function useHttp<T = any>(
  url: string,
  options: UseHttpOptions = {}
): UseHttpReturn<T> {
  const data = ref<T | null>(null)
  const loading = ref(false)
  const error = ref<any>(null)

  const execute = async (params?: any) => {
    loading.value = true
    error.value = null

    try {
      const result = await http.$post<T>(url, params)
      data.value = result
      options.onSuccess?.(result)
    } catch (err) {
      error.value = err
      options.onError?.(err)
      http.handleError(err)
    } finally {
      loading.value = false
    }
  }

  if (options.immediate) {
    execute()
  }

  return {
    data,
    loading,
    error,
    execute
  }
}

export function useHttpGet<T = any>(
  url: string,
  options: UseHttpOptions = {}
): UseHttpReturn<T> {
  const data = ref<T | null>(null)
  const loading = ref(false)
  const error = ref<any>(null)

  const execute = async (params?: any) => {
    loading.value = true
    error.value = null

    try {
      const result = await http.get<T>(url, params)
      data.value = result
      options.onSuccess?.(result)
    } catch (err) {
      error.value = err
      options.onError?.(err)
      http.handleError(err)
    } finally {
      loading.value = false
    }
  }

  if (options.immediate) {
    execute()
  }

  return {
    data,
    loading,
    error,
    execute
  }
}

export default {
  useHttp,
  useHttpGet,
  http: http as HttpService
}