<script setup lang="ts">
import { ref } from 'vue'
import { useCftSectionCanvas } from '@/composables/useCftSectionCanvas'
import BaseCard from '@/components/shared/BaseCard.vue'

const canvasRef = ref<HTMLCanvasElement | null>(null)

useCftSectionCanvas(canvasRef)
</script>

<template>
  <BaseCard title="箱型斷面配置圖" iconClass="icon-diagram">
    <template #icon>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <rect x="7" y="7" width="10" height="10" rx="1" stroke-dasharray="3 2"/>
      </svg>
    </template>
    <div class="canvas-body">
      <canvas ref="canvasRef" width="500" height="400"></canvas>
    </div>
  </BaseCard>
</template>
