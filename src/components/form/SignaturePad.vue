<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import SignaturePadLib from 'signature_pad'

interface Props {
  width?: number
  height?: number
}

withDefaults(defineProps<Props>(), {
  width: 400,
  height: 200,
})

const emit = defineEmits<{
  sign: [dataUrl: string]
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let padInstance: SignaturePadLib | null = null

onMounted(() => {
  if (canvasRef.value) {
    // 處理高 DPI 螢幕
    const ratio = Math.max(window.devicePixelRatio || 1, 1)
    const canvas = canvasRef.value
    canvas.width = canvas.offsetWidth * ratio
    canvas.height = canvas.offsetHeight * ratio
    const ctx = canvas.getContext('2d')
    if (ctx) ctx.scale(ratio, ratio)

    padInstance = new SignaturePadLib(canvas, {
      backgroundColor: 'rgb(255, 255, 255)',
    })
  }
})

onUnmounted(() => {
  padInstance?.off()
  padInstance = null
})

function clear() {
  padInstance?.clear()
}

function confirm() {
  if (!padInstance || padInstance.isEmpty()) return
  const dataUrl = padInstance.toDataURL('image/png')
  emit('sign', dataUrl)
}

function isEmpty(): boolean {
  return padInstance?.isEmpty() ?? true
}

defineExpose({ clear, isEmpty })
</script>

<template>
  <div class="space-y-3">
    <div class="border border-gray-300 rounded-app overflow-hidden bg-white">
      <canvas
        ref="canvasRef"
        :style="{ width: `${width}px`, height: `${height}px` }"
        class="block cursor-crosshair"
      />
    </div>
    <div class="flex gap-2">
      <button
        type="button"
        class="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-app hover:bg-gray-50"
        @click="clear"
      >
        清除
      </button>
      <button
        type="button"
        class="px-3 py-1.5 text-sm text-white bg-primary rounded-app hover:bg-primary-hover"
        @click="confirm"
      >
        確認簽名
      </button>
    </div>
  </div>
</template>
