<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useConsentStore } from '@/stores/consentStore'
import { useAuthStore } from '@/stores/authStore'
import AppBadge from '@/components/ui/AppBadge.vue'
import AppModal from '@/components/ui/AppModal.vue'
import { formatDate } from '@/utils/format'
import type { ConsentRecord, ConsentRecordStatus } from '@/types'

const consentStore = useConsentStore()
const authStore = useAuthStore()

const viewingRecord = ref<ConsentRecord | null>(null)

const statusLabels: Record<ConsentRecordStatus, string> = {
  pending: '待簽署',
  signed: '有效',
  voided: '已作廢',
}

const statusVariants: Record<ConsentRecordStatus, 'success' | 'danger' | 'default'> = {
  pending: 'default',
  signed: 'success',
  voided: 'danger',
}

onMounted(() => {
  if (authStore.clientProfileId != null) {
    consentStore.fetchRecordsByClient(authStore.clientProfileId)
  }
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-app-text mb-2">我的同意書</h1>
    <p class="text-app-text/60 mb-6">查看您已簽署的同意書</p>

    <div v-if="consentStore.loading" class="text-center py-8 text-app-text/40">
      載入中...
    </div>

    <div v-else-if="consentStore.records.length === 0" class="text-center py-12">
      <p class="text-app-text/40">目前沒有已簽署的同意書</p>
    </div>

    <div v-else class="space-y-3">
      <button
        v-for="rec in consentStore.records"
        :key="rec.id"
        class="w-full bg-white border border-orange-100 rounded-app p-5 text-left hover:shadow-xs transition-shadow"
        @click="viewingRecord = rec"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium text-app-text">{{ rec.templateTitle }}</p>
            <p class="text-sm text-app-text/50 mt-1">
              版本 {{ rec.templateVersion }} · 簽署於 {{ formatDate(rec.signedAt) }}
            </p>
          </div>
          <AppBadge :variant="statusVariants[rec.status]">
            {{ statusLabels[rec.status] }}
          </AppBadge>
        </div>
      </button>
    </div>

    <!-- View Modal -->
    <AppModal
      :open="!!viewingRecord"
      :title="viewingRecord?.templateTitle ?? ''"
      width="max-w-2xl"
      @close="viewingRecord = null"
    >
      <div v-if="viewingRecord">
        <div class="flex items-center gap-2 mb-4 text-sm text-app-text/60">
          <AppBadge :variant="statusVariants[viewingRecord.status]">
            {{ statusLabels[viewingRecord.status] }}
          </AppBadge>
          <span>v{{ viewingRecord.templateVersion }}</span>
          <span>· {{ formatDate(viewingRecord.signedAt) }}</span>
        </div>
        <div class="prose prose-sm max-w-none border-t pt-4 mb-4 whitespace-pre-wrap">{{ viewingRecord.contentSnapshot }}</div>
        <div v-if="viewingRecord.signatureImage" class="border-t pt-4">
          <p class="text-xs text-app-text/50 mb-2">您的簽名</p>
          <img :src="viewingRecord.signatureImage" alt="簽名" class="h-20" />
        </div>
      </div>
    </AppModal>
  </div>
</template>
