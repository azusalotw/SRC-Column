<script setup lang="ts">
import CftMaterialCard from './CftMaterialCard.vue'
import CftSectionCard from './CftSectionCard.vue'
import CftColumnCard from './CftColumnCard.vue'
import CftLoadCard from './CftLoadCard.vue'
import CftSectionDiagram from './CftSectionDiagram.vue'
import CftPMChart from './CftPMChart.vue'
import CftResultPanel from './CftResultPanel.vue'
</script>

<template>
  <div class="app-layout">
    <div class="input-panel">
      <CftMaterialCard />
      <CftSectionCard />
      <CftColumnCard />
      <CftLoadCard />
    </div>
    <div class="visual-panel">
      <CftSectionDiagram />
      <CftPMChart />
    </div>
    <div class="result-panel">
      <CftResultPanel />
    </div>
  </div>
</template>
