<template>
  <section class="card efluente-list">
    <div class="list-head">
      <div>
        <h2 class="section-title">Efluentes recentes</h2>
        <p class="section-subtitle">Registros, filtros e atalhos para o mapa.</p>
      </div>

      <button class="create-btn" type="button" @click="$emit('new')">+ Novo registro</button>
    </div>

    <div v-if="loading" class="loading-state">Carregando efluentes...</div>
    <div v-else-if="!items.length" class="empty-state">Nenhum efluente encontrado com os filtros atuais.</div>

    <div v-else class="list-items">
      <article
        v-for="item in items"
        :key="item.pkCdMeioAmbienteCptm"
        class="item-card"
        :class="{ selected: String(item.pkCdMeioAmbienteCptm) === String(selectedId) }"
      >
        <div class="item-info">
          <div class="item-text">
            <h3>{{ item.pkCdMeioAmbienteCptm }}</h3>
            <p class="muted">{{ item.txNmElementoMonitoramento || item.txNrElementoMonitoramento || 'Sem elemento de monitoramento' }}</p>
            <span class="item-date">{{ formatDate(item.dtDataDoCadastramento) }}</span>
            <span class="item-desc">{{ locationLabel(item) }}</span>
            <span v-if="item.txStatusDoDesvioAmbiental" class="item-desc">{{ item.txStatusDoDesvioAmbiental }}</span>
          </div>

          <span v-if="item.txStatusDoDesvioAmbiental" class="status-chip">{{ item.txStatusDoDesvioAmbiental }}</span>
        </div>

        <div class="item-actions">
          <button class="btn btn-ghost" type="button" @click="$emit('select', item.pkCdMeioAmbienteCptm)">Mapa</button>
          <button class="btn btn-secondary" type="button" @click="$emit('edit', item)">Editar</button>
          <button class="btn btn-danger" type="button" @click="$emit('remove', item)">Excluir</button>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  selectedId: {
    type: [String, Number],
    default: null,
  },
})

defineEmits(['new', 'select', 'edit', 'remove'])

function formatDate(value) {
  if (!value) return 'Sem data'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString('pt-BR')
}

function locationLabel(item) {
  const parts = [item.txMunicipio, item.txLinhaCptm, item.txKmPoste].filter(Boolean)
  return parts.length ? parts.join(' · ') : 'Localização não informada'
}
</script>

<style scoped>
.efluente-list {
  display: grid;
  gap: 16px;
}

.list-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: end;
}

.create-btn {
  padding: 10px 15px;
  border: none;
  border-radius: 8px;
  background: #ea191f;
  color: white;
  font-weight: bold;
  cursor: pointer;
}

.create-btn:hover { opacity: 0.9; }

.list-items {
  display: grid;
  gap: 10px;
}

.item-card {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.item-card.selected {
  outline: 2px solid rgba(234, 25, 31, 0.28);
}

.item-info {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
  flex: 1 1 320px;
}

.item-text {
  display: grid;
  gap: 2px;
}

.item-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.item-info h3 {
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
}

.item-info p { margin: 0; }

.item-date {
  color: #777;
  font-size: 0.82rem;
}

.item-desc {
  font-size: 0.82rem;
  color: #555;
}

.status-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  border-radius: 8px;
  background: rgba(234, 25, 31, 0.12);
  color: #ea191f;
  font-size: 0.78rem;
  font-weight: 700;
  white-space: nowrap;
  flex-shrink: 0;
}

.item-actions button {
  padding: 5px 10px;
  border: none;
  border-radius: 6px;
  background: #ea191f;
  color: white;
  cursor: pointer;
}

.item-actions button:hover { opacity: 0.9; }

.item-actions button.btn-danger { background: #444; }

@media (max-width: 720px) {
  .list-head,
  .item-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .item-info { flex-direction: column; }

  .item-actions button { width: 100%; }
}
</style>
