# 諮心管理 ConsulCore — Frontend

> Vue 3 SPA | Phase 1 | 最後更新 2026-08-02
>
> ⚠️ **前後端介接以後端契約為唯一事實來源**：`consulcore-backend/docs/frontend-integration.md`。
> 型別 / enum / URL / verb 有疑問時以該文件與後端程式碼為準，勿憑印象猜測。

---

## 專案概述

諮心管理（ConsulCore）是一套針對心理諮商所與個人執業心理師的全流程執業管理工具。本倉庫為前端 SPA 專案。

後端倉庫：`consulcore-backend`（.NET 10 Web API，獨立部署）
後端 API base URL（開發）：`http://localhost:5037/api`

### 技術棧

| 項目 | 技術 | 版本 |
|------|------|------|
| 框架 | Vue 3 Composition API | 3.5+ |
| 語言 | TypeScript（嚴格模式） | 6.x |
| 狀態管理 | Pinia + pinia-plugin-persistedstate | 3.x + 4.x |
| HTTP | Axios | 1.x |
| CSS | Tailwind CSS | 3.x |
| 日曆 | FullCalendar | 6.x |
| 簽名 | signature_pad | 5.x |
| 建置 | Vite | 8.x |
| 路由 | Vue Router | 4.x |

### 專案結構

```
consulcore-frontend/
├── CLAUDE.md
├── src/
│   ├── views/
│   │   ├── admin/              # 機構後台頁面（15 頁）
│   │   ├── client/             # 個案端頁面（6 頁）
│   │   ├── LoginView.vue
│   │   ├── RoleSelectView.vue
│   │   └── ChangePasswordView.vue   # 首次登入強制改密碼
│   ├── components/
│   │   ├── ui/                 # 基礎 UI 元件（8 個；AppToast 邏輯內嵌 App.vue、AppCalendar 由 FullCalendar 取代）
│   │   ├── form/               # 表單相關（4 個）
│   │   ├── appointment/        # 預約相關（4 個）
│   │   ├── schedule/           # 排班相關（3 個）
│   │   ├── client/             # 個案相關（4 個）
│   │   ├── session/            # 晤談紀錄（3 個）
│   │   ├── billing/            # 收費相關（3 個）
│   │   ├── performance/        # 考核相關（3 個）
│   │   ├── dashboard/          # Dashboard 專用（3 個：Owner/Therapist/Admin）
│   │   └── layout/             # Layout 元件（6 個）
│   ├── stores/                 # Pinia Stores（13 個）
│   ├── services/               # API Services（20 個）
│   ├── types/                  # TypeScript 型別
│   ├── composables/            # Vue Composables
│   └── router/
│       └── index.ts
├── .env.development
└── vite.config.ts
```

---

## 雙風格系統

個案端與機構後台採用兩套獨立風格，透過 CSS 變數在 Layout 層級切換，共用元件自動適應。

```css
/* ClientLayout — 溫暖風格 */
--color-primary: #E8A87C;
--color-primary-hover: #D4956A;
--color-bg: #FFF8F0;
--color-text: #4A3728;
--border-radius: 12px;
--spacing-unit: 1.25rem;
--font-size-base: 16px;

/* AdminLayout — 專業風格 */
--color-primary: #2C5F8A;
--color-primary-hover: #1E4A6E;
--color-bg: #F5F7FA;
--color-text: #1F2937;
--border-radius: 6px;
--spacing-unit: 0.75rem;
--font-size-base: 14px;
```

**規則：元件內不寫死顏色，一律用 CSS 變數。**

| 屬性 | 個案端 | 機構後台 |
|------|--------|---------|
| 色調 | 暖色系（米色、淡橙、溫暖灰） | 專業藍灰色系 |
| 間距 | 寬鬆留白多 | 緊湊高密度 |
| 圓角 | 大圓角 | 小圓角 |
| 字體 | 稍大、讀起來舒適 | 標準、資訊密度高 |
| 動畫 | 柔和淡入 | 簡潔快速 |
| 語氣 | 溫暖親切 | 專業簡潔 |

---

## 路由架構

### 共用
```
/login                          → LoginView
/select-role                    → RoleSelectView
```

