# Sprint 2 — 前端：個案與同意書

## 前置 API
- /api/client-profiles：CRUD + assign/transfer/search
- /api/consent-templates：CRUD
- /api/consent-records：sign/void/list

## 頁面

### views/admin/ClientListView.vue
- AppTable：姓名、狀態、心理師、最近預約、建檔日
- 搜尋：姓名 / 身分證末四碼
- 篩選：狀態、心理師
- 新增個案 AppModal：基本資料表單 + 是否建帳號 checkbox

### views/admin/ClientDetailView.vue
- AppTabs（6 tabs，先完成 Tab 1，其他放骨架）
- Tab 1 基本資料：ClientInfoCard（可編輯）+ 心理師指派 + 狀態操作 + 同意書簽署狀態列表

### views/admin/ConsentManageView.vue
- 左右分欄：範本列表 | 範本編輯（標題+富文本+觸發事件+版本號）
- 下方：簽署紀錄查詢（篩選+列表+查看快照/簽名圖）

### views/client/ClientConsentView.vue
- 已簽署同意書列表，點擊查看快照

## 元件
- SignaturePad.vue（signature_pad wrapper，Canvas + 清除 + 確認，輸出 base64）
- ClientInfoCard.vue（14 欄位卡片，可切換檢視/編輯）
- ConsentStatus.vue（簽署狀態列表）
- ClientSearchBar.vue

## Store / Service / Type
- clientStore, consentStore
- clientService, consentService
- types/client.ts, types/consent.ts

## AdminSidebar 更新
加入：個案管理、同意書管理

## 交付標準
- [ ] 個案列表+搜尋+篩選
- [ ] 個案詳情 Tab 1 完整
- [ ] 同意書範本管理+簽署流程（SignaturePad）
- [ ] 個案端可查看已簽署同意書
