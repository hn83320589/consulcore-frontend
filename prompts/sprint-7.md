# Sprint 7 — 前端：通知 + 考核 + 稽核

## 前置 API
- /api/notification-templates, /api/notifications, /api/notification-preferences
- /api/performance-reviews：CRUD + visibility + metrics + comparison
- /api/violation-records：CRUD + resolve/dismiss
- /api/audit-logs：list + export

## 頁面

### 通知相關

**views/admin/NotificationTemplateView.vue**
- 列表：事件類型、管道、啟用狀態、必要標記
- 編輯彈窗：主旨+內容（變數插入提示{{client_name}}等）+預覽+啟停用（必要disabled）

**NotificationBell.vue（components/layout/）**
- 頂列鈴鐺+未讀數badge，點擊下拉最近通知+「查看全部」
- 每30秒輪詢未讀數

**通知中心**（機構端+個案端各自的 notifications 頁面共用邏輯）
- 通知列表：時間、內容、已讀/未讀標記，點擊標記已讀

**個案端設定頁更新**
- views/client/ClientSettingsView.vue 加入通知偏好（每 event_type 的 email/sms/in_app 開關，必要通知 disabled）

### 考核相關

**views/admin/PerformanceView.vue**
- Tab 1 績效總覽：Owner 看全部心理師比較（MetricsCard 陣列+下拉切換看趨勢）、Therapist 只看自己（MetricsCard+MetricsTrend），時間篩選月/季/年
- Tab 2 定期考核：列表(心理師/期間/各項評分/可見性)、新增彈窗(選心理師+期間+4項1-5分+評語)、可見性控制（手動開放/設定時間區間）。Therapist 看已開放的唯讀。
- Tab 3 違規紀錄(Owner only)：列表+新增+狀態更新(resolved/dismissed)

### 稽核相關

**views/admin/AuditLogView.vue**
- 篩選列：時間區間、操作者下拉、動作類型下拉、資源類型下拉
- AppTable：時間、操作者、角色、動作、資源、描述
- 點擊展開：changes JSON diff 視覺化（before/after 對比）
- 匯出 CSV / PDF

### ClientDetailView Tab 6 稽核（Owner only）
- 該個案相關的 AuditLog 紀錄列表

## 元件
- NotificationBell.vue（components/layout/）
- MetricsCard.vue, MetricsTrend.vue, ReviewForm.vue（components/performance/）

## Store / Service / Type
- notificationStore, performanceStore, auditStore
- notificationService, performanceService, violationService, auditService
- types/notification.ts, types/performance.ts, types/audit.ts

## AdminSidebar 更新
加入：通知範本、考核模組、稽核紀錄

## 個案端頁面完善
- ClientNotificationView.vue：通知列表+已讀/未讀
- ClientSettingsView.vue：個人資料+密碼+通知偏好

## 交付標準
- [ ] NotificationBell 未讀數+下拉列表
- [ ] 通知範本管理+變數插入+預覽
- [ ] 通知偏好設定+必要通知不可關
- [ ] 績效總覽 7 項指標卡片+趨勢圖
- [ ] 定期考核 CRUD+可見性控制
- [ ] 違規紀錄 CRUD+狀態流轉
- [ ] 稽核查詢+diff展開+匯出
- [ ] 個案詳情 Tab 6 完整
- [ ] 個案端通知+設定頁完整
