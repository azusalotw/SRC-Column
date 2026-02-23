import { defineStore } from 'pinia'
import { ref } from 'vue'

export type TabId = 'src' | 'cft'

export const useAppStore = defineStore('app', () => {
  const activeTab = ref<TabId>('src')

  function setTab(tab: TabId) {
    activeTab.value = tab
  }

  return { activeTab, setTab }
})
