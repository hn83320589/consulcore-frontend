# 建立新 Pinia Store

## 結構

位置：`src/stores/xxxStore.ts`

```typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'
import xxxService from '@/services/xxxService'
import type { Xxx, CreateXxxRequest, UpdateXxxRequest } from '@/types'

export const useXxxStore = defineStore('xxx', () => {
  const items = ref<Xxx[]>([])
  const currentItem = ref<Xxx | null>(null)
  const loading = ref(false)

  // 錯誤不在 Store 攔：httpService 攔截器已統一顯示 toast，例外照常往上拋給呼叫端
  async function fetchItems() {
    loading.value = true
    try {
      items.value = await xxxService.getXxxs()
    } finally {
      loading.value = false
    }
  }

  async function createXxx(payload: CreateXxxRequest) {
    loading.value = true
    try {
      const created = await xxxService.createXxx(payload)
      items.value.push(created)
      return created
    } finally {
      loading.value = false
    }
  }

  async function updateXxx(id: number, payload: UpdateXxxRequest) {
    loading.value = true
    try {
      const updated = await xxxService.updateXxx(id, payload)
      const idx = items.value.findIndex(i => i.id === id)
      if (idx !== -1) items.value[idx] = updated
      if (currentItem.value?.id === id) currentItem.value = updated
      return updated
    } finally {
      loading.value = false
    }
  }

  return { items, currentItem, loading, fetchItems, createXxx, updateXxx }
})
```

## 對應的 Service

位置：`src/services/xxxService.ts`

```typescript
import httpService from './httpService'
import type { Xxx, CreateXxxRequest, UpdateXxxRequest } from '@/types'

const xxxService = {
  getXxxs(): Promise<Xxx[]> {
    return httpService.get<Xxx[]>('/xxx')  // 不含 /api 前綴，httpService 已設定 baseURL
  },
  createXxx(payload: CreateXxxRequest): Promise<Xxx> {
    return httpService.post<Xxx>('/xxx', payload)
  },
  updateXxx(id: number, payload: UpdateXxxRequest): Promise<Xxx> {
    return httpService.put<Xxx>(`/xxx/${id}`, payload)
  },
}

export default xxxService
```

## 對應的 Type

位置：`src/types/xxx.ts`（並從 `src/types/index.ts` re-export，使用端一律 `from '@/types'`）

```typescript
export interface Xxx {
  id: number
  // 所有 ResponseDto 欄位
  createdAt: string
  updatedAt: string
}

export interface CreateXxxRequest {
  // 新增時的輸入欄位
}

export interface UpdateXxxRequest {
  // 更新時的輸入欄位（全部 optional）
}
```

## 持久化

只有 `authStore` 需要持久化。其他 Store 不持久化，進入頁面時重新 fetch。

```typescript
// 僅 authStore 加入
export const useAuthStore = defineStore('auth', () => {
  // ...
}, {
  persist: {
    pick: ['token', 'user', 'roles', 'activeRole', 'mustChangePassword']  // plugin v4 用 pick
  }
})
```

## 檢查清單

- [ ] Store 用 Composition API 寫法（setup function）
- [ ] loading 以 try/finally 管理；錯誤交給 httpService 攔截器，不在 Store 吞掉
- [ ] 對應 Service 已建立
- [ ] 對應 Type 已定義
- [ ] 不含 UI 邏輯（顯示/隱藏/導航等不放 Store）
