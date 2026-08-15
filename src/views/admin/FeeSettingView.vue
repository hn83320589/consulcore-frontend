<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useBillingStore } from '@/stores/billingStore'
import { useUiStore } from '@/stores/uiStore'
import AppButton from '@/components/ui/AppButton.vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import AppModal from '@/components/ui/AppModal.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import AppTable from '@/components/ui/AppTable.vue'
import type { TableColumn } from '@/components/ui/AppTable.vue'
import type {
  FeeSchedule, CreateFeeScheduleRequest,
  Package as Pkg, CreatePackageRequest,
  Discount, CreateDiscountRequest, DiscountType,
} from '@/types'
import type { SessionType, VisitType } from '@/types'

const billingStore = useBillingStore()
const uiStore = useUiStore()

const activeTab = ref<'fees' | 'packages' | 'discounts'>('fees')

const sessionTypeOptions = [
  { label: '個別', value: 'individual' },
  { label: '伴侶', value: 'couple' },
  { label: '家庭', value: 'family' },
]
const visitTypeOptions = [
  { label: '初診', value: 'initial' },
  { label: '複診', value: 'follow_up' },
]

function sessionTypeLabel(v: SessionType): string {
  return sessionTypeOptions.find((o) => o.value === v)?.label ?? v
}
function visitTypeLabel(v: VisitType): string {
  return visitTypeOptions.find((o) => o.value === v)?.label ?? v
}

// ══════════════════════════════════════════════
// Tab 1: Fee Schedules
// ══════════════════════════════════════════════
const feeColumns: TableColumn[] = [
  { key: 'name', label: '名稱' },
  { key: 'sessionType', label: '諮商類型', width: '90px' },
  { key: 'visitType', label: '初/複診', width: '80px' },
  { key: 'amount', label: '金額', width: '100px' },
  { key: 'therapistName', label: '專屬心理師' },
  { key: 'isActive', label: '狀態', width: '70px' },
  { key: 'actions', label: '操作', width: '140px' },
]
const feeTableData = computed(() => billingStore.feeSchedules as unknown as Record<string, unknown>[])

const showFeeModal = ref(false)
const editingFee = ref<FeeSchedule | null>(null)
const feeForm = ref({
  name: '', amount: '',
  sessionType: 'individual' as SessionType,
  visitType: 'follow_up' as VisitType,
})
const feeSaving = ref(false)

function openFeeModal(fee?: FeeSchedule) {
  editingFee.value = fee ?? null
  feeForm.value = fee
    ? { name: fee.name, amount: String(fee.amount), sessionType: fee.sessionType, visitType: fee.visitType }
    : { name: '', amount: '', sessionType: 'individual', visitType: 'follow_up' }
  showFeeModal.value = true
}

async function saveFee() {
  feeSaving.value = true
  try {
    if (editingFee.value) {
      // Update 僅允許 name / amount
      await billingStore.updateFeeSchedule(editingFee.value.id, {
        name: feeForm.value.name,
        amount: Number(feeForm.value.amount),
      })
    } else {
      const payload: CreateFeeScheduleRequest = {
        name: feeForm.value.name,
        amount: Number(feeForm.value.amount),
        sessionType: feeForm.value.sessionType,
        visitType: feeForm.value.visitType,
      }
      await billingStore.createFeeSchedule(payload)
    }
    uiStore.showToast('費率已儲存', 'success')
    showFeeModal.value = false
  } catch { uiStore.showToast('儲存失敗', 'error') }
  finally { feeSaving.value = false }
}

async function toggleFee(fee: FeeSchedule) {
  await billingStore.toggleFeeSchedule(fee.id, !fee.isActive)
  uiStore.showToast(`已${fee.isActive ? '停用' : '啟用'}`, 'success')
}

// ══════════════════════════════════════════════
// Tab 2: Packages
// ══════════════════════════════════════════════
const pkgColumns: TableColumn[] = [
  { key: 'name', label: '名稱' },
  { key: 'sessionType', label: '諮商類型', width: '90px' },
  { key: 'totalSessions', label: '次數', width: '70px' },
  { key: 'totalAmount', label: '總額', width: '100px' },
  { key: 'perSessionAmount', label: '單價', width: '80px' },
  { key: 'validDays', label: '有效天數', width: '90px' },
  { key: 'isActive', label: '狀態', width: '70px' },
  { key: 'actions', label: '操作', width: '140px' },
]
const pkgTableData = computed(() => billingStore.packages as unknown as Record<string, unknown>[])

