<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
} from 'chart.js'
import type { MetricsTrend } from '@/types'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip)

interface Props {
  trend: MetricsTrend | null
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: '趨勢',
})

// chart.js 在 canvas 上無法解析 CSS var()，於掛載後解析出實際色值。
// 顏色來源仍是 CSS 變數 --color-primary（不寫死 hex）。
const rootEl = ref<HTMLElement | null>(null)
const primaryColor = ref('')

onMounted(() => {
  if (rootEl.value) {
    primaryColor.value = getComputedStyle(rootEl.value)
      .getPropertyValue('--color-primary')
      .trim()
  }
})

const points = computed(() => props.trend?.points ?? [])

const chartData = computed(() => ({
  labels: points.value.map((p) => p.period),
  datasets: [
    {
      label: props.label,
      data: points.value.map((p) => p.value),
      borderColor: primaryColor.value,
      backgroundColor: primaryColor.value,
      tension: 0.3,
      pointRadius: 3,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { y: { beginAtZero: true } },
}
</script>

<template>
  <div ref="rootEl" class="bg-white border border-gray-200 rounded-app p-4">
    <h4 class="text-sm font-medium text-gray-700 mb-3">{{ label }}</h4>
    <div v-if="points.length === 0" class="text-sm text-gray-400 py-8 text-center">
      目前沒有趨勢資料
    </div>
    <div v-else class="h-64">
      <Line :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>
