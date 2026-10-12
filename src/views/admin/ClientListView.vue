<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useClientStore } from '@/stores/clientStore'
import { useUiStore } from '@/stores/uiStore'
import AppTable from '@/components/ui/AppTable.vue'
import type { TableColumn } from '@/components/ui/AppTable.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import AppModal from '@/components/ui/AppModal.vue'
import AppInput from '@/components/ui/AppInput.vue'
import ClientSearchBar from '@/components/client/ClientSearchBar.vue'
import InitialCredentialsModal from '@/components/client/InitialCredentialsModal.vue'
import { notifyError } from '@/utils/notifyError'
import { formatDate } from '@/utils/format'
import type { ClientProfile, CreateClientRequest, ClientStatus, InitialCredentials } from '@/types'

const router = useRouter()
const clientStore = useClientStore()
const uiStore = useUiStore()

// ── Table ───────────────────────────────────
const columns: TableColumn[] = [
  { key: 'name', label: '姓名' },
  { key: 'status', label: '狀態', width: '80px' },
  { key: 'therapists', label: '心理師' },
  { key: 'createdAt', label: '建檔日', width: '120px' },
  { key: 'actions', label: '操作', width: '80px' },
]

// 狀態非後端搜尋參數，於前端過濾
const statusFilter = ref<ClientStatus | ''>('')
const issuedCredentials = ref<InitialCredentials | null>(null)

const tableData = computed(() => {
  const list = statusFilter.value
    ? clientStore.clients.filter((c) => c.status === statusFilter.value)
    : clientStore.clients
  return list
})

const statusVariant: Record<ClientStatus, 'success' | 'warning' | 'danger' | 'default'> = {
  pending: 'warning',
  active: 'success',
  suspended: 'default',
  closed: 'danger',
}

const statusLabel: Record<ClientStatus, string> = {
  pending: '待處理',
  active: '進行中',
  suspended: '暫停',
  closed: '結案',
}

function therapistNames(client: ClientProfile): string {
  if (!client.therapists?.length) return '—'
  return client.therapists.map((t) => t.therapistName).join('、')
}

// ── Search ──────────────────────────────────
function handleSearch(params: { keyword: string; status: string; therapistId: string }) {
  statusFilter.value = (params.status as ClientStatus) || ''
  const keyword = params.keyword.trim()
  if (keyword) {
    clientStore.searchClients({ keyword })
  } else {
    clientStore.fetchClients()
  }
}

// ── Create Modal ────────────────────────────
const showCreateModal = ref(false)
const saving = ref(false)
const createForm = ref({
  name: '',
  gender: '',
  dateOfBirth: '',
  phone: '',
  email: '',
  idNumber: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  referralSource: '',
  createAccount: false,
})

function openCreateModal() {
  createForm.value = {
    name: '',
    gender: '',
    dateOfBirth: '',
    phone: '',
    email: '',
    idNumber: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    referralSource: '',
    createAccount: false,
  }
  showCreateModal.value = true
}

async function handleCreate() {
  saving.value = true
  try {
    const payload: CreateClientRequest = {
      name: createForm.value.name,
      gender: createForm.value.gender || undefined,
      dateOfBirth: createForm.value.dateOfBirth || undefined,
      phone: createForm.value.phone || undefined,
      email: createForm.value.email || undefined,
      idNumber: createForm.value.idNumber || undefined,
      emergencyContactName: createForm.value.emergencyContactName || undefined,
      emergencyContactPhone: createForm.value.emergencyContactPhone || undefined,
      referralSource: createForm.value.referralSource || undefined,
      createAccount: createForm.value.createAccount,
    }
    const created = await clientStore.createClient(payload)
    uiStore.showToast('個案已新增', 'success')
    showCreateModal.value = false
    // 有建立帳號時，後端只在這一次回傳初始帳密，交給櫃檯當場交付
    issuedCredentials.value = created.initialCredentials ?? null
  } catch (e) {
    notifyError(e, '新增失敗')
  } finally {
    saving.value = false
  }
}

function goToDetail(client: ClientProfile) {
  router.push(`/admin/clients/${client.id}`)
}

// ── Init ────────────────────────────────────
onMounted(() => clientStore.fetchClients())
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-xl font-bold text-app-text">個案管理</h1>
      <AppButton @click="openCreateModal">新增個案</AppButton>
    </div>

    <!-- Search Bar -->
    <div class="mb-4">
      <ClientSearchBar @search="handleSearch" />
    </div>

    <!-- Table -->
    <AppTable :columns="columns" :data="tableData" :loading="clientStore.loading">
      <template #cell-status="{ row }">
        <AppBadge :variant="statusVariant[row.status]">
          {{ statusLabel[row.status] }}
        </AppBadge>
      </template>

      <template #cell-therapists="{ row }">
        {{ therapistNames(row) }}
      </template>

      <template #cell-createdAt="{ row }">
        {{ formatDate(row.createdAt) }}
      </template>

      <template #cell-actions="{ row }">
        <AppButton size="sm" variant="ghost" @click="goToDetail(row)">
          查看
        </AppButton>
      </template>
    </AppTable>

    <!-- Create Modal -->
    <AppModal :open="showCreateModal" title="新增個案" width="max-w-xl" @close="showCreateModal = false">
      <form class="space-y-4" @submit.prevent="handleCreate">
        <div class="grid grid-cols-2 gap-4">
          <AppInput v-model="createForm.name" label="姓名" placeholder="必填" />
          <AppInput v-model="createForm.gender" label="性別" placeholder="選填" />
          <AppInput v-model="createForm.dateOfBirth" label="出生日期" type="date" />
          <AppInput v-model="createForm.idNumber" label="身分證字號" placeholder="選填" />
          <AppInput v-model="createForm.phone" label="電話" placeholder="選填" />
          <AppInput v-model="createForm.email" label="Email" type="email" placeholder="選填" />
          <AppInput v-model="createForm.emergencyContactName" label="緊急聯絡人" placeholder="選填" />
          <AppInput v-model="createForm.emergencyContactPhone" label="緊急聯絡人電話" placeholder="選填" />
        </div>
        <AppInput v-model="createForm.referralSource" label="轉介來源" placeholder="選填" />

        <label class="flex items-center gap-2 mt-2">
          <input v-model="createForm.createAccount" type="checkbox" class="accent-primary" />
          <span class="text-sm text-gray-600">同時為此個案建立登入帳號</span>
        </label>
      </form>

      <template #footer>
        <AppButton variant="secondary" @click="showCreateModal = false">取消</AppButton>
        <AppButton :loading="saving" :disabled="!createForm.name" @click="handleCreate">
          新增
        </AppButton>
      </template>
    </AppModal>

    <InitialCredentialsModal :credentials="issuedCredentials" @close="issuedCredentials = null" />
  </div>
</template>
