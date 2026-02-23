<script setup lang="ts">
import { ref, toRef } from 'vue'
import { useSrcStore } from '@/stores/src'
import BaseCard from '@/components/shared/BaseCard.vue'
import LoadImportModal from '@/components/shared/LoadImportModal.vue'
import LoadTableModal from '@/components/shared/LoadTableModal.vue'
import { useLoadManager } from '@/composables/useLoadManager'

const store = useSrcStore()

const { getNextNo, addLoad, removeLoad, clearLoads, importFromText } = useLoadManager(
  toRef(store, 'loads'),
  (no, values) => ({ no, Pu: values[0], Muy: values[1] }),
  2
)

const showImportModal = ref(false)
const showTableModal = ref(false)

function handleInputLoad() {
  const no = store.loadNo || getNextNo()
  addLoad({ no, Pu: store.loadPu, Muy: store.loadMuy })
  store.loadNo = no + 1
  store.loadPu = 0
  store.loadMuy = 0
}

function handleInit() {
  clearLoads()
  store.loadNo = 1
  store.loadPu = 0
  store.loadMuy = 0
}

function handleImport(text: string) {
  importFromText(text)
  store.loadNo = getNextNo()
}

function handleTableImport(rows: Array<{ no: number; Pu: number; Muy: number }>) {
  rows.forEach(r => addLoad(r))
  store.loadNo = getNextNo()
}

function onLoadClick(item: { no: number; Pu: number; Muy: number }) {
  store.loadNo = item.no
  store.loadPu = item.Pu
  store.loadMuy = item.Muy
}
</script>

<template>
  <BaseCard title="5. 設計載重 (C- ; T+)" iconClass="icon-load">
    <template #icon>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="2" x2="12" y2="22"/><polyline points="8 6 12 2 16 6"/><polyline points="8 18 12 22 16 18"/>
      </svg>
    </template>

    <div class="load-header-row">
      <div class="form-row compact">
        <label>箍筋類型</label>
        <select v-model="store.stirrupType" class="select-field">
          <option value="tie">橫箍筋</option>
          <option value="spiral">螺旋箍筋</option>
        </select>
      </div>
    </div>

    <div class="load-input-row">
      <div class="form-row compact">
        <label>編號</label>
        <input type="number" v-model.number="store.loadNo" class="input-field input-sm">
      </div>
      <div class="form-row compact">
        <label>Pu (tf)</label>
        <input type="number" v-model.number="store.loadPu" class="input-field input-sm">
      </div>
      <div class="form-row compact">
        <label>Muy (tf-m)</label>
        <input type="number" v-model.number="store.loadMuy" class="input-field input-sm">
      </div>
    </div>

    <div class="load-list-container">
      <div class="load-list">
        <div v-if="store.loads.length === 0" class="load-list-empty">尚未輸入載重</div>
        <template v-else>
          <div class="load-item load-item-header">
            <span class="load-col-no">No.</span>
            <span class="load-col-val">Pu (tf)</span>
            <span class="load-col-val">Muy (tf-m)</span>
            <span class="load-col-del"></span>
          </div>
          <div
            v-for="(item, idx) in store.loads"
            :key="item.no"
            class="load-item"
            :class="{ 'load-item-alt': idx % 2 === 1 }"
            style="cursor: pointer"
            @click="onLoadClick(item)"
          >
            <span class="load-col-no">{{ item.no }}</span>
            <span class="load-col-val">{{ item.Pu }}</span>
            <span class="load-col-val">{{ item.Muy }}</span>
            <button class="load-del-btn" @click.stop="removeLoad(idx)" title="刪除">&times;</button>
          </div>
        </template>
      </div>
    </div>

    <div class="card-actions">
      <button class="btn-action btn-create" @click="showTableModal = true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
        建立表單
      </button>
      <button class="btn-action btn-import" @click="showImportModal = true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        匯入表單
      </button>
      <button class="btn-action btn-input-load" @click="handleInputLoad">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        輸入載重
      </button>
      <button class="btn-action btn-init" @click="handleInit">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>
        初始化
      </button>
    </div>

    <LoadImportModal
      v-model="showImportModal"
      hint="每行一組載重，格式："
      placeholder="P, M"
      @import="handleImport"
    />
    <LoadTableModal
      v-model="showTableModal"
      :startNo="getNextNo()"
      @import="handleTableImport"
    />
  </BaseCard>
</template>
