import type { PiniaPluginContext, StateTree } from 'pinia'

// 初始 state 只有空陣列、null、布林、字串，JSON 複製即可
// （structuredClone 無法複製 Vue 的 reactive proxy，toRaw 也只解開最外層）
function cloneState(state: StateTree): StateTree {
  return JSON.parse(JSON.stringify(state)) as StateTree
}

/**
 * 讓 setup store 也有 $reset()：記下建立時的初始 state，重置時還原。
 * （Pinia 內建的 $reset 只支援 options store，setup store 呼叫會直接拋錯）
 */
export function resettableStores({ store }: PiniaPluginContext) {
  const initial = cloneState(store.$state)
  store.$reset = () => {
    store.$patch((state) => {
      Object.assign(state, cloneState(initial))
    })
  }
}
