<template>
  <div class="toast-stack">
    <div v-for="toast in toasts" :key="toast.id" class="toast" :class="toast.type">
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useUiStore } from '@/stores/ui'

const uiStore = useUiStore()
const { toasts } = storeToRefs(uiStore)
</script>