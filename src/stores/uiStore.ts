import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
}

let toastId = 0

export const useUiStore = defineStore('ui', () => {
  const sidebarCollapsed = ref(false)
  const globalLoading = ref(false)
  const toasts = ref<Toast[]>([])

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function showToast(message: string, type: Toast['type'] = 'info') {
    const id = ++toastId
    toasts.value.push({ id, message, type })
    setTimeout(() => {
      toasts.value = toasts.value.filter((t) => t.id !== id)
    }, 4000)
  }

  function setLoading(val: boolean) {
    globalLoading.value = val
  }

  return {
    sidebarCollapsed,
    globalLoading,
    toasts,
    toggleSidebar,
    showToast,
    setLoading,
  }
})
