<script setup lang="ts">
import { ref } from 'vue'
import { useCftStore } from '@/stores/cft'
import { useCftPMCanvas } from '@/composables/useCftPMCanvas'
import { cftCalculateAll } from '@/calculations/cft/calculate-all'
import BaseCard from '@/components/shared/BaseCard.vue'

const store = useCftStore()
const canvasRef = ref<HTMLCanvasElement | null>(null)

useCftPMCanvas(canvasRef)

function handleCalc() {
  const results = cftCalculateAll(store.getInputs())
  store.results = results
}
</script>

<template>
  <BaseCard title="P-M Interaction Check" iconClass="icon-chart">
    <template #icon>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
      </svg>
    </template>
    <div class="canvas-body">
      <canvas ref="canvasRef" width="500" height="400"></canvas>
      <div class="pm-actions">
        <button class="btn-primary-action" @click="handleCalc">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          計算強度檢核
        </button>
      </div>
    </div>
  </BaseCard>
</template>
