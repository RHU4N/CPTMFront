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
    <div v-else-if="!filteredItems.length" class="empty-state">Nenhum efluente encontrado com os filtros atuais.</div>

    <div v-else class="list-items">
      <article
        v-for="item in filteredItems"
        :key="item.pkCdMeioAmbienteCptm"
        class="item-card"
        :class="{ selected: String(item.pkCdMeioAmbienteCptm) === String(selectedId) }"
      >
        <div class="item-info">
          <div>
            <h3>{{ item.pkCdMeioAmbienteCptm }}</h3>
            <p class="muted">{{ item.txNmElementoMonitoramento || 'Sem nome' }}</p>
            <span class="item-date">{{ formatDate(item.dtRegistro) }}</span>
            <span class="item-desc">{{ item.txEndereco || 'Sem endereço informado' }}</span>
            <span class="item-desc">Linha {{ item.idLinha }} · Município {{ item.idMunicipio }} · Via {{ item.idVia }}</span>
          </div>

          <span v-if="item.idStatusDesvio !== undefined" class="status-chip">Status {{ item.idStatusDesvio }}</span>
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
import { computed } from 'vue'

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
  filters: {
    type: Object,
    default: () => ({}),
  },
})

defineEmits(['new', 'select', 'edit', 'remove'])

function formatDate(value) {
  if (!value) {
    return 'Sem data'
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString('pt-BR')
}

const filteredItems = computed(() => {
  const { status, municipio, linha, dateFrom, dateTo } = props.filters || {}
  return props.items.filter((item) => {
    const matchesStatus = !status || String(item.idStatusDesvio) === String(status)
    const matchesMunicipio = !municipio || String(item.idMunicipio) === String(municipio)
    const matchesLinha = !linha || String(item.idLinha) === String(linha)

    const registro = item.dtRegistro ? new Date(item.dtRegistro) : null
    const matchesDateFrom = !dateFrom || !registro || registro >= new Date(`${dateFrom}T00:00:00`)
    const matchesDateTo = !dateTo || !registro || registro <= new Date(`${dateTo}T23:59:59`)

    return matchesStatus && matchesMunicipio && matchesLinha && matchesDateFrom && matchesDateTo
  })
})
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

.create-btn:hover {
  opacity: 0.9;
}

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

.item-info,
.item-actions {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.item-info h3,
.item-info p,
.item-date,
.item-desc {
  margin: 0;
}

.item-info {
  flex: 1 1 320px;
  align-items: flex-start;
}

.item-info h3 {
  font-size: 1rem;
  font-weight: 700;
}

.item-date {
  color: #777;
  display: block;
  margin-top: 2px;
}

.item-desc {
  display: block;
  margin-top: 5px;
  color: #555;
}

.status-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  border-radius: 8px;
  background: #ea191f;
  color: #fff;
  font-size: 0.82rem;
  white-space: nowrap;
}

.item-actions button {
  padding: 5px 10px;
  border: none;
  border-radius: 6px;
  background: #ea191f;
  color: white;
  cursor: pointer;
}

.item-actions button:hover {
  opacity: 0.9;
}

.item-actions button.btn-danger {
  background: #444;
}

@media (max-width: 720px) {
  .list-head,
  .item-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .item-info {
    flex-direction: column;
  }

  .item-actions button {
    width: 100%;
  }
}
</style>