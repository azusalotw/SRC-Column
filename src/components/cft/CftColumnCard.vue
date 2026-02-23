<script setup lang="ts">
import { useCftStore } from '@/stores/cft'
import BaseCard from '@/components/shared/BaseCard.vue'

const store = useCftStore()
</script>

<template>
  <BaseCard title="3. 柱參數" iconClass="icon-diagram">
    <template #icon>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="2" x2="12" y2="22"/><polyline points="8 6 12 2 16 6"/><polyline points="8 18 12 22 16 18"/><line x1="4" y1="12" x2="20" y2="12"/>
      </svg>
    </template>
    <div class="form-row">
      <label>柱長 L =</label>
      <input type="number" v-model.number="store.L" step="0.01" class="input-field">
      <span class="unit">m</span>
    </div>
    <div class="form-row">
      <label>K =</label>
      <input type="number" v-model.number="store.K" step="0.1" class="input-field">
    </div>
  </BaseCard>
</template>
