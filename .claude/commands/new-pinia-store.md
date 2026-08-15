# 建立新 Pinia Store

## 結構

位置：`frontend/src/stores/xxxStore.ts`

```typescript
import { ref } from 'vue'
import { defineStore } from 'pinia'
import { xxxService } from '@/services/xxxService'
import type { Xxx, CreateXxxDto, UpdateXxxDto } from '@/types/xxx'

export const useXxxStore = defineStore('xxx', () => {
  // ─── State ───
  const items = ref<Xxx[]>([])
  const currentItem = ref<Xxx | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // ─── Actions ───
  async function fetchItems(params?: Record<string, any>) {
    isLoading.value = true
    error.value = null
    try {
      items.value = await xxxService.getAll(params)
    } catch (e: any) {
      error.value = e.message
    } finally {
      isLoading.value = false
    }
  }

  async function fetchById(id: number) {
    isLoading.value = true
    error.value = null
    try {
      currentItem.value = await xxxService.getById(id)
    } catch (e: any) {
      error.value = e.message
    } finally {
      isLoading.value = false
    }
  }

  async function create(dto: CreateXxxDto) {
    isLoading.value = true
    error.value = null
    try {
      const created = await xxxService.create(dto)
      items.value.push(created)
      return created
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function update(id: number, dto: UpdateXxxDto) {
    isLoading.value = true
    error.value = null
    try {
      const updated = await xxxService.update(id, dto)
      const idx = items.value.findIndex(i => i.id === id)
      if (idx !== -1) items.value[idx] = updated
      if (currentItem.value?.id === id) currentItem.value = updated
      return updated
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function remove(id: number) {
    isLoading.value = true
    error.value = null
    try {
      await xxxService.delete(id)
      items.value = items.value.filter(i => i.id !== id)
      if (currentItem.value?.id === id) currentItem.value = null
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      isLoading.value = false
    }
  }

  // ─── Getters (computed) ───
  // 依業務需求加入

  return {
    items, currentItem, isLoading, error,
    fetchItems, fetchById, create, update, remove
  }
})
```

## 對應的 Service

位置：`frontend/src/services/xxxService.ts`

```typescript
import { httpService } from './httpService'
import type { Xxx, CreateXxxDto, UpdateXxxDto } from '@/types/xxx'

const BASE = '/xxx'  // 對應後端 API 路由（不含 /api 前綴，httpService 已設定 baseURL）

export const xxxService = {
  getAll: (params?: Record<string, any>) =>
    httpService.get<Xxx[]>(BASE, { params }),

  getById: (id: number) =>
    httpService.get<Xxx>(`${BASE}/${id}`),

  create: (dto: CreateXxxDto) =>
    httpService.post<Xxx>(BASE, dto),

  update: (id: number, dto: UpdateXxxDto) =>
    httpService.put<Xxx>(`${BASE}/${id}`, dto),

  delete: (id: number) =>
    httpService.delete(`${BASE}/${id}`),
}
```

## 對應的 Type

位置：`frontend/src/types/xxx.ts`

```typescript
export interface Xxx {
  id: number
  // 所有 ResponseDto 欄位
  createdAt: string
  updatedAt: string
}

export interface CreateXxxDto {
  // 新增時的輸入欄位
}

export interface UpdateXxxDto {
  // 更新時的輸入欄位（全部 optional）
}
```

## 持久化

只有 `authStore` 需要持久化（token + activeRole）。其他 Store 不持久化，進入頁面時重新 fetch。

```typescript
// 僅 authStore 加入
export const useAuthStore = defineStore('auth', () => {
  // ...
}, {
  persist: {
    paths: ['token', 'user', 'activeRole']  // 只持久化特定欄位
  }
})
```

## 檢查清單

- [ ] Store 用 Composition API 寫法（setup function）
- [ ] isLoading / error 狀態完整管理
- [ ] Action 中 try-catch-finally 完整
- [ ] 對應 Service 已建立
- [ ] 對應 Type 已定義
- [ ] 不含 UI 邏輯（顯示/隱藏/導航等不放 Store）
