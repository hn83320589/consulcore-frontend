# 整合測試報告 — Frontend

> 測試日期：2026-10-12　｜　最終版本：`main` @ `a26a403`　｜　後端對應版本：`consulcore-backend` `main` @ `b83427f`
>
> 流程：第一輪測試找出 17 項問題 → 修正（前端 PR #19、後端 PR #19、#20）→ 以最終版本重跑全部檢查與截圖。本報告的數字與截圖皆為最終版本；修正前的畫面放在 `screenshots/before/`。
>
> 後端自動化測試、端對端情境與 API 相關問題見後端報告：`consulcore-backend/docs/test-report.md`

## 總覽

| 項目 | 結果 | 說明 |
|------|------|------|
| 型別檢查（`npm run type-check`） | ✅ 無錯誤 | TypeScript 6、vue-tsc |
| Lint（`npm run lint`） | ✅ 無警告 | |
| 單元 / 元件測試（`npm test`） | ✅ 201 / 201 通過 | 47 個測試檔（第一輪 174，修正時新增 27） |
| 生產建置（`npm run build`） | ✅ 成功 | |
| 畫面操作測試 | ✅ 37 個畫面，無 console 錯誤、無失敗的 API 請求 | 擁有者、心理師、個案三種身份；桌機 1440 px 與手機 390 px |
| CI（GitHub Actions） | ✅ `main` 通過 | |

