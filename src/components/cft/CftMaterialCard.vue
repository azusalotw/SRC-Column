<script setup lang="ts">
import { useCftStore } from '@/stores/cft'
import BaseCard from '@/components/shared/BaseCard.vue'

const store = useCftStore()
</script>

<template>
  <BaseCard title="1. 材料性質">
    <template #icon>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
      </svg>
    </template>
    <div class="form-row">
      <label>f'c =</label>
      <input type="number" v-model.number="store.fc" class="input-field">
      <span class="unit">kgf/cm<sup>2</sup></span>
    </div>
    <div class="form-row">
      <label>Fys =</label>
      <input type="number" v-model.number="store.Fys" class="input-field">
      <span class="unit">kgf/cm<sup>2</sup></span>
    </div>
    <div class="form-row">
      <label>Fyr =</label>
      <input type="number" v-model.number="store.Fyr" class="input-field">
      <span class="unit">kgf/cm<sup>2</sup></span>
    </div>
    <div class="form-row">
      <label>Es =</label>
      <input type="number" v-model.number="store.Es" class="input-field">
      <span class="unit">kgf/cm<sup>2</sup></span>
    </div>
    <div class="form-row">
      <label>Ec =</label>
      <input type="text" :value="store.Ec.toLocaleString('en-US')" class="input-field input-readonly" readonly>
      <span class="unit">kgf/cm<sup>2</sup></span>
    </div>
    <div class="form-grid-2col">
      <div class="form-row">
        <label>φc =</label>
        <input type="number" v-model.number="store.phiC" step="0.01" class="input-field">
      </div>
      <div class="form-row">
        <label>φb =</label>
        <input type="number" v-model.number="store.phiB" step="0.01" class="input-field">
      </div>
    </div>
    <div class="form-grid-2col">
      <div class="form-row">
        <label>c1 =</label>
        <input type="number" v-model.number="store.c1" step="0.01" class="input-field">
      </div>
      <div class="form-row">
        <label>c2 =</label>
        <input type="number" v-model.number="store.c2" step="0.01" class="input-field">
      </div>
    </div>
    <div class="form-row">
      <label>c3 =</label>
      <input type="number" v-model.number="store.c3" step="0.01" class="input-field">
    </div>
  </BaseCard>
</template>
