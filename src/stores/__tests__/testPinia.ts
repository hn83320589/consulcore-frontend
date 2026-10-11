import { createApp } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { resettableStores } from '@/stores/plugins/resettable'

/**
 * 與 main.ts 相同的 Pinia 設定。plugin 只有在 pinia 安裝進 app 之後才會套用，
 * 所以測試也要掛一個空的 app，否則 setup store 沒有 $reset。
 */
export function setUpTestPinia() {
  const pinia = createPinia()
  pinia.use(resettableStores)
  createApp({}).use(pinia)
  setActivePinia(pinia)
  return pinia
}
