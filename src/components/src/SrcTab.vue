<script setup lang="ts">
import SrcMaterialCard from './SrcMaterialCard.vue'
import SrcRcSectionCard from './SrcRcSectionCard.vue'
import SrcSteelCard from './SrcSteelCard.vue'
import SrcRebarCard from './SrcRebarCard.vue'
import SrcLoadCard from './SrcLoadCard.vue'
import SrcSectionDiagram from './SrcSectionDiagram.vue'
import SrcPMCurve from './SrcPMCurve.vue'
import SrcResultPanel from './SrcResultPanel.vue'
</script>

<template>
  <div class="app-layout">
    <div class="input-panel">
      <SrcMaterialCard />
      <SrcRcSectionCard />
      <SrcSteelCard />
      <SrcRebarCard />
      <SrcLoadCard />
    </div>
    <div class="visual-panel">
      <SrcSectionDiagram />
      <SrcPMCurve />
    </div>
    <div class="result-panel">
      <SrcResultPanel />
    </div>
  </div>
</template>
