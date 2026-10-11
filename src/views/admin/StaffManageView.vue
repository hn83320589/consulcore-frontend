<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useStaffStore } from '@/stores/staffStore'
import { useUiStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'
import { assignableRoles, canManageUser } from '@/utils/staffAccess'
import AppTable from '@/components/ui/AppTable.vue'
import type { TableColumn } from '@/components/ui/AppTable.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import AppModal from '@/components/ui/AppModal.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import type {
  UserResponse,
  CreateUserRequest,
  UpdateUserRequest,
  RoleResponse,
} from '@/types'
import { PERMISSION_GROUPS } from '@/types'
import { notifyError } from '@/utils/notifyError'

const staffStore = useStaffStore()
const uiStore = useUiStore()
const authStore = useAuthStore()

// ── Tab ─────────────────────────────────────
const activeTab = ref<'users' | 'permissions'>('users')

// ── User List ───────────────────────────────
const columns: TableColumn[] = [
  { key: 'displayName', label: '姓名' },
  { key: 'username', label: '帳號' },
  { key: 'roles', label: '角色', width: '160px' },
  { key: 'isActive', label: '狀態', width: '80px' },
  { key: 'actions', label: '操作', width: '200px' },
]

const tableData = computed(() =>
  staffStore.users,
)

// ── User Modal ──────────────────────────────
const showUserModal = ref(false)
const editingUser = ref<UserResponse | null>(null)
const userForm = ref<{
  username: string
  password: string
  displayName: string
  email: string
  phone: string
  roles: string[]
}>({
  username: '',
  password: '',
  displayName: '',
  email: '',
  phone: '',
  roles: [],
})
const saving = ref(false)

// 角色多選來源（契約 7.1：roles: string[]）
const roleChoices = computed(() => {
  const allowed = assignableRoles(staffStore.roles.map((r) => r.name), authStore.activeRole)
  return staffStore.roles
    .filter((r) => allowed.includes(r.name))
    .map((r) => ({ name: r.name, description: r.description }))
})

function toggleFormRole(name: string) {
  const idx = userForm.value.roles.indexOf(name)
  if (idx === -1) {
    userForm.value.roles.push(name)
  } else {
    userForm.value.roles.splice(idx, 1)
  }
}

const isEdit = computed(() => !!editingUser.value)
const modalTitle = computed(() => (isEdit.value ? '編輯人員' : '新增人員'))

function openCreateModal() {
  editingUser.value = null
  userForm.value = {
    username: '',
    password: '',
    displayName: '',
    email: '',
    phone: '',
    roles: [],
  }
  showUserModal.value = true
}

function openEditModal(user: UserResponse) {
  editingUser.value = user
  userForm.value = {
    username: user.username,
    password: '',
    displayName: user.displayName,
    email: user.email ?? '',
    phone: user.phone ?? '',
    roles: [...user.roles],
  }
  showUserModal.value = true
}

async function handleSaveUser() {
  if (userForm.value.roles.length === 0) {
    uiStore.showToast('請至少選擇一個角色', 'warning')
    return
  }
  saving.value = true
  try {
    if (isEdit.value && editingUser.value) {
      const payload: UpdateUserRequest = {
        email: userForm.value.email,
        displayName: userForm.value.displayName,
        phone: userForm.value.phone || null,
        roles: userForm.value.roles,
      }
      await staffStore.updateUser(editingUser.value.id, payload)
      uiStore.showToast('人員已更新', 'success')
    } else {
      const payload: CreateUserRequest = {
        username: userForm.value.username,
        email: userForm.value.email,
        password: userForm.value.password,
        displayName: userForm.value.displayName,
        phone: userForm.value.phone || null,
        roles: userForm.value.roles,
      }
      await staffStore.createUser(payload)
      uiStore.showToast('人員已新增', 'success')
    }
    showUserModal.value = false
  } catch (e) {
    notifyError(e, '操作失敗，請稍後再試')
  } finally {
    saving.value = false
  }
}

// ── Toggle Active ───────────────────────────
async function handleToggleActive(user: UserResponse) {
  const action = user.isActive ? '停用' : '啟用'
  try {
    await staffStore.toggleUserActive(user.id)
    uiStore.showToast(`已${action} ${user.displayName}`, 'success')
  } catch (e) {
    notifyError(e, `${action}失敗`)
  }
}

// ── Reset Password ──────────────────────────
const showResetModal = ref(false)
const resetTarget = ref<UserResponse | null>(null)
const newPassword = ref('')
const resetting = ref(false)

function openResetModal(user: UserResponse) {
  resetTarget.value = user
  newPassword.value = ''
  showResetModal.value = true
}

async function handleResetPassword() {
  if (!resetTarget.value) return
  resetting.value = true
  try {
    await staffStore.resetPassword(resetTarget.value.id, {
      newPassword: newPassword.value,
    })
    uiStore.showToast(`已重設 ${resetTarget.value.displayName} 的密碼`, 'success')
    showResetModal.value = false
  } catch (e) {
    notifyError(e, '重設密碼失敗')
  } finally {
    resetting.value = false
  }
}

// ── Permission Matrix ───────────────────────
const permissionGroups = PERMISSION_GROUPS
const selectedRoleId = ref('')

const selectedRole = computed<RoleResponse | undefined>(() =>
  staffStore.roles.find((r) => String(r.id) === selectedRoleId.value),
)

const permissionRoleOptions = computed(() =>
  staffStore.roles.map((r) => ({
    label: `${r.name}${r.isSystemDefault ? '（系統預設）' : ''}`,
    value: String(r.id),
  })),
)

function hasRolePermission(code: string): boolean {
  return selectedRole.value?.permissions.includes(code) ?? false
}

async function togglePermission(code: string) {
  if (!selectedRole.value) return
  const current = [...selectedRole.value.permissions]
  const idx = current.indexOf(code)
  if (idx === -1) {
    current.push(code)
  } else {
    current.splice(idx, 1)
  }
  try {
    await staffStore.updateRolePermissions(selectedRole.value.id, current)
    uiStore.showToast('權限已更新', 'success')
  } catch (e) {
    notifyError(e, '更新權限失敗')
  }
}

// ── Init ────────────────────────────────────
onMounted(async () => {
  await Promise.all([staffStore.fetchUsers(), staffStore.fetchRoles()])
  // 預設選第一個角色
  if (staffStore.roles.length > 0 && !selectedRoleId.value) {
    selectedRoleId.value = String(staffStore.roles[0]!.id)
  }
})
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-xl font-bold text-app-text">人員管理</h1>
      <AppButton v-if="activeTab === 'users'" @click="openCreateModal">
        新增人員
      </AppButton>
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 mb-6 border-b border-gray-200">
      <button
        class="px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px"
        :class="activeTab === 'users'
          ? 'text-primary border-primary'
          : 'text-gray-500 border-transparent hover:text-gray-700'"
        @click="activeTab = 'users'"
      >
        人員列表
      </button>
      <button
        class="px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px"
        :class="activeTab === 'permissions'
          ? 'text-primary border-primary'
          : 'text-gray-500 border-transparent hover:text-gray-700'"
        @click="activeTab = 'permissions'"
      >
        角色權限
      </button>
    </div>

    <!-- ── Users Tab ──────────────────────────── -->
    <div v-if="activeTab === 'users'">
      <AppTable :columns="columns" :data="tableData" :loading="staffStore.loading">
        <template #cell-roles="{ row }">
          {{ row.roles.join('、') }}
        </template>

        <template #cell-isActive="{ row }">
          <AppBadge :variant="row.isActive ? 'success' : 'danger'">
            {{ row.isActive ? '啟用' : '停用' }}
          </AppBadge>
        </template>

        <template #cell-actions="{ row }">
          <div v-if="canManageUser(row, authStore.activeRole)" class="flex gap-1">
            <AppButton size="sm" variant="ghost" @click="openEditModal(row)">
              編輯
            </AppButton>
            <AppButton
              size="sm"
              :variant="row.isActive ? 'danger' : 'secondary'"
              @click="handleToggleActive(row)"
            >
              {{ row.isActive ? '停用' : '啟用' }}
            </AppButton>
            <AppButton size="sm" variant="secondary" @click="openResetModal(row)">
              重設密碼
            </AppButton>
          </div>
        </template>
      </AppTable>
    </div>

    <!-- ── Permissions Tab ────────────────────── -->
    <div v-if="activeTab === 'permissions'">
      <div class="mb-4 max-w-xs">
        <AppSelect
          v-model="selectedRoleId"
          label="選擇角色"
          :options="permissionRoleOptions"
          placeholder="請選擇角色"
        />
      </div>

      <div v-if="selectedRole" class="bg-white border border-gray-200 rounded-app overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-200">
              <th class="px-4 py-3 text-left font-medium text-gray-600 w-40">模組</th>
              <th class="px-4 py-3 text-left font-medium text-gray-600">權限項目</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="group in permissionGroups"
              :key="group.module"
              class="border-b border-gray-100"
            >
              <td class="px-4 py-3 font-medium text-gray-700 align-top">
                {{ group.moduleLabel }}
              </td>
              <td class="px-4 py-3">
                <div class="flex flex-wrap gap-4">
                  <label
                    v-for="perm in group.permissions"
                    :key="perm.code"
                    class="flex items-center gap-1.5 cursor-pointer"
                    :class="selectedRole.isSystemDefault ? 'opacity-60 cursor-not-allowed' : ''"
                  >
                    <input
                      type="checkbox"
                      :checked="hasRolePermission(perm.code)"
                      :disabled="selectedRole.isSystemDefault"
                      class="accent-[var(--color-primary)]"
                      @change="togglePermission(perm.code)"
                    />
                    <span class="text-gray-600">{{ perm.label }}</span>
                  </label>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <p v-if="selectedRole.isSystemDefault" class="px-4 py-3 text-xs text-gray-400 border-t border-gray-100">
          系統預設角色的權限無法修改
        </p>
      </div>
    </div>

    <!-- ── User Modal ─────────────────────────── -->
    <AppModal :open="showUserModal" :title="modalTitle" @close="showUserModal = false">
      <form class="space-y-4" @submit.prevent="handleSaveUser">
        <AppInput
          v-if="!isEdit"
          v-model="userForm.username"
          label="帳號"
          placeholder="請輸入帳號"
        />
        <AppInput
          v-if="!isEdit"
          v-model="userForm.password"
          label="密碼"
          type="password"
          placeholder="請輸入密碼"
        />
        <AppInput v-model="userForm.displayName" label="姓名" placeholder="請輸入姓名" />
        <AppInput v-model="userForm.email" label="Email" type="email" placeholder="請輸入 Email" />
        <AppInput v-model="userForm.phone" label="電話" placeholder="選填" />
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">角色（可複選）</label>
          <div class="flex flex-wrap gap-4">
            <label
              v-for="role in roleChoices"
              :key="role.name"
              class="flex items-center gap-1.5 cursor-pointer"
            >
              <input
                type="checkbox"
                :checked="userForm.roles.includes(role.name)"
                class="accent-[var(--color-primary)]"
                @change="toggleFormRole(role.name)"
              />
              <span class="text-gray-600">{{ role.name }}</span>
            </label>
          </div>
        </div>
        <!-- 契約無使用者固定診間欄位；心理師與診間的關聯改由「診間設定」頁指派 -->
      </form>

      <template #footer>
        <AppButton variant="secondary" @click="showUserModal = false">取消</AppButton>
        <AppButton :loading="saving" @click="handleSaveUser">
          {{ isEdit ? '儲存' : '新增' }}
        </AppButton>
      </template>
    </AppModal>

    <!-- ── Reset Password Modal ───────────────── -->
    <AppModal :open="showResetModal" title="重設密碼" @close="showResetModal = false">
      <p class="text-sm text-gray-600 mb-4">
        為 <strong>{{ resetTarget?.displayName }}</strong> 設定新密碼
      </p>
      <AppInput
        v-model="newPassword"
        label="新密碼"
        type="password"
        placeholder="請輸入新密碼"
      />

      <template #footer>
        <AppButton variant="secondary" @click="showResetModal = false">取消</AppButton>
        <AppButton :loading="resetting" :disabled="!newPassword" @click="handleResetPassword">
          確認重設
        </AppButton>
      </template>
    </AppModal>
  </div>
</template>
