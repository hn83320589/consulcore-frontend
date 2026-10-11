<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useAppointmentStore } from '@/stores/appointmentStore'
import { useUiStore } from '@/stores/uiStore'
import AppButton from '@/components/ui/AppButton.vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import AppModal from '@/components/ui/AppModal.vue'
import AppInput from '@/components/ui/AppInput.vue'
import { toLocalDateString } from '@/utils/date'
import type { Appointment, AppointmentStatus } from '@/types'

const router = useRouter()
const authStore = useAuthStore()
const appointmentStore = useAppointmentStore()
const uiStore = useUiStore()

const activeTab = ref<'upcoming' | 'history'>('upcoming')

const today = toLocalDateString(new Date())

const upcoming = computed(() =>
  appointmentStore.appointments
    .filter((a) => a.date >= today && a.status === 'scheduled')
    .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`)),
)

const history = computed(() =>
  appointmentStore.appointments
    .filter((a) => a.date < today || a.status === 'completed' || a.status === 'cancelled' || a.status === 'no_show')
    .sort((a, b) => `${b.date}${b.startTime}`.localeCompare(`${a.date}${a.startTime}`)),
)

const statusLabel: Record<AppointmentStatus, string> = {
  scheduled: '已排定',
  completed: '已完成',
  cancelled: '已取消',
  no_show: '未出席',
}

const statusVariant: Record<AppointmentStatus, 'info' | 'success' | 'default' | 'danger' | 'warning'> = {
  scheduled: 'info',
  completed: 'default',
  cancelled: 'danger',
  no_show: 'warning',
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('zh-TW', {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
  })
}

// ── Cancel ──────────────────────────────────
const showCancelModal = ref(false)
const cancelTarget = ref<Appointment | null>(null)
const cancelReason = ref('')

function openCancel(apt: Appointment) {
  cancelTarget.value = apt
  cancelReason.value = ''
  showCancelModal.value = true
}

async function handleCancel() {
  if (!cancelTarget.value) return
  try {
    await appointmentStore.cancel(cancelTarget.value.id, cancelReason.value || undefined)
    uiStore.showToast('預約已取消', 'success')
    showCancelModal.value = false
  } catch {
    uiStore.showToast('取消失敗', 'error')
  }
}

onMounted(() => {
  if (authStore.clientProfileId != null) {
    appointmentStore.fetchAppointments({ clientProfileId: authStore.clientProfileId })
  }
})
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-app-text">我的預約</h1>
      <AppButton @click="router.push('/client/appointments/new')">預約諮商</AppButton>
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 border-b border-orange-100 mb-6">
      <button
        class="px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors"
        :class="activeTab === 'upcoming' ? 'text-primary border-primary' : 'text-app-text/50 border-transparent'"
        @click="activeTab = 'upcoming'"
      >
        即將到來 ({{ upcoming.length }})
      </button>
      <button
        class="px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors"
        :class="activeTab === 'history' ? 'text-primary border-primary' : 'text-app-text/50 border-transparent'"
        @click="activeTab = 'history'"
      >
        歷史紀錄
      </button>
    </div>

    <!-- Upcoming -->
    <div v-if="activeTab === 'upcoming'">
      <div v-if="upcoming.length === 0" class="text-center py-12">
        <p class="text-app-text/40 mb-3">目前沒有即將到來的預約</p>
        <AppButton @click="router.push('/client/appointments/new')">立即預約</AppButton>
      </div>
      <div v-else class="space-y-3">
        <div
          v-for="apt in upcoming"
          :key="apt.id"
          class="bg-white rounded-app border border-orange-100 p-5"
        >
          <div class="flex items-start justify-between">
            <div>
              <p class="font-medium text-app-text">{{ formatDate(apt.date) }}</p>
              <p class="text-sm text-app-text/60 mt-1">
                {{ apt.startTime }} - {{ apt.endTime }}
              </p>
              <p class="text-sm text-app-text/50 mt-0.5">
                {{ apt.therapistName }} · {{ apt.roomName }}
              </p>
            </div>
            <div class="flex items-center gap-2">
              <AppBadge :variant="statusVariant[apt.status]">
                {{ statusLabel[apt.status] }}
              </AppBadge>
            </div>
          </div>
          <div class="flex gap-2 mt-3 pt-3 border-t border-orange-50">
            <AppButton size="sm" variant="danger" @click="openCancel(apt)">取消預約</AppButton>
          </div>
        </div>
      </div>
    </div>

    <!-- History -->
    <div v-if="activeTab === 'history'">
      <div v-if="history.length === 0" class="text-center py-12 text-app-text/40">
        尚無歷史紀錄
      </div>
      <div v-else class="space-y-3">
        <div
          v-for="apt in history"
          :key="apt.id"
          class="bg-white rounded-app border border-orange-100 p-5 opacity-80"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-app-text">{{ formatDate(apt.date) }}</p>
              <p class="text-sm text-app-text/50">
                {{ apt.startTime }} - {{ apt.endTime }} · {{ apt.therapistName }}
              </p>
            </div>
            <AppBadge :variant="statusVariant[apt.status]">
              {{ statusLabel[apt.status] }}
            </AppBadge>
          </div>
        </div>
      </div>
    </div>

    <!-- Cancel Modal -->
    <AppModal :open="showCancelModal" title="取消預約" @close="showCancelModal = false">
      <p class="text-sm text-app-text/70 mb-4">
        確定要取消 {{ cancelTarget ? formatDate(cancelTarget.date) : '' }}
        {{ cancelTarget?.startTime }} 的預約嗎？
      </p>
      <AppInput v-model="cancelReason" label="取消原因" placeholder="選填" />

      <template #footer>
        <AppButton variant="secondary" @click="showCancelModal = false">返回</AppButton>
        <AppButton variant="danger" @click="handleCancel">確認取消</AppButton>
      </template>
    </AppModal>
  </div>
</template>
