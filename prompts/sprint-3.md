# Sprint 3 — 前端：診間與排班

## 前置 API
- /api/rooms：CRUD + active-count
- /api/schedule-templates：CRUD
- /api/schedule-slots：expand / manual-expand / block / unblock / list

## 頁面

### views/admin/RoomSettingView.vue
- 診間列表：名稱、狀態、指派心理師
- 新增/編輯/啟停用
- 即時顯示「最大同時段諮商數：N」

### views/admin/ScheduleManageView.vue
- 上方：TemplateEditor — 選心理師 → 每週時段設定 → 儲存 + 即時預覽
- 下方：SlotGrid — 月曆視圖，每格顯示 Slot 列表（色彩：綠available/灰blocked/藍reserved），點擊 Slot 可 block/unblock/加備註，過去日期灰色不可點
- 操作按鈕：手動展班（選月份 → 預覽數量 → 確認）
- ConflictAlert：衝突時紅色提示

## 元件
- TemplateEditor.vue（components/schedule/）
- SlotGrid.vue（components/schedule/）
- ConflictAlert.vue（components/schedule/）

## Store / Service / Type
- scheduleStore（templates + slots）
- roomService, scheduleService
- types/room.ts, types/schedule.ts

## AdminSidebar 更新
加入：診間設定、排班管理

## 交付標準
- [ ] 診間 CRUD + 即時最大諮商數
- [ ] 排班範本設定 + 即時預覽
- [ ] 月曆視圖展班結果 + 手動調整
- [ ] 手動展班 + 預覽產生數量
- [ ] 過去日期不可操作 + 衝突提示
