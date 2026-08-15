# ConsulCore 前端契約對齊修復計畫（v2）

> 產出 2026-07-30 | 依據：後端唯一事實來源 `consulcore-backend/docs/frontend-integration.md`
> 方法：4 組平行稽核逐欄位比對前端 20 service + 19 type 檔對契約 7.1–7.15
> 對齊策略：**以後端契約為準**（後端已完成，契約從程式碼萃取）

---

## 一、範圍總結

這不是修 URL——是**前端與後端契約全面對不上**，四個層面：
1. **認證資料模型錯**（地基）：`LoginResponse`/`CurrentUser` 巢狀 vs 契約扁平、`roles` 當物件 vs 契約 `string[]`、permissions 誤取自登入回應、`mustChangePassword` 流程缺失。
2. **~46 條 URL/verb 偏差**：狀態變更前端用 PUT/DELETE，契約一律 `POST /{id}/{action}`。
3. **幾乎所有 type 檔欄位對不上**：見「跨領域系統性規則」。
4. **~10 個 enum 值錯**：錯就 400。

> ⚠️ **現狀在真實後端下無法運作**：`authStore.login` 取 `res.roles[0].roleCode`（roles 實為字串陣列）會執行期直接炸，`res.user`/`res.permissions` 皆 undefined。登入這關就過不去，所以認證地基必須第一個修。

---

## 二、跨領域系統性規則（每個檔案都要套用）

| 規則 | 錯誤 | 契約正確 |
|------|------|---------|
| **ID 型別** | `id`/外鍵一律 `string` | 一律 `number` |
| **命名** | `clientId` / `therapistId` / `slotId` / `from` / `to` | `clientProfileId` / `therapistUserId` / `scheduleSlotId` / `startDate` / `endDate` |
| **狀態變更語意** | REST 式 `PUT/DELETE` + status 欄位 | `POST /{id}/{action}`（complete/cancel/no-show/reschedule/lock/unlock/renew/end/resolve/dismiss/confirm/refund/waive 全是 POST） |
| **停用切換** | `PUT /{id}/status` 帶 `{ isActive }` | 無 status 端點，改 `PUT /{id}` 把 `isActive` 放進 Update DTO body（rooms/fee/packages/discounts） |
| **回應封套** | 只解包 `.data`，不檢查 `success` | `success===false` 要拋 `ApiError(message, status, errors)`，並用後端 `message` 顯示 |

---

## Phase 1 — 認證地基（最優先，阻斷性）✅ 已完成 2026-07-30

> type-check + build 通過。已改：types/auth.ts（扁平 LoginResponse + CurrentUser + RegisterRequest + ChangePasswordRequest、roles:string[]、刪 UserRole）、types/index.ts、authService.ts、authStore.ts、httpService.ts（移除 X-Organization-Id、加 success:false 與 400/404 message）、RoleSelectView/RoleSwitcher（字串迭代）、新增 ChangePasswordView.vue、router（/change-password route + mustChangePassword 守衛 + 重整補 fetchMe）。
> ⚠️ 暫時橋接（Phase 3 移除）：因 User.id 改 number，6 個 domain view 呼叫點暫用 String()/toString() 轉字串（ClientDetailView currentUserId、PerformanceView therapistId、ClientAppointment/Consent/Dashboard/NewAppointment 的 clientId）。這些在 Phase 3 對應域正名為 clientProfileId/therapistUserId:number 時移除。
> ⏳ 待做：真實種子帳號 runtime 煙霧測試（login → /me → mustChangePassword 流程）；type-check 抓不到封套/欄位/enum 的 runtime 錯。

依「型別往外推、每步可編譯」順序：

