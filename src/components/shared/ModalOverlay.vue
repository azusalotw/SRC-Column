<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  title: string
  small?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

function close() {
  emit('update:modelValue', false)
}

function onOverlayClick(e: MouseEvent) {
  if (e.target === e.currentTarget) close()
}
</script>

<template>
  <Teleport to="body">
    <div
      class="modal-overlay"
      :class="{ active: modelValue }"
      @click="onOverlayClick"
    >
      <div class="modal-content" :class="{ 'modal-sm': small }">
        <div class="modal-header">
          <h3>{{ title }}</h3>
          <button class="modal-close" @click="close" title="關閉">&times;</button>
        </div>
        <div class="modal-body">
          <slot />
        </div>
        <div class="modal-footer">
          <slot name="footer">
            <button class="btn-action btn-modal-cancel" @click="close">取消</button>
          </slot>
        </div>
      </div>
    </div>
  </Teleport>
</template>