### 個案端（ClientLayout）
```
/client/dashboard               → ClientDashboardView
/client/appointments            → ClientAppointmentView
/client/appointments/new        → ClientNewAppointmentView
/client/consents                → ClientConsentView
/client/notifications           → ClientNotificationView
/client/settings                → ClientSettingsView
```

### 機構後台（AdminLayout）
```
/admin/dashboard                → DashboardView（依角色動態渲染）
/admin/appointments             → AppointmentManageView
/admin/schedule                 → ScheduleManageView
/admin/clients                  → ClientListView
/admin/clients/:id              → ClientDetailView（6 tabs）
/admin/sessions/new             → SessionNoteEditorView
/admin/sessions/:id/edit        → SessionNoteEditorView
/admin/billing                  → BillingManageView
/admin/consents                 → ConsentManageView
/admin/performance              → PerformanceView
/admin/rooms                    → RoomSettingView
/admin/staff                    → StaffManageView
/admin/fee-settings             → FeeSettingView
/admin/notifications            → NotificationTemplateView
/admin/audit-log                → AuditLogView
/admin/settings                 → OrgSettingView
```

### 路由守衛
```
未登入 → /login
已登入 + 多角色 + 未選角色 → /select-role
/client/* + 非 Client 身份 → 對應 Dashboard
/admin/* + 非機構身份 → 對應 Dashboard
特定頁面 + 權限不足 → Dashboard + 提示（route meta.permission）
```

後台頁面一律在路由宣告 `meta.permission`（測試會檢查）；側欄選單從路由讀取所需權限，不另外維護。

---

## 狀態管理（Pinia）

| Store | 責任 | 持久化 |
|-------|------|--------|
| authStore | token, user, roles[], activeRole, permissions[], switchRole() | ✅ localStorage |
| appointmentStore | 預約資料與操作 | — |
| scheduleStore | 排班資料與操作 | — |
| clientStore | 個案列表與詳情 | — |
| sessionNoteStore | 晤談紀錄 | — |
| billingStore | 付款、套餐、費率 | — |
| consentStore | 同意書範本與簽署 | — |
| notificationStore | 通知紀錄與未讀數 | — |
| staffStore | 人員管理 | — |
| auditStore | 稽核紀錄查詢 | — |
| performanceStore | 考核與違規 | — |
| formBuilderStore | 動態表單建構器 | — |
| uiStore | sidebar, loading, toast | — |

---

## HTTP Service 層

### httpService 攔截器

```typescript
// 請求攔截
- 自動注入 Authorization: Bearer {token}
- 自動注入 X-Active-Role: {activeRole}
- （organizationId 由後端從 JWT 取得，前端不注入 header）

// 回應攔截
- 401 → 清 token，導向 /login
- 403 → 顯示後端 message（權限不足 / 首次登入未改密碼等）
- 400 / 404 → 顯示後端 message toast
- success:false → 拋錯並顯示 message
- 統一解包 ApiResponse<T> → 直接回傳 .data
```

> 認證身份模型（契約 4）：登入 / `/me` 回傳為**扁平**結構；`roles` 為 `string[]`；permissions 僅來自 `GET /auth/me`（登入回應不含）；`mustChangePassword=true` 時強制導向 `/change-password`，改密碼成功後需重新登入換發 token。

### Service 清單

| Service | 對應後端 API |
|---------|-------------|
| httpService | Axios 單例 + 攔截器 |
| authService | /api/auth |
| appointmentService | /api/appointments + /api/appointment-series |
| scheduleService | /api/schedule-templates + /api/schedule-slots |
| clientService | /api/client-profiles |
| sessionNoteService | /api/session-notes |
| billingService | /api/billing |
| consentService | /api/consent-templates + /api/consent-records |
| notificationService | /api/notifications + /api/notification-preferences |
| staffService | /api/users + /api/roles |
| auditService | /api/audit-logs |
| performanceService | /api/performance-reviews + /api/violation-records |
| formService | /api/form-templates + /api/form-submissions |
| roomService | /api/rooms |
| phraseService | /api/phrase-templates |
| feeService | /api/fee-schedules + /api/packages |
| discountService | /api/discounts |
| reportService | /api/reports |
| clientMemoService | /api/client-memos |
| violationService | /api/violation-records |

