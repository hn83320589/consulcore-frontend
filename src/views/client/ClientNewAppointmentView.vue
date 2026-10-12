<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useAppointmentStore } from '@/stores/appointmentStore'
import { useUiStore } from '@/stores/uiStore'
import AppButton from '@/components/ui/AppButton.vue'
import { toLocalDateString } from '@/utils/date'
import { notifyError } from '@/utils/notifyError'
import { formatDayWithWeekday } from '@/utils/format'
import { recentTherapistId } from '@/utils/appointmentStatus'
import type { ScheduleSlot } from '@/types'

const router = useRouter()
const authStore = useAuthStore()
const appointmentStore = useAppointmentStore()
const uiStore = useUiStore()

// ── Steps ───────────────────────────────────
const step = ref(1)

// ── Step 1: 選心理師 ────────────────────────
const recentId = computed(() => recentTherapistId(appointmentStore.appointments, toLocalDateString(new Date())))
const therapists = computed(() => {
  const map = new Map<number, string>()
  for (const slot of appointmentStore.availableSlots) {
    if (!map.has(slot.therapistUserId)) {
      map.set(slot.therapistUserId, slot.therapistName)
    }
  }
  // 最近預約的心理師排第一位，呼應「建議維持固定心理師」的提示
  return Array.from(map, ([id, name]) => ({ id, name }))
    .sort((a, b) => Number(b.id === recentId.value) - Number(a.id === recentId.value))
})

const selectedTherapistId = ref<number | null>(null)

function selectTherapist(id: number) {
  selectedTherapistId.value = id
  step.value = 2
}

// ── Step 2: 選日期+時段 ─────────────────────
const therapistSlots = computed(() =>
  appointmentStore.availableSlots.filter(
    (s) => s.therapistUserId === selectedTherapistId.value,
  ),
)

const slotsByDate = computed(() => {
  const map = new Map<string, ScheduleSlot[]>()
  for (const s of therapistSlots.value) {
    const existing = map.get(s.date)
    if (existing) {
      existing.push(s)
    } else {
      map.set(s.date, [s])
    }
  }
  return Array.from(map).sort(([a], [b]) => a.localeCompare(b))
})

const selectedSlot = ref<ScheduleSlot | null>(null)

function selectSlot(slot: ScheduleSlot) {
  selectedSlot.value = slot
  step.value = 3
}

// ── Step 3: 確認 ────────────────────────────
const submitting = ref(false)

async function handleConfirm() {
  if (!selectedSlot.value || authStore.clientProfileId == null) return
  submitting.value = true
  try {
    await appointmentStore.createAppointment({
      clientProfileId: authStore.clientProfileId,
      scheduleSlotId: selectedSlot.value.id,
    })
    uiStore.showToast('預約成功！', 'success')
    await router.push('/client/appointments')
  } catch (e) {
    notifyError(e, '預約失敗，請稍後再試')
  } finally {
    submitting.value = false
  }
}

