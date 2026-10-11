<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuditStore } from '@/stores/auditStore'
import { useUiStore } from '@/stores/uiStore'
import AppButton from '@/components/ui/AppButton.vue'

interface AuditChange {
  field: string
  before: string | null
  after: string | null
}

const auditStore = useAuditStore()
const uiStore = useUiStore()

const columns: { key: string; label: string; width?: string }[] = [
  { key: 'createdAt', label: '時間', width: '150px' },
  { key: 'userName', label: '操作者' },
  { key: 'action', label: '動作', width: '80px' },
  { key: 'resourceType', label: '資源', width: '100px' },
  { key: 'description', label: '描述' },
  { key: 'expand', label: '', width: '40px' },
]

// Filters
const filterStartDate = ref('')
const filterEndDate = ref('')
const filterUserId = ref('')
const filterAction = ref('')
const filterResourceType = ref('')

// Pagination
const page = ref(1)
const pageSize = ref(50)

async function loadLogs() {
  await auditStore.fetchLogs({
    startDate: filterStartDate.value || undefined,
    endDate: filterEndDate.value || undefined,
    userId: filterUserId.value ? Number(filterUserId.value) : undefined,
    action: filterAction.value || undefined,
    resourceType: filterResourceType.value || undefined,
    page: page.value,
    pageSize: pageSize.value,
  })
}

function applyFilters() {
  page.value = 1
  loadLogs()
}

function prevPage() {
  if (page.value > 1) {
    page.value--
    loadLogs()
  }
}

function nextPage() {
  page.value++
  loadLogs()
}

// Expand
const expandedId = ref<number | null>(null)
function toggleExpand(id: number) {
  expandedId.value = expandedId.value === id ? null : id
}

