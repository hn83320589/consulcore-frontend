# 諮心管理 ConsulCore — Frontend

心理諮商所全流程執業管理工具的前端 SPA。

## 技術棧

| 項目 | 技術 | 版本 |
|------|------|------|
| 框架 | Vue 3 Composition API | 3.5+ |
| 語言 | TypeScript（嚴格模式） | 5.x |
| 狀態管理 | Pinia + pinia-plugin-persistedstate | 3.x + 4.x |
| HTTP | Axios | 1.x |
| CSS | Tailwind CSS | 3.x |
| 日曆 | FullCalendar | 6.x |
| 圖表 | Chart.js + vue-chartjs | 4.x |
| 簽名 | signature_pad | 5.x |
| 建置 | Vite | 8.x |
| 路由 | Vue Router | 4.x |

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

| 角色 | 存取範圍 |
|------|---------|
| Owner | 全部功能 + 營收報表 + 稽核紀錄 + 違規管理 |
| Therapist | 個案管理 + 晤談紀錄 + 預約 + 排班 + 績效（自己） |
| Admin | 預約管理 + 個案管理 + 收費 + 排班 |
| Client | 個案端（預約 + 同意書 + 通知 + 設定） |

## 後端

後端倉庫：`consulcore-backend`（.NET 10 Web API）

開發時需先啟動後端：

```bash
cd ../consulcore-backend
dotnet run
# → http://localhost:5037
```