// ── Init ────────────────────────────────────
onMounted(() => {
  const now = new Date()
  const startDate = toLocalDateString(now)
  const endDate = toLocalDateString(new Date(now.getFullYear(), now.getMonth() + 1, 0))
  appointmentStore.fetchAvailableSlots({ startDate, endDate })
  if (authStore.clientProfileId != null) {
    appointmentStore.fetchAppointments({ clientProfileId: authStore.clientProfileId })
      .catch((e) => notifyError(e, '無法載入預約紀錄'))
  }
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-app-text mb-2">預約諮商</h1>

    <!-- Progress -->
    <div class="flex items-center gap-2 mb-8">
      <div
        v-for="s in 3"
        :key="s"
        class="flex items-center gap-2"
      >
        <div
          class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
          :class="step >= s ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'"
        >
          {{ s }}
        </div>
        <span class="text-sm" :class="step >= s ? 'text-app-text' : 'text-app-text/40'">
          {{ s === 1 ? '選心理師' : s === 2 ? '選時段' : '確認' }}
        </span>
        <span v-if="s < 3" class="text-app-text/20 mx-1">—</span>
      </div>
    </div>

    <!-- Step 1: 選心理師 -->
    <div v-if="step === 1">
      <p class="text-app-text/60 mb-4">請選擇您的心理師</p>
      <div class="bg-orange-50/50 border border-orange-100 rounded-app p-4 mb-6 text-sm text-app-text/70">
        建議維持與固定心理師的諮商關係，有助於治療的持續性與深入。
      </div>

      <div v-if="therapists.length === 0" class="text-center py-8 text-app-text/40">
        目前沒有可預約的心理師
      </div>
      <div v-else class="grid grid-cols-2 gap-3">
        <button
          v-for="t in therapists"
          :key="t.id"
          class="bg-white rounded-app border p-5 text-left flex flex-col justify-start hover:border-primary hover:shadow-xs transition-all"
          :class="t.id === recentId ? 'border-primary' : 'border-orange-100'"
          @click="selectTherapist(t.id)"
        >
          <p class="text-3xl mb-2">🧠</p>
          <p class="font-medium text-app-text">{{ t.name }}</p>
          <p v-if="t.id === recentId" class="text-xs text-primary mt-1">最近預約的心理師</p>
        </button>
      </div>
    </div>

    <!-- Step 2: 選日期+時段 -->
    <div v-if="step === 2">
      <div class="flex items-center gap-2 mb-4">
        <button class="text-sm text-primary hover:underline" @click="step = 1">← 重選心理師</button>
      </div>
      <p class="text-app-text/60 mb-4">
        選擇 <strong>{{ therapists.find((t) => t.id === selectedTherapistId)?.name }}</strong> 的可預約時段
      </p>

      <div v-if="slotsByDate.length === 0" class="text-center py-8 text-app-text/40">
        目前沒有可預約的時段
      </div>
      <div v-else class="space-y-4">
        <div v-for="[date, dateSlots] in slotsByDate" :key="date">
          <p class="font-medium text-app-text mb-2">{{ formatDayWithWeekday(date, 'long') }}</p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="slot in dateSlots"
              :key="slot.id"
              class="px-4 py-2 bg-white border border-orange-100 rounded-app text-sm hover:border-primary hover:shadow-xs transition-all"
              @click="selectSlot(slot)"
            >
              {{ slot.startTime }} - {{ slot.endTime }}
              <span class="text-app-text/40 text-xs ml-1">{{ slot.roomName }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 3: 確認 -->
    <div v-if="step === 3 && selectedSlot">
      <div class="flex items-center gap-2 mb-4">
        <button class="text-sm text-primary hover:underline" @click="step = 2">← 重選時段</button>
      </div>

      <div class="bg-white rounded-app border border-orange-100 p-6 mb-6">
        <h3 class="font-semibold text-app-text mb-4">預約確認</h3>
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p class="text-app-text/50">心理師</p>
            <p class="font-medium text-app-text">{{ selectedSlot.therapistName }}</p>
          </div>
          <div>
            <p class="text-app-text/50">日期</p>
            <p class="font-medium text-app-text">{{ formatDayWithWeekday(selectedSlot.date, 'long') }}</p>
          </div>
          <div>
            <p class="text-app-text/50">時段</p>
            <p class="font-medium text-app-text">{{ selectedSlot.startTime }} - {{ selectedSlot.endTime }}</p>
          </div>
          <div>
            <p class="text-app-text/50">診間</p>
            <p class="font-medium text-app-text">{{ selectedSlot.roomName }}</p>
          </div>
        </div>
      </div>

      <div class="bg-orange-50/50 border border-orange-100 rounded-app p-4 mb-6 text-sm text-app-text/70">
        提醒：請於預約時間前 10 分鐘抵達。如需取消或改期，請至少提前 24 小時操作。
      </div>

      <div class="flex gap-3">
        <AppButton :loading="submitting" @click="handleConfirm">確認預約</AppButton>
        <AppButton variant="secondary" @click="step = 2">返回修改</AppButton>
      </div>
    </div>
  </div>
</template>
