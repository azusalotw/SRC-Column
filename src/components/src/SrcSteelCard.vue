<script setup lang="ts">
import { useSrcStore } from '@/stores/src'
import BaseCard from '@/components/shared/BaseCard.vue'

const store = useSrcStore()
</script>

<template>
  <BaseCard title="3. 鋼骨斷面" iconClass="icon-steel">
    <template #icon>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M2 4h20v2H2z"/><path d="M2 18h20v2H2z"/><path d="M11 6h2v12h-2z"/>
      </svg>
    </template>
    <div class="form-row">
      <label for="steelShape">斷面形狀</label>
      <select v-model="store.steelShape" class="select-field select-wide">
        <option value="H">H 型</option>
        <option value="DoubleH">Double H 型</option>
        <option value="Box">Box 型</option>
      </select>
    </div>
    <div class="form-grid-2col">
      <div class="form-row">
        <label>H =</label>
        <input type="number" v-model.number="store.steelH" class="input-field">
        <span class="unit">mm</span>
      </div>
      <div class="form-row">
        <label>B =</label>
        <input type="number" v-model.number="store.steelB" class="input-field">
        <span class="unit">mm</span>
      </div>
      <div class="form-row">
        <label>tw =</label>
        <input type="number" v-model.number="store.steelTw" class="input-field">
        <span class="unit">mm</span>
      </div>
      <div class="form-row">
        <label>tf =</label>
        <input type="number" v-model.number="store.steelTf" class="input-field">
        <span class="unit">mm</span>
      </div>
    </div>
  </BaseCard>
</template>
