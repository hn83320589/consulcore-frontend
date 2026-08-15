# Sprint 0 — 前端：專案初始化

## 目標
建立 Vue 3 SPA 骨架：雙風格 Layout、httpService 攔截器、authStore、路由守衛、空殼頁面。

---

## 任務

### 1. 建立專案
```bash
npm create vite@latest . -- --template vue-ts
npm install pinia pinia-plugin-persistedstate axios vue-router@4
npm install -D tailwindcss @tailwindcss/vite
```

### 2. Tailwind 設定
- tailwind.config.js 基礎設定
- 不定義固定色彩主題，色彩走 CSS 變數

### 3. CSS 變數（src/styles/variables.css）
```css
:root {
  /* AdminLayout 預設 */
  --color-primary: #2C5F8A;
  --color-primary-hover: #1E4A6E;
  --color-bg: #F5F7FA;
  --color-text: #1F2937;
  --border-radius: 6px;
  --spacing-unit: 0.75rem;
  --font-size-base: 14px;
}

.client-theme {
  --color-primary: #E8A87C;
  --color-primary-hover: #D4956A;
  --color-bg: #FFF8F0;
  --color-text: #4A3728;
  --border-radius: 12px;
  --spacing-unit: 1.25rem;
  --font-size-base: 16px;
}
```

### 4. httpService（src/services/httpService.ts）
- Axios 單例，baseURL = import.meta.env.VITE_API_BASE_URL
- 請求攔截器：注入 Authorization + X-Active-Role + X-Organization-Id
- 回應攔截器：401 清 token 導 /login、403 toast、統一解包 .data
- 泛型封裝：get<T>, post<T>, put<T>, delete<T>

### 5. authStore（src/stores/authStore.ts）
```typescript
state:
  token: string | null
  user: User | null
  roles: UserRole[]
  activeRole: string | null  // 'owner' | 'therapist' | 'admin' | 'client'
  permissions: string[]

actions:
  login(username, password) → 呼叫 authService → 儲存 token/user/roles
  logout() → 清除全部 → 導向 /login
  switchRole(role) → 設定 activeRole → 導向對應 Dashboard
  hasPermission(code) → 檢查 permissions 陣列

persist: ['token', 'user', 'roles', 'activeRole']
```

### 6. Router（src/router/index.ts）
- /login → LoginView
- /select-role → RoleSelectView
- /admin → AdminLayout（children 先放 dashboard 空殼）
- /client → ClientLayout（children 先放 dashboard 空殼）
- beforeEach 守衛：未登入→login、多角色未選→select-role、權限檢查

### 7. Layout 骨架

**AdminLayout.vue**
- 左側 sidebar（AdminSidebar 空殼，選單項預留）
- 頂列：麵包屑預留 + 右側 RoleSwitcher 預留 + NotificationBell 預留
- 主內容區 <router-view />
- 專業藍灰色系

**ClientLayout.vue**
- 頂部 navbar（ClientNavbar）
- 主內容區
- 溫暖風格（套用 .client-theme class）

### 8. 空殼頁面

**LoginView.vue**
- 帳號密碼表單
- 呼叫 authStore.login()
- 登入成功：單一角色直接跳轉，多角色跳 /select-role

**RoleSelectView.vue**
- 從 authStore.roles 取角色列表
- 卡片式顯示，點擊選擇

**views/admin/DashboardView.vue**
- 空殼：顯示「歡迎，{username}，角色：{activeRole}」

**views/client/ClientDashboardView.vue**
- 空殼：溫暖風格歡迎訊息

### 9. 環境變數
```
# .env.development
VITE_API_BASE_URL=http://localhost:5037/api
```

---

## 交付標準
- [ ] npm run dev 成功啟動 (http://localhost:5173)
- [ ] 登入頁顯示正常
- [ ] httpService 攔截器設定完成（可在 console 確認 header 注入）
- [ ] 雙 Layout 骨架可切換（手動改 URL /admin vs /client）
- [ ] 個案端溫暖風格、後台專業風格各自正確
- [ ] TypeScript 無報錯（npm run type-check）
- [ ] 路由守衛運作（未登入自動跳 /login）
