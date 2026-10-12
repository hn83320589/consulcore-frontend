<script setup lang="ts">
import { computed } from 'vue'
import { Bar, Doughnut } from 'vue-chartjs'
import { formatCurrency } from '@/utils/format'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import type { MonthlyRevenue, TherapistRevenue } from '@/types'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

interface Props {
  monthly: MonthlyRevenue
  byTherapist: TherapistRevenue[]
}

const props = defineProps<Props>()

// ── 色彩：一律取自 CSS 變數，衍生色以 alpha 疊加，不寫死 hex ──
function cssVar(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value || fallback
}

// 以 primary 為基底，套用不同透明度衍生分類色（皆源自 var(--color-primary)）
function withAlpha(base: string, alphaHex: string): string {
  return /^#[0-9a-fA-F]{6}$/.test(base) ? `${base}${alphaHex}` : base
}

const primary = computed(() => cssVar('--color-primary', '#2C5F8A'))

const statusColors = computed(() => [
  primary.value,
  withAlpha(primary.value, 'AA'),
  withAlpha(primary.value, '77'),
  withAlpha(primary.value, '44'),
])

const therapistColors = computed(() =>
  props.byTherapist.map((_, i) => {
    const steps = ['', 'CC', 'AA', '88', '66', '44', 'EE', 'BB', '99', '55']
    const alpha = steps[i % steps.length]
    return alpha ? withAlpha(primary.value, alpha) : primary.value
  }),
)

// ── 當月收費結構 Bar Chart ──────────────────
const barData = computed(() => ({
  labels: ['已收', '待收', '退費', '免收'],
  datasets: [
    {
      label: `${props.monthly.year} 年 ${props.monthly.month} 月`,
      data: [
        props.monthly.paidAmount,
        props.monthly.pendingAmount,
        props.monthly.refundedAmount,
        props.monthly.waivedAmount,
      ],
      backgroundColor: statusColors.value,
    },
  ],
}))

const barOptions = {
  responsive: true,
  plugins: {
    title: { display: true, text: '當月收費結構' },
    legend: { display: false },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value: string | number) => `$${Number(value).toLocaleString()}`,
      },
    },
  },
}

// ── 心理師營收佔比 Doughnut ─────────────────
const doughnutData = computed(() => ({
  labels: props.byTherapist.map((t) => t.therapistName),
  datasets: [
    {
      data: props.byTherapist.map((t) => t.totalRevenue),
      backgroundColor: therapistColors.value,
    },
  ],
}))

const doughnutOptions = {
  responsive: true,
  plugins: {
    title: { display: true, text: '心理師營收佔比' },
    legend: { position: 'bottom' as const },
  },
}

</script>

<template>
  <div>
    <!-- Summary Cards -->
    <div class="grid grid-cols-3 gap-4 mb-6">
      <div class="bg-green-50 border border-green-100 rounded-app p-4">
        <p class="text-sm text-green-600">已收</p>
        <p class="text-xl font-bold text-green-700">{{ formatCurrency(monthly.paidAmount) }}</p>
      </div>
      <div class="bg-yellow-50 border border-yellow-100 rounded-app p-4">
        <p class="text-sm text-yellow-600">待收</p>
        <p class="text-xl font-bold text-yellow-700">{{ formatCurrency(monthly.pendingAmount) }}</p>
      </div>
      <div class="bg-blue-50 border border-blue-100 rounded-app p-4">
        <p class="text-sm text-blue-600">總營收</p>
        <p class="text-xl font-bold text-blue-700">{{ formatCurrency(monthly.totalRevenue) }}</p>
      </div>
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-3 gap-6">
      <div class="col-span-2 bg-white border border-gray-200 rounded-app p-4">
        <Bar :data="barData" :options="barOptions" />
      </div>
      <div class="bg-white border border-gray-200 rounded-app p-4">
        <Doughnut :data="doughnutData" :options="doughnutOptions" />
      </div>
    </div>

    <!-- Therapist Table -->
    <div class="mt-6 bg-white border border-gray-200 rounded-app overflow-x-auto">
      <table class="w-full min-w-[36rem] text-sm">
        <thead>
          <tr class="bg-gray-50 border-b border-gray-200">
            <th class="px-4 py-2 text-left text-gray-600">心理師</th>
            <th class="px-4 py-2 text-right text-gray-600">營收</th>
            <th class="px-4 py-2 text-right text-gray-600">晤談數</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="t in byTherapist" :key="t.therapistUserId" class="border-b border-gray-100">
            <td class="px-4 py-2">{{ t.therapistName }}</td>
            <td class="px-4 py-2 text-right font-medium">{{ formatCurrency(t.totalRevenue) }}</td>
            <td class="px-4 py-2 text-right text-gray-500">{{ t.totalSessions }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
