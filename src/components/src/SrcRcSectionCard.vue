<script setup lang="ts">
import { useSrcStore } from '@/stores/src'
import BaseCard from '@/components/shared/BaseCard.vue'

const store = useSrcStore()
</script>

<template>
  <BaseCard title="2. RC斷面尺寸">
    <template #icon>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <line x1="3" y1="12" x2="21" y2="12"/>
        <line x1="12" y1="3" x2="12" y2="21"/>
      </svg>
    </template>
    <div class="form-row">
      <label>B =</label>
      <input type="number" v-model.number="store.sectionB" class="input-field">
      <span class="unit">cm</span>
    </div>
    <div class="form-row">
      <label>H =</label>
      <input type="number" v-model.number="store.sectionH" class="input-field">
      <span class="unit">cm</span>
    </div>
  </BaseCard>
</template>
