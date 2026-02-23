import { ref } from 'vue'

export function useModal() {
  const isOpen = ref(false)

  function open() {
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
  }

  function onOverlayClick(e: MouseEvent) {
    if (e.target === e.currentTarget) close()
  }

  return { isOpen, open, close, onOverlayClick }
}