const showPkgModal = ref(false)
const editingPkg = ref<Pkg | null>(null)
const pkgForm = ref({
  name: '',
  sessionType: 'individual' as SessionType,
  totalSessions: '', totalAmount: '', validDays: '',
})
const pkgSaving = ref(false)

function openPkgModal(pkg?: Pkg) {
  editingPkg.value = pkg ?? null
  pkgForm.value = pkg
    ? {
        name: pkg.name, sessionType: pkg.sessionType,
        totalSessions: String(pkg.totalSessions), totalAmount: String(pkg.totalAmount),
        validDays: String(pkg.validDays),
      }
    : { name: '', sessionType: 'individual', totalSessions: '', totalAmount: '', validDays: '' }
  showPkgModal.value = true
}

async function savePkg() {
  pkgSaving.value = true
  try {
    if (editingPkg.value) {
      // Update 不可改 totalSessions
      await billingStore.updatePackage(editingPkg.value.id, {
        name: pkgForm.value.name,
        totalAmount: Number(pkgForm.value.totalAmount),
        validDays: pkgForm.value.validDays ? Number(pkgForm.value.validDays) : undefined,
      })
    } else {
      const payload: CreatePackageRequest = {
        name: pkgForm.value.name,
        sessionType: pkgForm.value.sessionType,
        totalSessions: Number(pkgForm.value.totalSessions),
        totalAmount: Number(pkgForm.value.totalAmount),
        validDays: pkgForm.value.validDays ? Number(pkgForm.value.validDays) : undefined,
      }
      await billingStore.createPackage(payload)
    }
    uiStore.showToast('套餐已儲存', 'success')
    showPkgModal.value = false
  } catch { uiStore.showToast('儲存失敗', 'error') }
  finally { pkgSaving.value = false }
}

async function togglePkg(pkg: Pkg) {
  await billingStore.togglePackage(pkg.id, !pkg.isActive)
  uiStore.showToast(`已${pkg.isActive ? '停用' : '啟用'}`, 'success')
}

// ══════════════════════════════════════════════
// Tab 3: Discounts
// ══════════════════════════════════════════════
const discColumns: TableColumn[] = [
  { key: 'name', label: '名稱' },
  { key: 'discountType', label: '類型', width: '80px' },
  { key: 'value', label: '數值', width: '80px' },
  { key: 'applicableRole', label: '角色限定', width: '90px' },
  { key: 'isActive', label: '狀態', width: '70px' },
  { key: 'actions', label: '操作', width: '140px' },
]
const discTableData = computed(() => billingStore.discounts as unknown as Record<string, unknown>[])

const showDiscModal = ref(false)
const editingDisc = ref<Discount | null>(null)
const discForm = ref({
  name: '',
  discountType: 'percentage' as DiscountType,
  value: '',
  applicableRole: '',
})
const discSaving = ref(false)

const typeOptions = [
  { label: '百分比', value: 'percentage' },
  { label: '固定金額', value: 'fixed_amount' },
]

function discountValue(d: Discount): string {
  return d.discountType === 'percentage' ? `${d.percentageValue ?? 0}%` : `$${d.fixedAmount ?? 0}`
}

function openDiscModal(disc?: Discount) {
  editingDisc.value = disc ?? null
  discForm.value = disc
    ? {
        name: disc.name,
        discountType: disc.discountType,
        value: String(disc.discountType === 'percentage' ? disc.percentageValue ?? '' : disc.fixedAmount ?? ''),
        applicableRole: disc.applicableRole ?? '',
      }
    : { name: '', discountType: 'percentage', value: '', applicableRole: '' }
  showDiscModal.value = true
}

async function saveDisc() {
  discSaving.value = true
  try {
    const isPercentage = discForm.value.discountType === 'percentage'
    const numValue = Number(discForm.value.value)
    if (editingDisc.value) {
      // Update 不含 discountType / applicableRole / therapistUserId
      await billingStore.updateDiscount(editingDisc.value.id, {
        name: discForm.value.name,
        percentageValue: isPercentage ? numValue : undefined,
        fixedAmount: isPercentage ? undefined : numValue,
      })
    } else {
      const payload: CreateDiscountRequest = {
        name: discForm.value.name,
        discountType: discForm.value.discountType,
        percentageValue: isPercentage ? numValue : undefined,
        fixedAmount: isPercentage ? undefined : numValue,
        applicableRole: discForm.value.applicableRole || undefined,
      }
      await billingStore.createDiscount(payload)
    }
    uiStore.showToast('折扣已儲存', 'success')
    showDiscModal.value = false
  } catch { uiStore.showToast('儲存失敗', 'error') }
  finally { discSaving.value = false }
}

