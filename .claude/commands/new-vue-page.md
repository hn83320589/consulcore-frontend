# 建立新 Vue 頁面

## 步驟

### 1. 建立 View 檔案

位置依角色決定：
- 機構後台：`src/views/admin/XxxView.vue`
- 個案端：`src/views/client/XxxView.vue`

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useXxxStore } from '@/stores/xxxStore'

const store = useXxxStore()

onMounted(async () => {
  await store.fetchItems()
})
</script>

<template>
  <div class="page-container">
    <h1 class="page-title">頁面標題</h1>
    <!-- 內容 -->
  </div>
</template>
```

### 2. 註冊路由（`src/router/index.ts`）

```typescript
// 機構後台路由（在 AdminLayout children 下）
{
  path: 'xxx',
  name: 'admin-xxx',
  component: () => import('@/views/admin/XxxView.vue'),
  meta: { title: '頁面標題', permission: 'xxx.view' }  // 角色由父層 meta.roles 處理；permission 必填（測試會檢查）
}

// 個案端路由（在 ClientLayout children 下）
{
  path: 'xxx',
  name: 'client-xxx',
  component: () => import('@/views/client/XxxView.vue'),
  meta: { title: '頁面標題' }  // 父層 ClientLayout 已設 meta.roles: ['client']
}
```

### 3. 加入側欄選單（如需要）

在 `AdminSidebar.vue` 的選單配置中加入對應項目。顯示與否由該路由的 `meta.permission` 決定，選單項目不需再寫權限：

```typescript
{
  label: '選單名稱',
  icon: 'icon-name',
  path: '/admin/xxx',
}
```

## 頁面模式

### 列表頁（常見模式）
```
┌─ 頁面標題 ──────────────────── [新增按鈕] ─┐
├─ 篩選列：搜尋框 + 狀態下拉 + 日期區間      │
├─ AppTable                                   │
│  欄位 | 欄位 | 欄位 | 操作                  │
├─ 分頁                                       │
└──────────────────────────────────────────────┘
```

### 詳情頁（Tab 切換）
```
┌─ 返回按鈕 ── 標題 ── 狀態標籤 ─────────────┐
├─ AppTabs: [Tab1] [Tab2] [Tab3]              │
├─ Tab 內容區域                                │
└──────────────────────────────────────────────┘
```

### 編輯頁
```
┌─ 頁面標題 ──────────────────────────────────┐
├─ 表單欄位                                    │
├─ ─────────────────────────────────────────── │
├─ [取消] [暫存] [送出]                        │
└──────────────────────────────────────────────┘
```

## 風格注意

- 機構後台（AdminLayout）：專業藍灰、緊湊佈局、高資訊密度
- 個案端（ClientLayout）：暖色系、寬鬆間距、大字體、溫暖語氣
- 共用元件（AppButton, AppTable 等）透過 CSS 變數自動適應
- 不要在元件內寫死顏色，用 `var(--color-primary)` 等變數

## 檢查清單

- [ ] View 放在正確的資料夾（admin/ 或 client/）
- [ ] 路由已註冊在正確的 Layout 之下，後台頁面有 `meta.permission`
- [ ] 側欄選單已加入（機構後台頁面）
- [ ] 使用對應的 Pinia Store，不直接呼叫 API
- [ ] TypeScript 型別完整定義
- [ ] 使用 CSS 變數而非寫死顏色