第一輪發現的 **17 項問題（功能缺陷 6、顯示與文案 7、體驗建議 4）全部已修正**，詳見[發現的問題與修正](#發現的問題與修正)。

## 測試方式

1. 後端以全新的暫存 SQLite 啟動，執行 `scripts/seed-demo.py` 建立示範診所「晴光心理諮商所」：擁有者、行政、2 位心理師、6 位個案（2 位有個案端帳號）、兩週排班、12 筆預約（含完成、取消）、SOAP 晤談紀錄、收費、套餐、常態預約、同意書、考核與違規紀錄
2. 前端以 `npm run dev` 啟動，用 Playwright 依序以三種身份登入，逐頁操作並截圖
3. 同時監聽瀏覽器 console 與網路請求：全程沒有 console 錯誤或警告，也沒有 4xx / 5xx 的 API 回應

## 畫面巡覽

### 機構後台（擁有者）

| 登入 | 儀表板 |
|---|---|
| ![登入](./screenshots/01-login.png) | ![儀表板](./screenshots/02-dashboard.png) |

| 預約管理（週檢視、狀態圖例） | 排班管理 |
|---|---|
| ![預約管理](./screenshots/03-appointments.png) | ![排班管理](./screenshots/04-schedule.png) |

| 個案管理 | 個案詳情 |
|---|---|
| ![個案管理](./screenshots/05-clients.png) | ![個案詳情](./screenshots/06a-client-detail.png) |

| 收費管理 | 營收報表 |
|---|---|
| ![收費管理](./screenshots/08-billing.png) | ![營收報表](./screenshots/08b-revenue.png) |

| 同意書管理 | 考核管理 |
|---|---|
| ![同意書](./screenshots/09-consents.png) | ![考核](./screenshots/10-performance.png) |

| 診間設定 | 人員管理 |
|---|---|
| ![診間](./screenshots/11-rooms.png) | ![人員](./screenshots/12-staff.png) |

| 費率設定 | 通知範本 |
|---|---|
| ![費率](./screenshots/13-fee-settings.png) | ![通知範本](./screenshots/14-notifications.png) |

| 稽核紀錄 | 機構設定（基本資料） |
|---|---|
| ![稽核](./screenshots/15-audit-log.png) | ![機構設定](./screenshots/16-org-settings.png) |

| 機構設定（表單範本） | 個案稽核 |
|---|---|
| ![表單範本](./screenshots/16b-org-forms.png) | ![個案稽核](./screenshots/06e-client-audit.png) |

### 心理師

| 儀表板 | 個案晤談紀錄（已鎖定） | 個案備忘錄 |
|---|---|---|
| ![心理師儀表板](./screenshots/20-therapist-dashboard.png) | ![晤談紀錄](./screenshots/23-therapist-client-sessions.png) | ![備忘錄](./screenshots/24-therapist-client-memos.png) |

### 個案端

| 首頁 | 我的預約 | 預約諮商 |
|---|---|---|
| ![個案首頁](./screenshots/30-client-dashboard.png) | ![我的預約](./screenshots/31-client-appointments.png) | ![預約諮商](./screenshots/32-client-new-appointment.png) |

| 同意書 | 通知 | 設定 |
|---|---|---|
| ![同意書](./screenshots/33-client-consents.png) | ![通知](./screenshots/34-client-notifications.png) | ![設定](./screenshots/35-client-settings.png) |

### 手機（390 px）

| 後台儀表板 | 後台預約（日檢視） | 後台選單 | 個案詳情 |
|---|---|---|---|
| ![](./screenshots/45-mobile-admin-dashboard.png) | ![](./screenshots/42-mobile-admin-appointments.png) | ![](./screenshots/43-mobile-admin-menu.png) | ![](./screenshots/44-mobile-client-detail.png) |

| 個案首頁 | 個案預約 |
|---|---|
| ![](./screenshots/40-mobile-client-dashboard.png) | ![](./screenshots/41-mobile-client-new-appointment.png) |

## 發現的問題與修正

嚴重度：**高** = 功能無法使用或給出錯誤資訊；**中** = 功能可用但有明顯錯誤；**低** = 顯示、文案或體驗改善。
有判斷邏輯的修正都先寫出會失敗的測試再修正；純樣式（F10、F12）以截圖驗證。

| # | 問題 | 嚴重度 | 修正方式 |
|---|---|---|---|
| F1 | 側欄「晤談紀錄」進入沒有指定個案的新增頁，送出必定失敗 | 高 | 頁首選擇個案，選好前不能存檔；片語分類改為換行 |
| F2 | 手機寬度沒有登出按鈕 | 高 | 手機選單底部加入登出 |
| F3 | 「帳號已建立」通知寫著已廢止的初始密碼規則 | 高 | 後端 B1 |
| F4 | 個案詳情「預約紀錄」的「查看」按了沒有反應 | 中 | 開啟預約詳情（只供檢視） |
| F5 | 通知範本「必要」欄顯示 `false` | 中 | 非必要顯示「—」 |
| F6 | 預約完成率趨勢與總覽不一致 | 中 | 後端 B2 |
| F7 | 性別顯示 `female` | 低 | 顯示中文；新增、編輯改用下拉選單 |
| F8 | 人員角色顯示英文代碼；個案帳號混在人員清單 | 低 | 角色中文；切換「後台人員／個案帳號」 |
| F9 | 稽核動作與資源顯示英文代碼 | 低 | 依後端實際寫入的代碼建立完整中文對照 |
| F10 | 側欄「諮商室」與頁面標題「診間設定」不一致 | 低 | 側欄改為「診間設定」 |
| F11 | 「機構設定」只有表單範本，機構資料無法修改 | 低 | 新增「基本資料」分頁（後端新 API） |
| F12 | 收費篩選列字級、按鈕高度不一致 | 低 | 改用 AppInput 與預設尺寸按鈕 |
| F13 | 心理師儀表板「今日預約」不含今天已完成的晤談 | 低 | 計入當天未取消的預約，排程標示狀態 |
| F14 | 擁有者儀表板只有 4 張數字卡 | 建議 | 加入今日排程與待收款清單 |
| F15 | 預約行事曆沒有狀態圖例 | 建議 | 加入圖例，顏色與事件共用同一組變數 |
| F16 | 個案預約時沒標出目前的心理師 | 建議 | 依預約紀錄標出「最近預約的心理師」 |
| F17 | 身分證字號完整顯示 | 建議 | 預設遮蔽（A******789），按「顯示」才看得到 |

### 修正前後對照

#### F1. 晤談紀錄新增頁

| 修正前：沒有地方選個案，片語分類被截斷 | 修正後：頁首選擇個案，分類換行 |
|---|---|
| ![](./screenshots/before/07-session-new.png) | ![](./screenshots/07b-session-new-picked.png) |

#### F2. 手機登出

| 修正前 | 修正後 |
|---|---|
| ![](./screenshots/before/43-mobile-admin-menu.png) | ![](./screenshots/43-mobile-admin-menu.png) |

#### F3. 「帳號已建立」通知

| 修正前 | 修正後 |
|---|---|
| ![](./screenshots/before/34-client-notifications.png) | ![](./screenshots/34-client-notifications.png) |

#### F4. 預約紀錄「查看」

| 修正前：按了沒反應 | 修正後：開啟預約詳情 |
|---|---|
| ![](./screenshots/before/06f-appointment-view-button.png) | ![](./screenshots/06f-appointment-view-button.png) |

#### F5. 通知範本「必要」欄

原因：slot 裡只有 `v-if`，條件不成立時 Vue 改顯示 AppTable 的預設內容（原始值）。已檢查其他表格的同類寫法，只剩「操作」欄，沒有對應資料值，不受影響。

| 修正前 | 修正後 |
|---|---|
| ![](./screenshots/before/14-notifications.png) | ![](./screenshots/14-notifications.png) |

#### F6. 預約完成率

| 修正前：總覽 100%、趨勢同月 33% | 修正後：一致 |
|---|---|
| ![](./screenshots/before/10b-performance-trend.png) | ![](./screenshots/10b-performance-trend.png) |

#### F7、F17. 個案基本資料

| 修正前：`female`、身分證字號完整顯示 | 修正後：「女」、身分證字號遮蔽 |
|---|---|
| ![](./screenshots/before/06a-client-detail.png) | ![](./screenshots/06a-client-detail.png) |

#### F8. 人員管理

個案帳號的重設密碼、停用只在人員管理有入口，所以不能直接把個案帳號從清單移除（第一次修正時犯了這個錯，已改為切換顯示）。

| 修正前 | 修正後：後台人員 | 修正後：個案帳號 |
|---|---|---|
| ![](./screenshots/before/12-staff.png) | ![](./screenshots/12-staff.png) | ![](./screenshots/12b-staff-client-accounts.png) |

#### F9. 稽核紀錄

| 修正前 | 修正後（描述格式見後端 B3） |
|---|---|
| ![](./screenshots/before/15-audit-log.png) | ![](./screenshots/15-audit-log.png) |

#### F10、F11. 診間設定名稱、機構基本資料

| 修正前：側欄「諮商室」、機構設定只有表單範本 | 修正後 |
|---|---|
| ![](./screenshots/before/16-org-settings.png) | ![](./screenshots/16-org-settings.png) |

#### F12. 收費篩選列

| 修正前 | 修正後 |
|---|---|
| ![](./screenshots/before/08-billing.png) | ![](./screenshots/08-billing.png) |

#### F13. 心理師儀表板

| 修正前：今日預約 0、「今日尚無預約」 | 修正後 |
|---|---|
| ![](./screenshots/before/20-therapist-dashboard.png) | ![](./screenshots/20-therapist-dashboard.png) |

#### F14. 擁有者儀表板

| 修正前 | 修正後 |
|---|---|
| ![](./screenshots/before/02-dashboard.png) | ![](./screenshots/02-dashboard.png) |

#### F15. 預約行事曆圖例

| 修正前 | 修正後 |
|---|---|
| ![](./screenshots/before/03-appointments.png) | ![](./screenshots/03-appointments.png) |

#### F16. 個案預約

個案端沒有讀取指派關係的權限，以個案自己的預約紀錄推算（今天以前最近一次未取消的，沒有則取最近一筆即將到來的），因此標示為「最近預約的心理師」而不是「你的心理師」。

| 修正前 | 修正後 |
|---|---|
| ![](./screenshots/before/32-client-new-appointment.png) | ![](./screenshots/32-client-new-appointment.png) |

## 修正時新增的共用程式

| 檔案 | 用途 |
|---|---|
| `utils/labels.ts` | 性別、角色、稽核動作與資源的中文對照（未知代碼照原樣顯示） |
| `utils/appointmentStatus.ts` | 預約狀態名稱與樣式、今日排程、最近預約的心理師（原本在列表與卡片各有一份） |
| `components/dashboard/TodaySchedule.vue` | 三種身份儀表板共用的今日排程 |
| `components/appointment/AppointmentStatusLegend.vue` | 行事曆狀態圖例 |
| `components/organization/OrganizationProfileForm.vue` | 機構基本資料表單 |
