<script setup lang="ts">
import { ref } from 'vue'
import ModalOverlay from './ModalOverlay.vue'

const props = defineProps<{
  modelValue: boolean
  columnCount?: number
  placeholder?: string
  hint?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'import': [text: string]
}>()

const textarea = ref('')

function onConfirm() {
  emit('import', textarea.value)
  textarea.value = ''
  emit('update:modelValue', false)
}

function onCancel() {
  textarea.value = ''
  emit('update:modelValue', false)
}
</script>

<template>
  <ModalOverlay
    :modelValue="modelValue"
    @update:modelValue="emit('update:modelValue', $event)"
    title="匯入載重 (文字格式)"
    small
  >
    <p class="modal-hint">{{ hint || '每行一組載重，格式：' }}<code>{{ placeholder || 'P, M' }}</code></p>
    <textarea
      v-model="textarea"
      class="modal-textarea"
      rows="10"
      :placeholder="'100,10\n200,5\n300,6'"
    ></textarea>
    <template #footer>
      <button class="btn-action btn-modal-cancel" @click="onCancel">取消</button>
      <button class="btn-primary-action btn-modal-confirm" @click="onConfirm">確定匯入</button>
    </template>
  </ModalOverlay>
</template>
