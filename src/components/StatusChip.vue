<template>
  <span class="status-chip" :class="chipClass">{{ label }}</span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: { type: String, default: '' },
})

const CONFIG = {
  RASCUNHO:                 { label: 'Rascunho',           cls: 'chip-draft' },
  PRONTO_PARA_ENVIO:        { label: 'Pronto para envio',  cls: 'chip-ready' },
  AGUARDANDO_SINCRONIZACAO: { label: 'Aguard. envio',      cls: 'chip-pending' },
  SINCRONIZANDO:            { label: 'Sincronizando',       cls: 'chip-syncing' },
  SINCRONIZADO:             { label: 'Sincronizado',        cls: 'chip-ok' },
  ERRO:                     { label: 'Erro',                cls: 'chip-error' },
}

const entry = computed(() => CONFIG[props.status] || { label: props.status || '—', cls: '' })
const label = computed(() => entry.value.label)
const chipClass = computed(() => entry.value.cls)
</script>

<style scoped>
.status-chip {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  white-space: nowrap;
  flex-shrink: 0;
}

.chip-draft   { background: #fff8e1; color: #f57f17; border: 1px solid #ffe082; }
.chip-ready   { background: #e8f5e9; color: #2e7d32; border: 1px solid #66bb6a; }
.chip-pending { background: #e3f2fd; color: #1565c0; border: 1px solid #90caf9; }
.chip-syncing { background: #fff3e0; color: #e65100; border: 1px solid #ffcc80; }
.chip-ok      { background: #e8f5e9; color: #1b5e20; border: 1px solid #81c784; }
.chip-error   { background: #ffebee; color: #b71c1c; border: 1px solid #ef9a9a; }
</style>
