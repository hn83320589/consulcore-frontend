# Sprint 4 — 前端：預約管理

## 前置 API
- /api/appointments：CRUD + status + calendar-view + list-view + available-slots
- /api/appointment-series：create / renew / end / pending-renewal

## 頁面

### views/admin/AppointmentManageView.vue
- Toggle 切換日曆/列表
- **日曆視圖**：FullCalendar 整合，週曆預設，Resource 模式（每心理師一行），事件色彩依狀態，點空白→QuickBookModal，點事件→AppointmentCard，篩選心理師/診間
- **列表視圖**：AppTable 僅有預約時段，篩選（日期/心理師/狀態/個案），批次完成/取消

### views/client/ClientDashboardView.vue（完善）
- 歡迎訊息（溫暖語氣）+ 近期預約卡片 + 未讀通知 + 快速預約按鈕

### views/client/ClientAppointmentView.vue
- 我的預約列表（upcoming + 歷史）+ 取消/改期操作

### views/client/ClientNewAppointmentView.vue
- Step 1：選心理師（卡片 + 溫和提示維持固定）
- Step 2：選日期+時段（只顯示 available 且非 reserved_hold）
- Step 3：確認送出

### ClientDetailView Tab 2 填入
- 歷次預約列表 + 常態性預約資訊 + 快速新增按鈕

## 元件
- AppointmentCalendar.vue（FullCalendar wrapper）
- AppointmentList.vue
- AppointmentCard.vue（詳情彈窗：個案資訊+操作+快速連結）
- QuickBookModal.vue（自動帶入心理師+時段+診間）

## Store / Service / Type
- appointmentStore
- appointmentService
- types/appointment.ts

## AdminSidebar 更新
加入：預約管理

## 交付標準
- [ ] 日曆+列表雙視圖完整可操作
- [ ] QuickBookModal 快速建立預約
- [ ] 預約狀態可流轉
- [ ] 常態性預約建立/續約/結束
- [ ] 個案端三步驟預約流程
- [ ] 溫和提示顯示正確
- [ ] 個案詳情 Tab 2 完整
