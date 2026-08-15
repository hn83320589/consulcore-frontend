# Sprint 6 — 前端：收費模組

## 前置 API
- /api/fee-schedules, /api/packages, /api/discounts：CRUD
- /api/billing：confirm/refund/waive/purchase-package
- /api/reports：monthly-revenue/by-therapist/pending/package-stats

## 頁面

### views/admin/FeeSettingView.vue
- Tab 1 費率表：列表+新增/編輯/停用，心理師專屬標記
- Tab 2 套餐方案：列表+新增/編輯/停用，顯示換算單價
- Tab 3 折扣設定：依心理師分群，趴數/自訂金額，角色綁定

### views/admin/BillingManageView.vue
- Tab 1 付款紀錄：篩選(日期/個案/心理師/狀態)+列表+點擊編輯狀態/付款方式+匯出CSV
- Tab 2 套餐總覽：篩選+列表，剩餘≤2標黃，點擊查看明細
- Tab 3 營收報表(Owner)：RevenueChart（月趨勢+心理師拆分+待收總額）

### ClientDetailView Tab 5 收費
- 付款紀錄列表+套餐使用(PackageUsageBar)+折扣設定+應收帳款摘要

## 元件
- PaymentStatusBadge.vue（components/billing/）
- PackageUsageBar.vue — 進度條已用/剩餘
- RevenueChart.vue — 圖表（ECharts 或 Chart.js）

## Store / Service / Type
- billingStore
- billingService, feeService, packageService, discountService, reportService
- types/billing.ts

## AdminSidebar 更新
加入：收費管理、費率設定

## 交付標準
- [ ] 費率+套餐+折扣設定頁完整
- [ ] 付款紀錄列表+狀態流轉+匯出
- [ ] 套餐總覽+剩餘≤2標黃
- [ ] 營收報表圖表渲染正確
- [ ] 個案詳情 Tab 5 完整
