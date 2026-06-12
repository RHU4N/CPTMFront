<template>
  <RouterView />
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { setUnauthorizedHandler } from '@/api/api'

const router = useRouter()

function handleUnauthorized() {
  router.replace({ name: 'login' })
}

onMounted(() => {
  setUnauthorizedHandler(handleUnauthorized)
})

onUnmounted(() => {
  setUnauthorizedHandler(null)
})
</script>
