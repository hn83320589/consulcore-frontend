# Sprint 1 — 前端：帳號與組織

## 目標
完善登入流程、多角色切換、人員管理、角色權限矩陣。

## 前置
後端 Sprint 1 完成後，以下 API 可用：
- POST /api/auth/login → { token, user, roles[] }
- POST /api/auth/register
- GET /api/auth/me
- PUT /api/auth/change-password
- GET/POST/PUT/DELETE /api/users
- GET /api/roles, PUT /api/roles/{id}/permissions

## 頁面

### LoginView.vue（完善）
- 帳號密碼表單 → authStore.login()
- 成功：單角色直接跳轉、多角色跳 /select-role
- 錯誤提示（帳密錯誤、帳號停用）

### RoleSelectView.vue（完善）
- authStore.roles 渲染角色卡片（圖示+名稱+機構名）
- 點擊 → authStore.switchRole() → 跳轉

### RoleSwitcher.vue（components/layout/）
- 頂列右側下拉，顯示可切換角色
- 切換不需重新登入

### views/admin/StaffManageView.vue
- 人員列表 AppTable：姓名、角色、狀態、固定診間、操作
- 新增人員 AppModal：基本資料 + 角色下拉 + 診間下拉（心理師時）
- 編輯、停用、重設密碼

### 角色權限矩陣（StaffManageView 子頁或 Tab）
- 橫軸模組、縱軸操作的勾選表格
- 系統預設角色不可刪除（按鈕 disabled）
- 儲存後即時生效

### AdminSidebar.vue（完善）
- 依 authStore.permissions 動態顯示選單
- 目前顯示：Dashboard、人員管理

## Store / Service / Type
- authStore 完善（login/logout/switchRole/hasPermission）
- staffStore（users CRUD + roles）
- authService, staffService
- types/auth.ts, types/user.ts, types/role.ts

## 交付標準
- [ ] 登入 → 取得 token → 依角色進入對應 Dashboard
- [ ] 多角色帳號可選擇身份
- [ ] RoleSwitcher 頂列切換正常
- [ ] 人員 CRUD + 停用 + 重設密碼
- [ ] 權限矩陣勾選保存
- [ ] AdminSidebar 依權限動態顯示
