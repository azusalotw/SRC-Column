<script setup lang="ts">
import { useAppStore } from '@/stores/app'
import ThemeToggle from './ThemeToggle.vue'

const appStore = useAppStore()
</script>

<template>
  <header>
    <div class="container">
      <nav>
        <div class="logo">
          <a href="#">複合柱強度檢核</a>
        </div>
        <div class="tab-nav">
          <button
            class="tab-btn"
            :class="{ active: appStore.activeTab === 'src' }"
            @click="appStore.setTab('src')"
          >SRC 柱</button>
          <button
            class="tab-btn"
            :class="{ active: appStore.activeTab === 'cft' }"
            @click="appStore.setTab('cft')"
          >CFT 柱</button>
        </div>
        <div class="nav-links">
          <span class="author-info">Author: Tzu-Ting Lo</span>
          <ThemeToggle />
        </div>
      </nav>
    </div>
  </header>
</template>