1. **`types/auth.ts`**：`LoginResponse` 改扁平 `{ token, userId:number, username, displayName, email, organizationId:number, organizationName, roles:string[], mustChangePassword:boolean }`；**移除** `user` 巢狀與 `permissions`；新增 `CurrentUser`（`/me` 用，含 `permissions:string[]`、`activeRole?`）；`roles` 為 `string[]`；刪 `UserRole`。
2. **`types/user.ts`**：`UserResponse` 用 `roles:string[]`、`id:number`、`isActive`、`createdAt/updatedAt`；`CreateUserRequest.roles:string[]`（刪 `roleCode`/`defaultRoom*`）；`UpdateUserRequest` 全選填 `roles?:string[]`；`ResetPasswordRequest {newPassword}`。
3. **`types/role.ts`**：`RoleResponse {id:number, name, description?, isSystemDefault, permissions:string[]}`（`code`→刪、`isSystem`→`isSystemDefault`、`permissionCodes`→`permissions`）；刪 `Permission`/`PermissionModule`。
4. **`authStore.ts`**：`login()` 由扁平欄位組 user、`roles=res.roles`（string[]）、單角色 `activeRole=res.roles[0]`、**移除 `permissions=res.permissions`**、存 `mustChangePassword`；`fetchMe()` 依 `CurrentUser` 組 user 並 `permissions=res.permissions`（唯一來源）；`activeOrganizationId` 改用 `user.organizationId`。
5. **`authService.ts`**：`getMe():Promise<CurrentUser>`；`register` 補 `organizationName`(必填)/`phone?`、回 `LoginResponse`；`logout` 契約端點總表無此端點 → 改純前端清 state 不打 API；`changePassword` 維持 `PUT /auth/change-password`。
6. **`httpService.ts`**：移除 `X-Organization-Id` 注入；回應攔截器加 `if(!data.success) throw ApiError`；400/404 顯示後端 `message`；403 顯示後端 `message`（供 mustChangePassword 提示）。
7. **`RoleSelectView.vue` / `RoleSwitcher.vue`**：roles 改字串迭代，機構名改讀 `user.organizationName`。
8. **mustChangePassword 流程**：新增 `/change-password` route + View；登入後 true → 導改密碼頁；guard 鎖定該狀態只能停改密碼頁；改成功 → `logout()` 導回 `/login` 重登（契約要求重登換發 token）。
9. **啟動補 permissions**：`main.ts` 或 guard 首次進入且已登入時 `await fetchMe()`（permissions 不持久化，重整後會遺失導致權限 gating 失效）。

---

## Phase 2 — enum 值校正（低風險、獨立，可先做）

| 型別 | 檔案 | 錯誤 → 契約正確 |
|------|------|----------------|
| ClientStatus | client.ts | `active/inactive/terminated/transferred` → **`pending/active/suspended/closed`**（另 `TherapistClientStatus='active/transferred/closed'`） |
| SlotStatus | schedule.ts | 缺 `cancelled` → **`available/reserved/blocked/cancelled`** |
| ConsentTriggerEvent | consent.ts | 缺 `service_change`、欄位名 `trigger`→`triggerEvent` → **`manual/first_visit/annual_renewal/service_change`** |
| AppointmentStatus | appointment.ts | 多 `confirmed/reserved_hold` → **`scheduled/completed/cancelled/no_show`** |
| SeriesFrequency | appointment.ts | 多 `monthly`、欄位名 `recurrencePattern`→`frequency` → **`weekly/biweekly`** |
| SessionNoteFormat | sessionNote.ts | `freetext` → **`free_text`** |
| MemoCategory | clientMemo.ts | `general/clinical/administrative/follow_up` → **`personality/trigger/preference/family/other`** |
| FieldType | form.ts | 多 `signature`、缺 `scale` → **`text/textarea/select/radio/checkbox/date/number/scale`** |
| DiscountType | billing.ts | `fixed` → **`fixed_amount`** |
| PaymentStatus | billing.ts | `pending/confirmed/partial/refunded/waived` → **`paid/pending/refunded/waived`** |
| PaymentMethod | billing.ts | `card/package` → **`cash/transfer/credit_card/line_pay/other`** |
| NotificationEventType | notification.ts | 見稽核（多數非法）→ **`account_created/appointment_created/appointment_cancelled/appointment_reminder/therapist_leave/series_renewal/package_low/package_expiring`** |
| ReviewVisibility | performance.ts | 多 `scheduled` → **`hidden/visible`** |
| ViolationStatus | performance.ts | `pending` → **`open/resolved/dismissed`** |
| 新增缺漏 enum | 各檔 | `PaymentType`、`ClientPackageStatus`、`NotificationStatus`、`ViolationSeverity`、`FormTemplateType`、`SeriesStatus` |