async function toggleDisc(disc: Discount) {
  await billingStore.toggleDiscount(disc.id, !disc.isActive)
  uiStore.showToast(`已${disc.isActive ? '停用' : '啟用'}`, 'success')
}

// ── Init ────────────────────────────────────
onMounted(() => Promise.all([
  billingStore.fetchFeeSchedules(),
  billingStore.fetchPackages(),
  billingStore.fetchDiscounts(),
]))
</script>

<template>
  <div>
    <h1 class="text-xl font-bold text-app-text mb-6">費率設定</h1>

    <!-- Tabs -->
    <div class="flex gap-1 border-b border-gray-200 mb-6">
      <button
        v-for="tab in ([
          { key: 'fees', label: '費率表' },
          { key: 'packages', label: '套餐方案' },
          { key: 'discounts', label: '折扣設定' },
        ] as const)"
        :key="tab.key"
        class="px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors"
        :class="activeTab === tab.key ? 'text-primary border-primary' : 'text-gray-500 border-transparent'"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- ═══ Fee Schedules ═══ -->
    <div v-if="activeTab === 'fees'">
      <div class="flex justify-end mb-4">
        <AppButton @click="openFeeModal()">新增費率</AppButton>
      </div>
      <AppTable :columns="feeColumns" :data="feeTableData">
        <template #cell-sessionType="{ value }"> {{ sessionTypeLabel(value as SessionType) }} </template>
        <template #cell-visitType="{ value }"> {{ visitTypeLabel(value as VisitType) }} </template>
        <template #cell-amount="{ value }"> ${{ Number(value).toLocaleString() }} </template>
        <template #cell-therapistName="{ value }"> {{ value ?? '全機構' }} </template>
        <template #cell-isActive="{ row }">
          <AppBadge :variant="(row as unknown as FeeSchedule).isActive ? 'success' : 'danger'">
            {{ (row as unknown as FeeSchedule).isActive ? '啟用' : '停用' }}
          </AppBadge>
        </template>
        <template #cell-actions="{ row }">
          <div class="flex gap-1">
            <AppButton size="sm" variant="ghost" @click="openFeeModal(row as unknown as FeeSchedule)">編輯</AppButton>
            <AppButton size="sm" :variant="(row as unknown as FeeSchedule).isActive ? 'danger' : 'secondary'" @click="toggleFee(row as unknown as FeeSchedule)">
              {{ (row as unknown as FeeSchedule).isActive ? '停用' : '啟用' }}
            </AppButton>
          </div>
        </template>
      </AppTable>
    </div>

    <!-- ═══ Packages ═══ -->
    <div v-if="activeTab === 'packages'">
      <div class="flex justify-end mb-4">
        <AppButton @click="openPkgModal()">新增套餐</AppButton>
      </div>
      <AppTable :columns="pkgColumns" :data="pkgTableData">
        <template #cell-sessionType="{ value }"> {{ sessionTypeLabel(value as SessionType) }} </template>
        <template #cell-totalAmount="{ value }"> ${{ Number(value).toLocaleString() }} </template>
        <template #cell-perSessionAmount="{ value }"> ${{ Number(value).toLocaleString() }} </template>
        <template #cell-validDays="{ value }"> {{ value }} 天 </template>
        <template #cell-isActive="{ row }">
          <AppBadge :variant="(row as unknown as Pkg).isActive ? 'success' : 'danger'">
            {{ (row as unknown as Pkg).isActive ? '啟用' : '停用' }}
          </AppBadge>
        </template>
        <template #cell-actions="{ row }">
          <div class="flex gap-1">
            <AppButton size="sm" variant="ghost" @click="openPkgModal(row as unknown as Pkg)">編輯</AppButton>
            <AppButton size="sm" :variant="(row as unknown as Pkg).isActive ? 'danger' : 'secondary'" @click="togglePkg(row as unknown as Pkg)">
              {{ (row as unknown as Pkg).isActive ? '停用' : '啟用' }}
            </AppButton>
          </div>
        </template>
      </AppTable>
    </div>

    <!-- ═══ Discounts ═══ -->
    <div v-if="activeTab === 'discounts'">
      <div class="flex justify-end mb-4">
        <AppButton @click="openDiscModal()">新增折扣</AppButton>
      </div>
      <AppTable :columns="discColumns" :data="discTableData">
        <template #cell-discountType="{ value }"> {{ value === 'percentage' ? '百分比' : '固定金額' }} </template>
        <template #cell-value="{ row }">
          {{ discountValue(row as unknown as Discount) }}
        </template>
        <template #cell-applicableRole="{ value }"> {{ value ?? '不限' }} </template>
        <template #cell-isActive="{ row }">
          <AppBadge :variant="(row as unknown as Discount).isActive ? 'success' : 'danger'">
            {{ (row as unknown as Discount).isActive ? '啟用' : '停用' }}
          </AppBadge>
        </template>
        <template #cell-actions="{ row }">
          <div class="flex gap-1">
            <AppButton size="sm" variant="ghost" @click="openDiscModal(row as unknown as Discount)">編輯</AppButton>
            <AppButton size="sm" :variant="(row as unknown as Discount).isActive ? 'danger' : 'secondary'" @click="toggleDisc(row as unknown as Discount)">
              {{ (row as unknown as Discount).isActive ? '停用' : '啟用' }}
            </AppButton>
          </div>
        </template>
      </AppTable>
    </div>

    <!-- Fee Modal -->
    <AppModal :open="showFeeModal" :title="editingFee ? '編輯費率' : '新增費率'" @close="showFeeModal = false">
      <form class="space-y-4" @submit.prevent="saveFee">
        <AppInput v-model="feeForm.name" label="名稱" placeholder="例：個別諮商" />
        <AppInput v-model="feeForm.amount" label="金額" type="number" placeholder="2000" />
        <AppSelect
          v-if="!editingFee"
          v-model="(feeForm.sessionType as string)"
          label="諮商類型"
          :options="sessionTypeOptions"
        />
        <AppSelect
          v-if="!editingFee"
          v-model="(feeForm.visitType as string)"
          label="初/複診"
          :options="visitTypeOptions"
        />
      </form>
      <template #footer>
        <AppButton variant="secondary" @click="showFeeModal = false">取消</AppButton>
        <AppButton :loading="feeSaving" @click="saveFee">儲存</AppButton>
      </template>
    </AppModal>

    <!-- Package Modal -->
    <AppModal :open="showPkgModal" :title="editingPkg ? '編輯套餐' : '新增套餐'" @close="showPkgModal = false">
      <form class="space-y-4" @submit.prevent="savePkg">
        <AppInput v-model="pkgForm.name" label="名稱" placeholder="例：10 次套餐" />
        <AppSelect
          v-if="!editingPkg"
          v-model="(pkgForm.sessionType as string)"
          label="諮商類型"
          :options="sessionTypeOptions"
        />
        <AppInput v-if="!editingPkg" v-model="pkgForm.totalSessions" label="次數" type="number" />
        <AppInput v-model="pkgForm.totalAmount" label="總金額" type="number" />
        <AppInput v-model="pkgForm.validDays" label="有效天數" type="number" placeholder="選填" />
      </form>
      <template #footer>
        <AppButton variant="secondary" @click="showPkgModal = false">取消</AppButton>
        <AppButton :loading="pkgSaving" @click="savePkg">儲存</AppButton>
      </template>
    </AppModal>

    <!-- Discount Modal -->
    <AppModal :open="showDiscModal" :title="editingDisc ? '編輯折扣' : '新增折扣'" @close="showDiscModal = false">
      <form class="space-y-4" @submit.prevent="saveDisc">
        <AppInput v-model="discForm.name" label="名稱" />
        <AppSelect
          v-if="!editingDisc"
          v-model="(discForm.discountType as string)"
          label="類型"
          :options="typeOptions"
        />
        <AppInput v-model="discForm.value" label="數值" type="number" :placeholder="discForm.discountType === 'percentage' ? '0-100' : '金額'" />
        <AppInput v-if="!editingDisc" v-model="discForm.applicableRole" label="角色限定" placeholder="選填，例：vip" />
      </form>
      <template #footer>
        <AppButton variant="secondary" @click="showDiscModal = false">取消</AppButton>
        <AppButton :loading="discSaving" @click="saveDisc">儲存</AppButton>
      </template>
    </AppModal>
  </div>
</template>
