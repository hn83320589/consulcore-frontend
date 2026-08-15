<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useAppointmentStore } from '@/stores/appointmentStore'
import { useUiStore } from '@/stores/uiStore'
import AppButton from '@/components/ui/AppButton.vue'
import type { ScheduleSlot } from '@/types'

const router = useRouter()
const authStore = useAuthStore()
const appointmentStore = useAppointmentStore()
const uiStore = useUiStore()

// ── Steps ───────────────────────────────────
const step = ref(1)

// ── Step 1: 選心理師 ────────────────────────
const therapists = computed(() => {
  const map = new Map<number, string>()
  for (const slot of appointmentStore.availableSlots) {
    if (!map.has(slot.therapistUserId)) {
      map.set(slot.therapistUserId, slot.therapistName)
    }
  }
  return Array.from(map, ([id, name]) => ({ id, name }))
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

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('zh-TW', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
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
  } catch {
    uiStore.showToast('預約失敗，請稍後再試', 'error')
  } finally {
    submitting.value = false
  }
}

// ── Init ────────────────────────────────────
onMounted(() => {
  const now = new Date()
  const startDate = now.toISOString().slice(0, 10)
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10)
  appointmentStore.fetchAvailableSlots({ startDate, endDate })
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
          class="bg-white rounded-app border border-orange-100 p-5 text-left hover:border-primary hover:shadow-sm transition-all"
          @click="selectTherapist(t.id)"
        >
          <p class="text-3xl mb-2">🧠</p>
          <p class="font-medium text-app-text">{{ t.name }}</p>
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
          <p class="font-medium text-app-text mb-2">{{ formatDate(date) }}</p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="slot in dateSlots"
              :key="slot.id"
              class="px-4 py-2 bg-white border border-orange-100 rounded-app text-sm hover:border-primary hover:shadow-sm transition-all"
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
            <p class="font-medium text-app-text">{{ formatDate(selectedSlot.date) }}</p>
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
