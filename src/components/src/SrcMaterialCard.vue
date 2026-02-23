<script setup lang="ts">
import { useSrcStore } from '@/stores/src'
import BaseCard from '@/components/shared/BaseCard.vue'

const store = useSrcStore()
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
      <label>fy =</label>
      <input type="number" v-model.number="store.fy" class="input-field">
      <span class="unit">kgf/cm<sup>2</sup></span>
    </div>
    <div class="form-row">
      <label>Fy (鋼骨) =</label>
      <input type="number" v-model.number="store.Fys" class="input-field">
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
    <div class="form-row">
      <label for="codeVersion">規範版本</label>
      <select v-model="store.codeVersion" class="select-field select-wide">
        <option value="2011">現行規範 (2011)</option>
        <option value="2024">修正草案 (2024)</option>
      </select>
    </div>
    <div class="form-row" v-show="store.codeVersion === '2024'">
      <label for="steelGrade">鋼材種類</label>
      <select v-model="store.steelGrade" class="select-field select-wide">
        <option value="A572">A572 Gr.50 (Ry=1.1)</option>
        <option value="SN490B">SN490B (Ry=1.2)</option>
        <option value="A36">A36 / SN400 (Ry=1.3)</option>
        <option value="SM570">SM570 (Ry=1.1)</option>
      </select>
    </div>
  </BaseCard>
</template>
