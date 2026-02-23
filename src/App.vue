<script setup lang="ts">
import { useAppStore } from '@/stores/app'
import { useFormulaTooltip } from '@/composables/useFormulaTooltip'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import SrcTab from '@/components/src/SrcTab.vue'
import CftTab from '@/components/cft/CftTab.vue'

const appStore = useAppStore()

// Initialize global formula tooltip (body-mounted)
useFormulaTooltip()
</script>

<template>
  <AppHeader />
  <main>
    <div class="container">
      <div v-show="appStore.activeTab === 'src'">
        <SrcTab />
      </div>
      <div v-show="appStore.activeTab === 'cft'">
        <CftTab />
      </div>
    </div>
  </main>
  <AppFooter />
</template>
