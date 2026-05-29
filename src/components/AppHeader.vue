<template>
  <header class="app-header">
    <button class="brand" type="button" @click="$emit('home')">
      <img class="brand-mark" :src="logo" alt="Logo" />
    </button>

    <h1 class="header-title">{{ title }}</h1>

    <div class="header-actions">
      <slot name="actions" />
      <button class="logout-btn" title="Sair" type="button" @click="$emit('logout')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      </button>
    </div>
  </header>
</template>

<script setup>
import logo from '/logoH.png'

defineProps({
  title: {
    type: String,
    default: 'Bem-vindo',
  },
  subtitle: {
    type: String,
    default: 'Mobilidade, campo e sincronização',
  },
  showAdmin: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['home', 'logout', 'admin'])
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 40;
  padding: 15px 20px;
  background: #ea191f;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.brand {
  display: flex;
  align-items: center;
  gap: 14px;
  background: transparent;
  border: 0;
  color: inherit;
  cursor: pointer;
  padding: 0;
}

.brand-mark {
  height: var(--header-logo-height);
  width: auto;
  object-fit: contain;
}

.header-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  text-align: center;
}

.header-actions {
  display: flex;
  gap: 16px;
  align-items: center;
}

.logout-btn {
  background: none;
  border: 0;
  color: inherit;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
  border-radius: 4px;
  transition: background 0.2s;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

@media (max-width: 720px) {
  .app-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-title {
    position: static;
    transform: none;
  }

  .header-actions {
    justify-content: flex-end;
  }
}
</style>