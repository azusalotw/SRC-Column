<script setup lang="ts">
import { useSrcStore } from '@/stores/src'
import BaseCard from '@/components/shared/BaseCard.vue'
import { REBAR_SIZES, STIRRUP_SIZES } from '@/constants/materials'

const store = useSrcStore()
</script>

<template>
  <BaseCard title="4. 鋼筋配置" iconClass="icon-rebar">
    <template #icon>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="6" cy="6" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/><circle cx="12" cy="12" r="2"/>
      </svg>
    </template>
    <div class="radio-group">
      <label class="radio-label">
        <input type="radio" value="uniform" v-model="store.rebarMode">
        <span class="radio-custom"></span>
        均佈配置
      </label>
      <label class="radio-label">
        <input type="radio" value="custom" v-model="store.rebarMode">
        <span class="radio-custom"></span>
        指定座標
      </label>
      <div class="max-rebar-row">
        <label>最大鋼筋量</label>
        <input type="number" v-model.number="store.maxRebar" class="input-field input-sm">
        <span class="unit">%</span>
      </div>
    </div>

    <!-- Uniform panel -->
    <div class="rebar-uniform-panel" v-show="store.rebarMode === 'uniform'">
      <div class="form-grid-2col">
        <div class="form-row">
          <label>保護層 =</label>
          <input type="number" v-model.number="store.cover" class="input-field">
          <span class="unit">cm</span>
        </div>
        <div class="form-row">
          <label>箍筋號數 =</label>
          <select v-model="store.stirrupSize" class="select-field">
            <option v-for="s in STIRRUP_SIZES" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>
        <div class="form-row">
          <label>主筋號數 =</label>
          <select v-model="store.rebarSize" class="select-field">
            <option v-for="s in REBAR_SIZES" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>
        <div class="form-row">
          <label>每邊支數 Y =</label>
          <input type="number" v-model.number="store.rebarCountY" class="input-field">
          <span class="unit">支</span>
        </div>
        <div class="form-row">
          <label>每邊支數 Z =</label>
          <input type="number" v-model.number="store.rebarCountZ" class="input-field">
          <span class="unit">支</span>
        </div>
      </div>
    </div>

    <!-- Custom panel (placeholder) -->
    <div class="rebar-custom-panel" v-show="store.rebarMode === 'custom'">
      <div class="rebar-list-container">
        <div class="rebar-list">
          <div class="rebar-list-empty">尚未配置鋼筋</div>
        </div>
      </div>
    </div>

    <div class="card-actions">
      <button class="btn-action btn-modify">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        修改鋼筋
      </button>
      <button class="btn-action btn-delete">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
        刪除鋼筋
      </button>
      <button class="btn-action btn-export">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        匯出鋼筋
      </button>
      <button class="btn-action btn-init">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>
        初始化
      </button>
    </div>
  </BaseCard>
</template>
