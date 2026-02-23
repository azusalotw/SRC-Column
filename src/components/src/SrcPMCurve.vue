<script setup lang="ts">
import { ref } from 'vue'
import { useSrcPMCanvas } from '@/composables/useSrcPMCanvas'
import BaseCard from '@/components/shared/BaseCard.vue'

const canvasRef = ref<HTMLCanvasElement | null>(null)

useSrcPMCanvas(canvasRef)
</script>

<template>
  <BaseCard title="P-M Interaction Curve" iconClass="icon-chart">
    <template #icon>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
      </svg>
    </template>
    <div class="canvas-body">
      <canvas ref="canvasRef" width="500" height="400"></canvas>
      <div class="pm-actions">
        <button class="btn-primary-action">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          計算 PM-Curve
        </button>
        <button class="btn-action btn-export">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          匯出結果
        </button>
      </div>
    </div>
  </BaseCard>
</template>