---

## 元件架構

### 基礎 UI（components/ui/）
AppButton, AppInput, AppSelect, AppModal, ConfirmModal, AppTable, AppTabs, AppBadge

### 業務元件
| 分類 | 元件 |
|------|------|
| form/ | FormBuilder, FormRenderer, SignaturePad, PhrasePanel |
| appointment/ | AppointmentCalendar, AppointmentList, AppointmentCard, QuickBookModal |
| schedule/ | TemplateEditor, SlotGrid, ConflictAlert |
| client/ | ClientInfoCard, ClientMemoList, ConsentStatus, ClientSearchBar |
| session/ | SoapEditor, FreeTextEditor, LockStatusBar |
| billing/ | PaymentStatusBadge, PackageUsageBar, RevenueChart |
| performance/ | MetricsCard, MetricsTrend, ReviewForm |
| dashboard/ | OwnerDashboard, TherapistDashboard, AdminDashboard |

### Layout（components/layout/）
AdminLayout, ClientLayout, AdminSidebar, ClientNavbar, RoleSwitcher, NotificationBell

---

## 開發規範

- 所有 View 放在 `views/admin/` 或 `views/client/`
- 所有 API 呼叫走對應的 Service，不在 component 直接呼叫 axios
- Store 只做資料管理，不含 UI 邏輯（顯示/隱藏/導航不放 Store）
- 元件 Props 必須定義 TypeScript interface
- 路由守衛：判斷規則在 `router/navigation.ts`（純函式 `resolveNavigation`，表格測試），`router/index.ts` 只負責補抓權限與提示
- Store 不負責換頁：需要「改登入狀態 + 換頁」時用 `composables/useAuthActions`
- 錯誤處理統一走 httpService 攔截器：API 錯誤由攔截器顯示後端訊息；頁面 catch 只處理 UI 狀態，需要提示時用 `notifyError(e, '通用訊息')`（攔截器已顯示過的錯誤會自動略過，避免重複 toast）
- 使用 CSS 變數（`var(--color-primary)`），不寫死顏色
- 命名：camelCase（變數/函式）、PascalCase（元件/型別）
- 測試放在被測檔案旁的 `__tests__/*.spec.ts`（Vitest + happy-dom）；新功能與 bug 修正先寫測試

## 環境變數

```
# .env.development
VITE_API_BASE_URL=http://localhost:5037/api
```

## 常用指令

```bash
npm run dev                  # 啟動 (http://localhost:5173)
npm run build                # 建置
npm run type-check           # TypeScript 檢查
npm run lint                 # Lint
npm test                     # Vitest 單元測試（npm run test:watch 監看模式）
```

## 最新異動記錄

| 日期 | 異動 |
|------|------|
| 2026-04-03 | 初始版本，Phase 1 完整架構 |
| 2026-08-02 | 全面對齊後端契約（`frontend-integration.md`）：認證地基扁平化 + `mustChangePassword` 流程、13 域型別/enum/URL/verb 對齊、httpService 移除 X-Organization-Id、ID 一律 number、狀態變更改 POST/PATCH。詳見 `prompts/fix-plan.md` |
| 2026-08-02 | Phase 5 收尾：OrgSettingView（表單建構器）、DashboardView 三角色元件、ClientDetail Tab 權限收斂、診間心理師指派、eslint 導入（flat config）。後端待補端點見 `consulcore-backend/docs/frontend-requested-endpoints.md` |
| 2026-10-11 | 導入 Vitest（authStore、路由守衛 characterization 測試）、GitHub Actions CI（type-check / lint / test / build）、ESLint 改 flat/recommended（排版規則關閉） |
| 2026-10-11 | 重構 Phase 2：同意書 XSS、時區、401 判斷、路由權限、初始帳密顯示、人員管理配合擁有者保護、409 訊息、個案詳情依權限載入（allSettled）、登出清除資料 store、晤談紀錄未存檔保護、排班重疊判斷、notifyError 消除重複 toast |
