<template>
  <section class="card efluente-list">
    <div class="list-head">
      <div>
        <h2 class="section-title">{{ title }}</h2>
        <p class="section-subtitle">{{ subtitle }}</p>
      </div>
      <button class="create-btn" type="button" @click="$emit('new')">+ Nova inspeção</button>
    </div>

    <div v-if="loading" class="loading-state">Carregando inspeções...</div>
    <div v-else-if="!items.length" class="empty-state">Nenhuma inspeção encontrada.</div>

    <div v-else class="list-items">
      <article
        v-for="item in pageItems"
        :key="item.pkCdMeioAmbienteCptm"
        class="item-card"
        :class="{ selected: String(item.pkCdMeioAmbienteCptm) === String(selectedId) }"
      >
        <div class="item-main">
          <div class="item-text">
            <div class="item-title-row">
              <h3 class="item-name">{{ item.txNmElementoMonitoramento || item.txNrElementoMonitoramento || 'Sem nome' }}</h3>
              <StatusChip v-if="item._status" :status="item._status" />
            </div>

            <div class="item-meta">
              <span v-if="item.dtDataDoCadastramento" class="meta-item">{{ formatDate(item.dtDataDoCadastramento) }}{{ item.hrHorasDoCadastramento ? ' ' + item.hrHorasDoCadastramento : '' }}</span>
              <span v-if="item.txViaCptm" class="meta-item">{{ item.txViaCptm }}</span>
              <span v-if="item.txEstacaoCptm" class="meta-item">{{ item.txEstacaoCptm }}</span>
              <span v-if="item.txMunicipio" class="meta-item">{{ item.txMunicipio }}</span>
              <span v-if="item.txStatusDoDesvioAmbiental" class="meta-item status-text">{{ item.txStatusDoDesvioAmbiental }}</span>
            </div>

            <span v-if="isAdmin && item.txAutorPfDoCadastro" class="item-author">Por: {{ item.txAutorPfDoCadastro }}</span>
          </div>
        </div>

        <div class="item-actions">
          <button class="btn btn-ghost" type="button" @click="$emit('select', item.pkCdMeioAmbienteCptm)">Visualizar</button>
          <button v-if="isAdmin" class="btn btn-secondary" type="button" @click="$emit('edit', item)">Editar</button>
          <button v-if="isAdmin" class="btn btn-danger" type="button" @click="$emit('remove', item)">Excluir</button>
        </div>
      </article>
    </div>

    <!-- Paginação -->
    <div v-if="totalPages > 1" class="list-pagination">
      <button class="page-btn" :disabled="page === 1" @click="page = 1">«</button>
      <button class="page-btn" :disabled="page === 1" @click="page--">‹</button>
      <span class="page-info">{{ page }} / {{ totalPages }}</span>
      <button class="page-btn" :disabled="page === totalPages" @click="page++">›</button>
      <button class="page-btn" :disabled="page === totalPages" @click="page = totalPages">»</button>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import StatusChip from '@/components/StatusChip.vue'

const PAGE_SIZE = 10

const props = defineProps({
  items: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  selectedId: { type: [String, Number], default: null },
  isAdmin: { type: Boolean, default: false },
  title: { type: String, default: 'Inspeções recentes' },
  subtitle: { type: String, default: 'Registros sincronizados com o servidor.' },
})

defineEmits(['new', 'select', 'edit', 'remove'])

const page = ref(1)

watch(() => props.items, () => { page.value = 1 })

const totalPages = computed(() => Math.max(1, Math.ceil(props.items.length / PAGE_SIZE)))
const pageItems = computed(() => {
  const start = (page.value - 1) * PAGE_SIZE
  return props.items.slice(start, start + PAGE_SIZE)
})

function formatDate(value) {
  if (!value) return ''
  try { return new Intl.DateTimeFormat('pt-BR').format(new Date(value)) } catch { return String(value) }
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
  align-items: flex-end;
  flex-wrap: wrap;
}

.create-btn {
  padding: 10px 15px;
  border: none;
  border-radius: 8px;
  background: #ea191f;
  color: white;
  font-weight: bold;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
}

.create-btn:hover { opacity: 0.9; }

.list-items {
  display: grid;
  gap: 10px;
}

.item-card {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 14px 16px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 12px;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.item-card.selected {
  border-color: rgba(234, 25, 31, 0.4);
  box-shadow: 0 0 0 2px rgba(234, 25, 31, 0.12);
}

.item-main {
  flex: 1 1 220px;
  min-width: 0;
}

.item-text {
  display: grid;
  gap: 5px;
}

.item-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.item-name {
  font-size: 0.98rem;
  font-weight: 700;
  margin: 0;
  color: #1a1a1a;
}

.item-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.meta-item {
  font-size: 0.8rem;
  color: #666;
  background: #f5f5f5;
  padding: 2px 8px;
  border-radius: 6px;
}

.status-text {
  color: #555;
}

.item-author {
  font-size: 0.78rem;
  color: #999;
  font-style: italic;
}

.item-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-shrink: 0;
}

.item-actions .btn {
  padding: 6px 12px;
  font-size: 0.82rem;
}

.list-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 14px;
  flex-wrap: wrap;
}

.page-btn {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  font-size: 0.88rem;
  transition: background 0.15s;
}

.page-btn:hover:not(:disabled) { background: #f5f5f5; }
.page-btn:disabled { opacity: 0.4; cursor: default; }

.page-info {
  font-size: 0.85rem;
  color: #555;
  min-width: 50px;
  text-align: center;
}

@media (max-width: 640px) {
  .item-card {
    flex-direction: column;
  }

  .item-main {
    flex: 0 0 auto;
  }

  .item-actions {
    width: 100%;
    justify-content: stretch;
  }

  .item-actions .btn {
    flex: 1;
    text-align: center;
  }
}
</style>
