<script setup lang="ts">
defineProps<{
  title: string
  iconClass?: string
}>()
</script>

<template>
  <div class="card">
    <div class="card-header">
      <div class="card-icon" :class="iconClass">
        <slot name="icon" />
      </div>
      <h3>{{ title }}</h3>
    </div>
    <div class="card-body">
      <slot />
    </div>
  </div>
</template>