// 解析 changes JSON 字串為 diff 結構；解析失敗回傳 null
function parseChanges(changes?: string | null): AuditChange[] | null {
  if (!changes) return null
  try {
    const parsed = JSON.parse(changes)
    return Array.isArray(parsed) ? (parsed as AuditChange[]) : null
  } catch {
    return null
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('zh-TW')
}

// Export：CSV / PDF 共用單一端點，帶不同 format
async function handleExport(format: 'csv' | 'pdf') {
  try {
    const blob = await auditStore.exportLogs({
      action: filterAction.value || undefined,
      resourceType: filterResourceType.value || undefined,
      startDate: filterStartDate.value || undefined,
      endDate: filterEndDate.value || undefined,
      format,
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit_${new Date().toISOString().slice(0, 10)}.${format}`
    a.click()
    URL.revokeObjectURL(url)
    uiStore.showToast('已匯出', 'success')
  } catch { uiStore.showToast('匯出失敗', 'error') }
}

const actionOptions = ['create', 'update', 'delete', 'login', 'lock', 'unlock', 'status_change']

// 資源型別為 snake_case（契約 7.15）；下拉列常用者，顯示用中文 label
const resourceLabels: Record<string, string> = {
  client_profile: '個案',
  appointment: '預約',
  appointment_series: '常態預約',
  session_note: '晤談紀錄',
  consent_record: '同意書簽署',
  payment_record: '付款紀錄',
  client_package: '個案套餐',
  schedule_slot: '排班時段',
  room: '診間',
  user: '使用者',
  performance_review: '考核',
  violation_record: '違規紀錄',
}
const resourceOptions = Object.entries(resourceLabels).map(([value, label]) => ({ value, label }))
function resourceLabel(v: string): string {
  return resourceLabels[v] ?? v
}

onMounted(() => loadLogs())
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-xl font-bold text-app-text">稽核紀錄</h1>
      <div class="flex gap-2">
        <AppButton size="sm" variant="secondary" @click="handleExport('csv')">匯出 CSV</AppButton>
        <AppButton size="sm" variant="secondary" @click="handleExport('pdf')">匯出 PDF</AppButton>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap items-end gap-3 mb-4">
      <div>
        <label class="block text-xs text-gray-500 mb-1">從</label>
        <input v-model="filterStartDate" type="date" class="px-3 py-1.5 border border-gray-300 rounded-app text-sm" @change="applyFilters()" />
      </div>
      <div>
        <label class="block text-xs text-gray-500 mb-1">到</label>
        <input v-model="filterEndDate" type="date" class="px-3 py-1.5 border border-gray-300 rounded-app text-sm" @change="applyFilters()" />
      </div>
      <div>
        <label class="block text-xs text-gray-500 mb-1">動作</label>
        <select v-model="filterAction" class="px-3 py-1.5 border border-gray-300 rounded-app text-sm bg-white" @change="applyFilters()">
          <option value="">全部</option>
          <option v-for="a in actionOptions" :key="a" :value="a">{{ a }}</option>
        </select>
      </div>
      <div>
        <label class="block text-xs text-gray-500 mb-1">資源</label>
        <select v-model="filterResourceType" class="px-3 py-1.5 border border-gray-300 rounded-app text-sm bg-white" @change="applyFilters()">
          <option value="">全部</option>
          <option v-for="r in resourceOptions" :key="r.value" :value="r.value">{{ r.label }}</option>
        </select>
      </div>
    </div>

    <!-- Table with expandable rows -->
    <div class="overflow-x-auto border border-gray-200 rounded-app">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-gray-50 border-b border-gray-200">
            <th v-for="col in columns" :key="col.key" class="px-4 py-3 text-left font-medium text-gray-600" :style="col.width ? {width:col.width} : {}">
              {{ col.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-if="auditStore.loading">
            <tr><td :colspan="columns.length" class="px-4 py-8 text-center text-gray-400">載入中...</td></tr>
          </template>
          <template v-else-if="auditStore.logs.length === 0">
            <tr><td :colspan="columns.length" class="px-4 py-8 text-center text-gray-400">暫無紀錄</td></tr>
          </template>
          <template v-for="log in auditStore.logs" v-else :key="log.id">
            <tr class="border-b border-gray-100 hover:bg-gray-50">
              <td class="px-4 py-3 text-xs text-gray-500">{{ formatDate(log.createdAt) }}</td>
              <td class="px-4 py-3">{{ log.userName ?? '—' }}</td>
              <td class="px-4 py-3"><span class="px-1.5 py-0.5 bg-gray-100 rounded text-xs">{{ log.action }}</span></td>
              <td class="px-4 py-3 text-xs">{{ resourceLabel(log.resourceType) }}</td>
              <td class="px-4 py-3 text-gray-600 truncate max-w-[200px]">{{ log.description ?? '—' }}</td>
              <td class="px-4 py-3">
                <button
                  v-if="log.changes"
                  class="text-xs text-primary hover:underline"
                  @click="toggleExpand(log.id)"
                >
                  {{ expandedId === log.id ? '▲' : '▼' }}
                </button>
              </td>
            </tr>
            <!-- Expanded: Changes diff -->
            <tr v-if="expandedId === log.id && log.changes">
              <td :colspan="columns.length" class="px-4 py-3 bg-gray-50">
                <table v-if="parseChanges(log.changes)" class="w-full text-xs">
                  <thead>
                    <tr class="text-gray-500">
                      <th class="text-left py-1 w-1/4">欄位</th>
                      <th class="text-left py-1 w-3/8">修改前</th>
                      <th class="text-left py-1 w-3/8">修改後</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(c, i) in parseChanges(log.changes)" :key="i" class="border-t border-gray-100">
                      <td class="py-1 font-medium">{{ c.field }}</td>
                      <td class="py-1 text-red-500">{{ c.before ?? '—' }}</td>
                      <td class="py-1 text-green-600">{{ c.after ?? '—' }}</td>
                    </tr>
                  </tbody>
                </table>
                <!-- parse 失敗：顯示原字串 -->
                <pre v-else class="text-xs whitespace-pre-wrap text-gray-600">{{ log.changes }}</pre>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-end gap-3 mt-4">
      <AppButton size="sm" variant="secondary" :disabled="page <= 1 || auditStore.loading" @click="prevPage()">上一頁</AppButton>
      <span class="text-sm text-gray-500">第 {{ page }} 頁</span>
      <AppButton size="sm" variant="secondary" :disabled="auditStore.logs.length < pageSize || auditStore.loading" @click="nextPage()">下一頁</AppButton>
    </div>
  </div>
</template>
