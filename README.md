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

- Node.js 20+
- npm 10+

### 安裝與啟動

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev
# → http://localhost:5173

# TypeScript 型別檢查
npm run type-check

# 生產建置
npm run build

# 預覽建置結果
npm run preview
```

### 環境變數

建立 `.env.development`（已包含在專案中）：

```
VITE_API_BASE_URL=http://localhost:5037/api
```

生產環境建立 `.env.production`：

```
VITE_API_BASE_URL=https://your-api-domain.com/api
```

## 專案結構

```
src/
├── views/                    # 頁面（26 頁）
│   ├── admin/                #   機構後台（15 頁）
│   ├── client/               #   個案端（6 頁）
│   ├── LoginView.vue
│   └── RoleSelectView.vue
├── components/               # 元件（~50 個）
│   ├── ui/                   #   基礎 UI（AppButton, AppTable, AppModal...）
│   ├── layout/               #   Layout（AdminLayout, ClientLayout...）
│   ├── form/                 #   表單（FormBuilder, FormRenderer, SignaturePad...）
│   ├── appointment/          #   預約（Calendar, Card, QuickBookModal...）
│   ├── schedule/             #   排班（TemplateEditor, SlotGrid...）
│   ├── session/              #   晤談（SoapEditor, FreeTextEditor...）
│   ├── client/               #   個案（ClientInfoCard, ConsentStatus...）
│   ├── billing/              #   收費（PaymentStatusBadge, RevenueChart...）
│   ├── performance/          #   考核（MetricsCard, MetricsTrend...）
│   └── dashboard/            #   Dashboard
├── stores/                   # Pinia Stores（13 個）
├── services/                 # API Services（16 個）
├── types/                    # TypeScript 型別（12 個）
├── composables/              # Vue Composables
├── styles/                   # CSS（variables.css + main.css）
└── router/                   # Vue Router + 守衛
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

後端倉庫：`consulcore-backend`（.NET 9 Web API）

開發時需先啟動後端：

```bash
cd ../consulcore-backend
dotnet run
# → http://localhost:5037
```
