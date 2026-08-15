# Sprint 5 — 前端：動態表單 + 個案紀錄

## 前置 API
- /api/form-templates：CRUD + clone
- /api/form-submissions：submit + get
- /api/session-notes：CRUD + lock/unlock
- /api/phrase-templates：CRUD
- /api/client-memos：CRUD

## 頁面

### 機構設定 — 表單建構器（OrgSettingView 子頁）
- FormBuilder：左側區塊列表（可拖曳排序+新增）→ 右側欄位列表（可拖曳+編輯label/type/options/required/validation）→ 下方即時預覽（FormRenderer）
- 系統預設範本：「複製後編輯」按鈕

### views/admin/SessionNoteEditorView.vue
- 頂部：個案姓名+日期+type toggle(session/closure)+鎖定狀態
- 格式切換：SOAP / 自由文字
- SOAP：SoapEditor（4 textarea，各帶片語按鈕）
- 自由文字：FreeTextEditor（單一大型 textarea+片語按鈕）
- PhrasePanel：側欄面板，依 category tab 切換，點擊插入游標位置，底部「管理片語」入口
- 帶入初評 checkbox（第一次晤談顯示）
- 底部：暫存 / 完成並鎖定 / 取消
- LockStatusBar：鎖定資訊+解鎖按鈕

### ClientDetailView Tab 3 諮商紀錄
- 初診評估（FormRenderer 唯讀）+ 晤談紀錄列表（日期+鎖定狀態，點擊展開）+ 結案摘要 + 新增按鈕

### ClientDetailView Tab 4 個案備忘
- ClientMemoList：依 category 分群，自己可編輯，他人唯讀

## 元件
- FormBuilder.vue, FormRenderer.vue, PhrasePanel.vue（components/form/）
- SoapEditor.vue, FreeTextEditor.vue, LockStatusBar.vue（components/session/）
- ClientMemoList.vue（components/client/）

## Store / Service / Type
- sessionNoteStore, formBuilderStore
- sessionNoteService, formService, phraseService, clientMemoService
- types/form.ts, types/sessionNote.ts, types/phrase.ts, types/clientMemo.ts

## 交付標準
- [ ] 表單建構器拖曳排序+欄位編輯+即時預覽
- [ ] FormRenderer 渲染動態表單可填寫
- [ ] 晤談紀錄 SOAP+自由文字模式
- [ ] 片語面板依 category 篩選+點擊插入
- [ ] 鎖定/解鎖正常
- [ ] 個案備忘 CRUD+唯讀/可編輯區分
- [ ] Tab 3+4 完整可用
