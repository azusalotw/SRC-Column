<script setup lang="ts">
import { ref } from 'vue'
import { useSrcStore } from '@/stores/src'
import { useSrcSectionCanvas } from '@/composables/useSrcSectionCanvas'
import { calculateSectionProperties } from '@/calculations/src/section-properties'
import BaseCard from '@/components/shared/BaseCard.vue'

const store = useSrcStore()
const canvasRef = ref<HTMLCanvasElement | null>(null)

useSrcSectionCanvas(canvasRef)

function handleCalcProps() {
  const sH = store.steelH / 10
  const sB = store.steelB / 10
  const sTw = store.steelTw / 10
  const sTf = store.steelTf / 10

  const props = calculateSectionProperties({
    B: store.sectionB, H: store.sectionH,
    shape: store.steelShape,
    steelH: sH, steelB: sB, steelTw: sTw, steelTf: sTf,
    rebarSize: store.rebarSize,
    countY: store.rebarCountY, countZ: store.rebarCountZ,
    cover: store.cover, stirrupSize: store.stirrupSize,
    codeVersion: store.codeVersion,
    Fys: store.Fys, Es: store.Es, fc: store.fc,
    steelGrade: store.steelGrade,
  })
  store.sectionProps = props
}
</script>

<template>
  <BaseCard title="斷面配置圖" iconClass="icon-diagram">
    <template #icon>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <circle cx="8" cy="8" r="1.5" fill="currentColor"/>
        <circle cx="16" cy="8" r="1.5" fill="currentColor"/>
        <circle cx="8" cy="16" r="1.5" fill="currentColor"/>
        <circle cx="16" cy="16" r="1.5" fill="currentColor"/>
      </svg>
    </template>
    <div class="canvas-body">
      <canvas ref="canvasRef" width="500" height="450"></canvas>
      <div class="section-diagram-actions">
        <button class="btn-action btn-draw">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="12" r="3"/></svg>
          繪製斷面
        </button>
        <button class="btn-primary-action btn-calc-props" @click="handleCalcProps">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="12" y2="14"/></svg>
          計算斷面性質
        </button>
      </div>
    </div>
  </BaseCard>
</template>
