<script setup lang="ts">
import { ref, watch } from 'vue'
import ModalOverlay from './ModalOverlay.vue'

const props = defineProps<{
  modelValue: boolean
  startNo: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'import': [rows: Array<{ no: number; Pu: number; Muy: number }>]
}>()

interface ModalRow {
  no: number
  Pu: number
  Muy: number
}

const rows = ref<ModalRow[]>([])

watch(() => props.modelValue, (open) => {
  if (open) {
    rows.value = []
    for (let i = 0; i < 5; i++) {
      rows.value.push({ no: props.startNo + i, Pu: 0, Muy: 0 })
    }
  }
})

function addRow() {
  const lastNo = rows.value.length > 0 ? rows.value[rows.value.length - 1].no : props.startNo - 1
  rows.value.push({ no: lastNo + 1, Pu: 0, Muy: 0 })
}

function removeRow(index: number) {
  rows.value.splice(index, 1)
}

function onConfirm() {
  const valid = rows.value.filter(r => r.no > 0)
  emit('import', valid)
  emit('update:modelValue', false)
}
</script>

<template>
  <ModalOverlay
    :modelValue="modelValue"
    @update:modelValue="emit('update:modelValue', $event)"
    title="批次輸入載重"
  >
    <table class="modal-table">
      <thead>
        <tr>
          <th>編號</th>
          <th>Pu (tf)</th>
          <th>Muy (tf-m)</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, idx) in rows" :key="idx">
          <td><input type="number" v-model.number="row.no" class="modal-input modal-no"></td>
          <td><input type="number" v-model.number="row.Pu" class="modal-input"></td>
          <td><input type="number" v-model.number="row.Muy" class="modal-input"></td>
          <td><button class="modal-row-del" @click="removeRow(idx)" title="刪除列">&times;</button></td>
        </tr>
      </tbody>
    </table>
    <button class="btn-action btn-modal-add" @click="addRow">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      新增列
    </button>
    <template #footer>
      <button class="btn-action btn-modal-cancel" @click="emit('update:modelValue', false)">取消</button>
      <button class="btn-primary-action btn-modal-confirm" @click="onConfirm">確定匯入</button>
    </template>
  </ModalOverlay>
</template>
