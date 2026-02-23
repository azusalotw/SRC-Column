<script setup lang="ts">
import { useCftStore } from '@/stores/cft'
import BaseCard from '@/components/shared/BaseCard.vue'

const store = useCftStore()
</script>

<template>
  <BaseCard title="2. 箱型鋼管斷面" iconClass="icon-steel">
    <template #icon>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="1"/>
        <rect x="6" y="6" width="12" height="12" rx="0.5" stroke-dasharray="3 2"/>
      </svg>
    </template>
    <div class="form-grid-2col">
      <div class="form-row">
        <label>B =</label>
        <input type="number" v-model.number="store.B" class="input-field">
        <span class="unit">cm</span>
      </div>
      <div class="form-row">
        <label>H =</label>
        <input type="number" v-model.number="store.H" class="input-field">
        <span class="unit">cm</span>
      </div>
    </div>
    <div class="form-row">
      <label>tw =</label>
      <input type="number" v-model.number="store.tw" class="input-field">
      <span class="unit">cm</span>
    </div>
  </BaseCard>
</template>
