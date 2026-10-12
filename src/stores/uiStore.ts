import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
}

let toastId = 0

export const useUiStore = defineStore('ui', () => {
  /** 桌機側欄是否收合為圖示列 */
  const sidebarCollapsed = ref(false)
  /** 手機選單（覆蓋式）是否打開；與桌機收合是兩件事，預設關閉 */
  const mobileNavOpen = ref(false)
  const globalLoading = ref(false)
  const toasts = ref<Toast[]>([])

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function setMobileNav(open: boolean) {
    mobileNavOpen.value = open
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
    mobileNavOpen,
    globalLoading,
    toasts,
    toggleSidebar,
    setMobileNav,
    showToast,
    setLoading,
  }
})
