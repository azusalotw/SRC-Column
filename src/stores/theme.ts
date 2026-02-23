import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type ThemeMode = 'light' | 'dark'

export const useThemeStore = defineStore('theme', () => {
  const theme = ref<ThemeMode>(
    (localStorage.getItem('theme') as ThemeMode) ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  )

  function setTheme(t: ThemeMode) {
    theme.value = t
    document.documentElement.setAttribute('data-theme', t)
    localStorage.setItem('theme', t)
  }

  function toggle() {
    setTheme(theme.value === 'light' ? 'dark' : 'light')
  }

  // Initialize
  setTheme(theme.value)

  // Listen to OS preference changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      setTheme(e.matches ? 'dark' : 'light')
    }
  })

  return { theme, setTheme, toggle }
})