---

## Phase 3 — 逐領域對齊（type + service + 消費端 view 一起，每域一組、改完編譯驗證）

> 執行策略：改為逐域一次做完（enum+欄位+service+消費端），每域 type-check 全綠。以子代理序列執行（ClientDetailView/index.ts 為多域共用熱點，故不平行）。
> ✅ **Phase 3 全部完成 2026-07-30**：個案 / 人員/角色 / 診間 / 排班 / 預約 / 同意書 / 表單 / 晤談 / 常用語/備忘 / 收費 / 通知 / 考核/違規 / 稽核 共 13 域全部對齊。
> - type-check + build 全綠；無殘留工具標記。
> - Phase 1 的 6 個 String() 橋接**全部清除**（grep 為 0）。
> - **runtime 抽驗通過**（真實後端）：register/login/me 扁平結構、RoomResponse(therapists[])、active-count(activeCount)、fee-schedule(sessionType/visitType enum)、client-profile 建立(全對齊欄位)、PATCH /status → suspended 皆正確。
> - 順手完成：RevenueChart 寫死 hex → CSS 變數；notificationEventMeta.required 對齊後端 seed。
> - 待後端確認：稽核 resourceType 字串命名（前端採 PascalCase 推測）。

> 每個領域的欄位級偏差詳見 4 份稽核報告；以下為每域的主要工作與 URL/verb。

**3.1 個案 client**：`client.ts` 全面改名（`displayName`→`name`、`birthDate`→`dateOfBirth`、`idNumberLast4`→`idNumber`(完整)、`assignedTherapist*`→`therapists:TherapistInfo[]`、加 `userId?`/`mustChangePassword`）；service：`status` PUT→**PATCH**、`assign`→`POST assign-therapist`、`transfer`→`POST transfer-therapist/{currentTherapistUserId}`（body `{newTherapistUserId, reason?}`）、list 無 query、搜尋改 `GET /search?keyword=&idNumberLast4=`。

**3.2 同意書 consent**：`trigger`→`triggerEvent`、`templateId`→`consentTemplateId`、`clientId`→`clientProfileId`、`signatureImageUrl`→`signatureImage`(Base64)、`voidedReason`→`voidReason`、加 `signedRemotely`/`status`；service：`void` PUT→**POST**、清單改 `by-client/{id}` 與 `by-trigger-event/{event}`。

**3.3 診間 room**：`Room.therapists:TherapistRoomInfo[]`、`UpdateRoomRequest` 加 `isActive`、`ActiveRoomCount.count`→`activeCount`、`CreateRoomRequest` 僅 `{name}`；service：停用改 `PUT /{id}` 帶 `isActive`、補 `assign-therapist`/移除指派端點。

**3.4 排班 schedule**：template 從 `weeklySlots` 改**單日扁平** `{therapistUserId, dayOfWeek(0-6), startTime, endTime, slotDuration?}`；`ExpandScheduleRequest{startDate,endDate}`、`ManualExpandRequest{year,month}`、回 `ExpandResult{createdCount,skippedCount,warnings}`；**移除 preview**；`ScheduleSlot` 改名+`roomId?:number|null`；slot query `startDate/endDate/therapistUserId`；block/unblock PUT→**POST**。

**3.5 預約 appointment**（偏差最深）：`CreateAppointmentRequest` 重寫為 `{clientProfileId, scheduleSlotId, sessionType?, visitType?, note?}`（刪 therapistId/roomId/date/time）；狀態變更改 `POST complete/cancel/no-show/reschedule`（新增 4 方法，刪 PUT status / DELETE / PUT update / GET by id）；`calendar-view`→`calendar`；available-slots 回 `ScheduleSlotResponse[]`；series renew/end PUT→**POST**、`CreateSeriesRequest{clientProfileId,therapistUserId,dayOfWeek,startTime,frequency?,months?}`、`RenewSeriesRequest{months?}`；`Appointment` 加 `hints:string[]`、改名。

