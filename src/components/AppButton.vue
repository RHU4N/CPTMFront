<template>
  <button class="app-button" type="button" @click="$emit('click')">
    <img v-if="icon" class="app-button__icon" :src="icon" :alt="label || 'Ação'" />
    <span class="app-button__text"><slot /></span>
  </button>
</template>

<script setup>
defineProps({
  icon: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
})

defineEmits(['click'])
</script>

<style scoped>
.app-button {
  width: 120px;
  height: 140px;
  border-radius: 12px;
  border: none;
  background: #ea191f;
  color: white;
  padding: 20px;
  display: grid;
  gap: 10px;
  place-items: center;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
}

.app-button__icon {
  width: 56px;
  height: 56px;
  object-fit: contain;
}

.app-button__text {
  font-weight: 800;
  text-align: center;
}

@media (min-width: 768px) {
  .app-button {
    width: 160px;
    height: 180px;
  }

  .app-button__icon {
    width: 70px;
    height: 70px;
  }
}
</style>