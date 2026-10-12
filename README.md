# 諮心管理 ConsulCore — Frontend

心理諮商所與個人執業心理師的全流程執業管理工具，本倉庫為前端 SPA。機構後台與個案端共用同一套程式，依登入身份切換。

| 機構後台：預約管理 | 個案端：首頁 |
|---|---|
| ![預約管理](./docs/screenshots/03-appointments.png) | ![個案首頁](./docs/screenshots/30-client-dashboard.png) |

| 營收報表 | 晤談紀錄（SOAP） | 手機版 |
|---|---|---|
| ![營收報表](./docs/screenshots/08b-revenue.png) | ![晤談紀錄](./docs/screenshots/23-therapist-client-sessions.png) | ![手機](./docs/screenshots/42-mobile-admin-appointments.png) |

更多畫面與測試結果見 [`docs/test-report.md`](./docs/test-report.md)。

## 功能亮點

- **兩種使用者、兩套風格**：機構後台（擁有者、行政、心理師）與個案端（預約、同意書、通知），以 CSS 變數在 Layout 切換風格
- **多角色**：同一帳號可有多個角色，登入後選擇身份；側欄、路由與按鈕依後端回傳的權限碼顯示
- **依身份的儀表板**：擁有者看營收、今日排程與待收款；心理師看自己的今日排程與個案
- **預約與排班**：FullCalendar 週 / 日檢視（手機自動切成日檢視、狀態圖例）、排班範本與展班、常態預約
- **臨床紀錄**：SOAP / 自由文字晤談紀錄、常用片語、鎖定與解鎖、未存檔離開提醒；動態表單建構器
- **收費**：自動收費、套餐、折扣、營收報表與 CSV 匯出（Chart.js）
- **個資與稽核**：身分證字號預設遮蔽、稽核紀錄全中文顯示並可匯出；機構基本資料可自行維護
- **型別安全的 API 介接**：由後端 `openapi.json` 產生 TypeScript 型別，契約變動時編譯期就會發現
- **響應式**：手機、平板、桌機皆可操作；表格可橫向捲動、導覽列與選單針對手機調整
- **測試**：201 個 Vitest 單元 / 元件測試，CI 跑型別檢查、lint、測試與建置

## 技術棧

| 項目 | 技術 | 版本 |
|------|------|------|
| 框架 | Vue 3 Composition API | 3.5 |
| 語言 | TypeScript（嚴格模式） | 6.0 |
| 狀態管理 | Pinia + pinia-plugin-persistedstate | 4.0 + 4.7 |
| 路由 | Vue Router | 5.3 |
| HTTP | Axios | 1.x |
| CSS | Tailwind CSS | 4.3 |
| 日曆 | FullCalendar | 6.1 |
| 圖表 | Chart.js + vue-chartjs | 4.5 + 5.3 |
| 簽名 | signature_pad | 5.1 |
| 建置 / 測試 | Vite + Vitest | 8.3 + 5.0 |
| API 型別 | openapi-typescript | 7.13 |

## 快速開始

### 環境需求

- Node.js 26（版本見 `.nvmrc`，可用 `nvm use`）
- npm 11+

### 安裝與啟動

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev
# → http://localhost:5173

# 檢查（CI 也會跑這些）
npm run type-check
npm run lint
npm test

# 後端 API 契約異動時：從相鄰的 consulcore-backend 同步 openapi.json 並重新產生型別
npm run api:sync && npm run gen:api

# 生產建置
npm run build

# 預覽建置結果
npm run preview
```

### 環境變數

`.env*` 不進版控。複製 `.env.example` 為 `.env.development`：

```
VITE_API_BASE_URL=http://localhost:5037/api
```

生產環境以 `.env.production` 或建置時的環境變數提供 `VITE_API_BASE_URL`。
**未設定時 `npm run build` 會直接失敗**，開發伺服器則會在頁面載入時報錯。

## 專案結構

```
src/
├── views/
│   ├── admin/                # 機構後台頁面
│   ├── client/               # 個案端頁面
│   └── *.vue                 # 登入、選角色、改密碼、404
├── components/
│   ├── ui/                   # 基礎 UI（AppButton, AppTable, AppModal, AppPagination...）
│   ├── layout/               # Layout（AdminLayout, ClientLayout, NotificationBell...）
│   ├── form/                 # 表單（FormBuilder, FormRenderer, SignaturePad...）
│   ├── appointment/          # 預約（AppointmentCalendar, QuickBookModal...）
│   ├── schedule/  session/  client/  billing/  performance/  dashboard/
├── stores/                   # Pinia stores（只管資料，不負責換頁）
├── services/                 # API 呼叫（httpService 統一處理 token、角色 header 與錯誤）
├── types/
│   ├── generated/api.ts      # 由 openapi/openapi.json 產生，勿手改
│   └── *.ts                  # 以 Schemas['XxxDto'] 引用產生的型別
├── composables/  utils/      # 共用邏輯（測試放在各資料夾的 __tests__/）
├── styles/                   # CSS 變數（雙風格、語意色）
└── router/                   # 路由與守衛（判斷規則在 navigation.ts）
openapi/openapi.json          # 後端 API 契約的副本（npm run api:sync）
```

## 雙風格系統

個案端與機構後台採用兩套獨立風格，透過 CSS 變數在 Layout 層級切換：

- **機構後台**（AdminLayout）：專業藍灰色系、緊湊間距、小圓角
- **個案端**（ClientLayout）：溫暖橙色系、寬鬆留白、大圓角

## 角色與權限

開設機構時各角色的預設範圍如下；擁有者可在「人員管理 → 角色權限」調整。

| 角色 | 預設存取範圍 |
|------|---------|
| 擁有者 Owner | 全部功能，包含考核管理、晤談紀錄解鎖、退費、機構設定 |
| 行政 Admin | 個案、預約、排班、收費、同意書、人員、診間、通知範本、稽核紀錄，考核唯讀 |
| 心理師 Therapist | 個案（建立、編輯）、預約、排班（檢視）、晤談紀錄與鎖定、同意書；不含收費與考核 |
| 個案 Client | 個案端：預約、同意書、通知、設定 |

晤談紀錄與個案備忘屬臨床私密資料，個案詳情頁只對治療中的心理師顯示。

## 後端與示範資料

後端倉庫：`consulcore-backend`（.NET 10 Web API）。開發時需先啟動後端，想看有內容的畫面可灌入示範資料：

```bash
cd ../consulcore-backend
dotnet run                        # → http://localhost:5037
python3 scripts/seed-demo.py      # 另開終端；需要空的資料庫
```

示範帳號（密碼一律 `Demo1234!`，只供本機展示）：

| 身份 | 帳號 |
|------|------|
| 擁有者 | `demo_owner` |
| 行政 | `demo_admin` |
| 心理師 | `demo_chen`、`demo_lin` |
| 個案 | 帳號隨機產生，`seed-demo.py` 執行完會列出 |

## 測試報告

[`docs/test-report.md`](./docs/test-report.md)：自動化檢查結果、37 個畫面的截圖（三種身份、桌機與手機），以及畫面操作時發現的 17 項問題與修正前後對照。