**3.6 表單 form**：巢狀 request 型別（`CreateFormFieldRequest`/`CreateFormSectionRequest`）；`FormField` `type`→`fieldType`、`options` JSON 字串、`validationRules?`、加 `isRequired`/`sortOrder`；`FormTemplate` 加 `type`/`version`、`isSystem`→`isSystemDefault`；submission `data:Record`→`values:FieldValueResponse[]`、`clientId`→`clientProfileId`；service：submissions 改 `by-client/{id}` + `GET /{id}`。

**3.7 晤談紀錄 session**：SOAP 巢狀 `soapContent`→平坦 `soapS/soapO/soapA/soapP`；`includeInitialAssessment`→`intakeSummaryImported`；改名；service：清單改 `by-client/{id}` 與 `by-appointment/{id}`(可回 null)、lock/unlock PUT→**POST**、移除純清單與 GET by id。

**3.8 常用語/備忘 phrase+memo**：phrase 加 `sortOrder`(必填)、刪 `isShared`/`createdBy`；memo `clientId`→`clientProfileId`、`author*`→`therapist*`、**加 `isEditable`**（BR-16 唯讀判斷）、`getMemos` 改 `by-client/{id}`。

**3.9 收費 billing/fee/discount**：全面改名（見稽核，`clientId`→`clientProfileId`、`unitPrice`→`perSessionAmount`、`usedSessions`→`sessionsUsed` 等）；fee/package/discount 加 `sessionType`/`visitType`/`validDays` 等契約欄位；confirm/refund/waive PUT→**POST**（refund body `{note?}`、waive 無 body）；停用改 `PUT /{id}` 帶 `isActive`。

**3.10 報表 report**：拆 `getRevenueReport` 為 `monthly-revenue?year=&month=`（`MonthlyRevenue`）+ `by-therapist` + `pending`；`package-stats` 回 `PackageStats{...,lowRemaining}`；重構聚合型別。

**3.11 通知 notification**：`content`→`bodyTemplate`/`body`、`isMandatory`→`isRequired`、`isRead`→`status`、偏好 `email/sms/inApp`→`*Enabled`、`UnreadCount.count`→`unreadCount`；service：mark-read/mark-all-read PUT→**POST**。

**3.12 考核/違規 performance+violation**：`TherapistMetrics` 補齊 8 量化欄位（缺 6 項）；review 評分欄位改 `professionalScore/clientFeedbackScore/teamworkScore/overallScore`、`periodStart/End`→`period`、`comment` 可 null；violation 加 `ViolationSeverity`、`incidentDate`(必填)、resolve body `{actionTaken}`、resolve/dismiss PUT→**POST**、補 dismiss；service：metrics 改 `/metrics/{therapistUserId}?startDate=&endDate=`(回單一物件)、comparison→`metrics-comparison`。

**3.13 稽核 audit**：`resourceId` string→number、`changes` `AuditChange[]`→`string`(JSON)、刪 `userRole`；export 併為單一 `GET /audit-logs/export?format=csv|pdf`、query 移除 userId/page/pageSize。

---

## Phase 4 — 後端無端點的功能降級（產品決策）

以下 4 項後端契約無對應端點，前端相關 UI 需降級/隱藏並標記 backlog：

| 功能 | 前端原呼叫 | 後端現況 | 處理方向 |
|------|-----------|---------|---------|
| 付款紀錄完整清單（BillingManageView Tab1） | `GET /billing` | 只有 `GET /billing/pending` | 降級為僅顯示待收款 |
| 套餐總覽（Tab2） | `GET /billing/packages` | 無 | 改用 `GET /reports/package-stats` 的 `lowRemaining` 拼湊，或隱藏 |
| 付款紀錄 CSV 匯出 | `GET /billing/export` | 無 | 移除匯出按鈕或隱藏 |
| 績效趨勢圖（MetricsTrend 元件） | `GET /.../metrics/{id}/trend` | 無 | 降級為單期 metrics，或隱藏趨勢圖 |

---

## Phase 5 — 功能缺口 + 收尾（與契約無關，Sprint 落地）✅ 完成 2026-08-02（CLAUDE.md 除外）

