import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'

/**
 * 有未存檔內容時阻止離開：
 * - 站內換頁：暫停導航，交給頁面顯示確認視窗（confirmLeave / cancelLeave 決定去留）
 * - 關閉或重新整理分頁：觸發瀏覽器內建的離開確認（無法自訂內容）
 */
export function useLeaveGuard(isDirty: () => boolean) {
  const resolvePending = ref<((leave: boolean) => void) | null>(null)

  onBeforeRouteLeave(() => {
    if (!isDirty()) return true
    return new Promise<boolean>((resolve) => {
      resolvePending.value = resolve
    })
  })

  function onBeforeUnload(event: BeforeUnloadEvent) {
    if (isDirty()) event.preventDefault()
  }
  onMounted(() => window.addEventListener('beforeunload', onBeforeUnload))
  onBeforeUnmount(() => window.removeEventListener('beforeunload', onBeforeUnload))

  function settle(leave: boolean) {
    resolvePending.value?.(leave)
    resolvePending.value = null
  }

  return {
    leavePending: computed(() => resolvePending.value !== null),
    confirmLeave: () => settle(true),
    cancelLeave: () => settle(false),
  }
}