- ✅ ClientDetail Tab3/4 權限收斂：晤談紀錄/備忘錄僅 therapist、稽核僅 owner（用 activeRole，因 Sprint 8 矩陣為角色語意、與 permission gating 衝突——Owner 有權限但刻意隱藏）。
- ✅ OrgSettingView + `/admin/settings` route：接回孤兒 FormBuilder（範本列表/系統預設複製後編輯/FormBuilder 結構編輯/FormRenderer 即時預覽）。
- ✅ DashboardView 三角色元件：OwnerDashboard/TherapistDashboard/AdminDashboard，依 activeRole 動態渲染。
- ✅ 兩個 TODO 下拉：RoomSettingView 心理師指派（assign/remove-therapist + staffStore）；StaffManageView 診間下拉 TODO 移除（契約無 defaultRoom，改由診間端指派）。
- ✅ RevenueChart hex→CSS 變數（收費域時已做）。
- ✅ eslint 安裝：eslint 10 + eslint-plugin-vue + @vue/eslint-config-typescript，flat config（eslint.config.js），`npm run lint` 0 problems（修了 3 個：TransitionGroup、移除多餘 as any、_ 前綴未用參數規則）。
- ⛔ CLAUDE.md drift：被 .claude/settings.json 的 `Edit(CLAUDE.md)` deny 規則阻擋，需使用者自行更新（drift 項：httpService 已移除 X-Organization-Id、admin views 數、UI 元件數、契約對齊）。

## 全部完成狀態（2026-08-02）
type-check ✅ / lint ✅ (0) / build ✅。Phase 1–3（契約對齊 13 域）+ Phase 4（4 功能降級隱藏+backlog）+ Phase 5（收尾）皆完成。CLAUDE.md 也已更新（deny 規則移除後）。

## Phase 6 — 後端補完端點後的恢復（✅ 2026-08-02）
後端已完成 `docs/frontend-requested-endpoints.md` 全部 P1/P2 並回覆 A/B。前端對應處理：
- **正確性 bug 修復（後端證實兩個假設都錯）**：
  - B：`userId ≠ clientProfileId`。authStore/CurrentUser 加 `clientProfileId`（來自 /me），4 個個案端視圖改用 `authStore.clientProfileId`（不再拿 user.id 抓錯個案）。
  - A：`resourceType` 是 snake_case（非 PascalCase）。ClientDetail 稽核改 `client_profile` + `resourceId` query 精準查；AuditLogView 資源下拉改 snake_case 值 + 中文 label。
- **降級功能全恢復**（`backend-backlog` 標記全清 0）：
  - 收費：billing 完整清單 + 篩選 + CSV 匯出（Tab1）、套餐總覽完整清單（Tab2）、ClientDetail 收費 tab 完整紀錄 + PackageUsageBar。
  - 績效趨勢圖：MetricsTrend 接回（指標/期間/心理師選擇）。
  - 常態預約：ClientDetail 改用 `/appointment-series/by-client/{id}`（不再只顯示待續約）。
  - 順手：ClientDetail 指派心理師下拉接上 staffStore。
- runtime 抽驗：/me 有 clientProfileId 欄位、GET /billing、/billing/packages、/billing/export、/appointment-series/by-client、audit resourceId query 皆 200；trend 路由存在（404 僅因測試用不存在的 therapistId）。
- ✅ P2 單筆 GET 已接上（2026-08-02）：
  - `GET /session-notes/{id}`：SessionNoteEditorView 深連結修復——直接以 URL 進 `/sessions/:id/edit` 時，store 無資料則 fallback 用 `fetchNote(id)` 載入（原本會空白）。
  - `GET /appointments/{id}`：appointmentService.getAppointment + appointmentStore.fetchAppointment（便利方法，供未來深連結）。
  - `GET /consent-records?clientProfileId=&status=&triggerEvent=`：consentService.getRecords + store.fetchRecords；ConsentManageView 簽署紀錄查詢從「只能依觸發事件瀏覽」恢復為「觸發事件 + 狀態」彈性篩選（可選全部）。
  - runtime 驗證：consent-records 彈性查詢 200；appointments/{id}、session-notes/{id} 路由存在（`HttpGet("{id:int}")`，404 僅因測試 id 無資料）。type-check/lint/build 全綠。
- 整個前端契約對齊 + 恢復（Phase 1–6）全部完成，無殘留降級。

## Phase 7 — 端到端整合測試（✅ 2026-08-15）
起真實後端(:5037) + 前端 dev(:5173)，用 Playwright 驅動 UI 實測。**抓到並修好一個只有 runtime 才會現形的 bug**：
- **AdminSidebar 權限碼錯誤**：選單用 `appointments.view`/`clients.view`/`sessions.view`/`consents.view`/`rooms.view`/`staff.view`/`fees.view`/`notifications.manage`/`settings.manage`（複數/錯命名空間），與契約第 5 節的 32 個權限碼（單數：`appointment.view`/`client.view`/`session.view`/`consent.view`/`room.manage`/`staff.manage`/`notification.manage`/`org.settings`）不符 → Owner 登入只看到 5 個選單（剛好碼相符的那幾個），其餘全被 gate 掉。type-check/lint/build 全過（純字串字面值）。已全部改對，另修 SessionNoteEditorView 的 `sessions.unlock`→`session.lock`。
- 實測通過流程：登入→儀表板(OwnerDashboard 顯示真實資料 個案數=1)、14 個選單全顯示、個案列表(狀態 enum 正確)、收費管理(完整篩選+匯出 CSV)、機構設定(FormBuilder 接回、載入系統範本、FormRenderer 即時預覽正確解析 JSON options/scale)。整場 0 console error。type-check/lint/build 全綠。

## Phase 8 — 後端安全性異動的前端因應（✅ 2026-08-15）
依據 `consulcore-backend/docs/backend-changes-for-frontend.md`（後端 IDOR fail-closed / 權限閘 / BR-20 代診）：
- **P0-1 form-submissions 權限閘**：查證後回覆「前端無病患自助填表單流程」（grep 確認 form 相關只有 OrgSettingView 消費）→ 無需修改。
- **P1-2 BR-20 代診**：ClientDetailView 加 `isProxyView`（therapists 無「自己且 active」即為代診）+ 唯讀提示橫幅；並收斂寫入 UI：指派/暫停/恢復/結案改 `client.manage` gate、ClientInfoCard 新增 `readonly` prop（無 client.update 或代診時隱藏編輯）。
- **P2-3 client 限縮**：自查個案端未呼叫 calendar / pending-renewal / by-trigger-event → 乾淨。
- **P2-4 X-Active-Role（重要 bug 修復）**：httpService 原從 localStorage 讀 token/activeRole，但 persistedstate 是 `flush:'pre'`（微任務）寫入，攔截器同步執行 → 多角色選身份時 header 漏送、切換時送舊值。後端 fail-closed 後會直接壞。改為 authStore 註冊 provider（沿用 registerToast 模式避免循環相依），攔截器讀 store ref 當下值，localStorage 僅作後備。
- **連帶修**：ClientDetailView 無條件呼叫 `GET /users`(需 staff.manage) → therapist 必然 403；改為權限 gate。
- **實測**（建 multi_test 帳號 roles=[admin,therapist]）：選身份→TherapistDashboard 側欄 8 項；切 admin→13 項且「機構設定」正確不顯示；代診橫幅正確、寫入按鈕消失；0 console error。type-check/lint/build 全綠。

---

## 建議執行順序與驗證

1. **Phase 1 認證地基**（不修這個，登入都過不去，其他免談）
2. **Phase 2 enum**（低風險、獨立、快）
3. **Phase 3 逐領域**（一域一組，改完 `npm run type-check` 通過再進下一域）
4. **Phase 4 降級**（需你對 4 個功能的處理方向拍板）
5. **Phase 5 收尾**

**驗證**：每個 Phase 3 領域改完至少 type-check 通過；認證地基改完需用**真實種子帳號**跑 login → /me → 一個模組流程的 runtime 煙霧測試（type-check 抓不到欄位形狀與 enum 錯）。需要一組後端測試帳號。
