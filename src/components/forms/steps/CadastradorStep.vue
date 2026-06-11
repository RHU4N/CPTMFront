<template>
  <section class="wizard-step card">
    <div class="wizard-step-head">
      <div>
        <span class="eyebrow">Passo 2 de 8</span>
        <h3 class="section-title">Identificação do Cadastrador e Responsável Técnico</h3>
        <p class="section-subtitle">Autor do cadastramento, responsável técnico, registro profissional e documento de responsabilidade.</p>
      </div>
    </div>

    <div v-if="sessionLabel" class="session-hint">
      <span class="session-hint-icon">👤</span>
      <span>Logado como: <strong>{{ sessionLabel }}</strong></span>
    </div>

    <div class="wizard-grid wizard-grid--2">
      <label class="field-stack">
        <span class="field-label">Autor(a) (PJ) do Cadastramento</span>
        <small class="field-help">Responsável Pessoa Jurídica por realizar o cadastramento da informação.</small>
        <input v-model="form.txAutorPjDoCadastro" class="input" type="text" placeholder="Ex.: Companhia Paulista de Trens Metropolitanos - CPTM" :disabled="loading" />
      </label>

      <label class="field-stack">
        <span class="field-label">Autor(a) (PF) do Cadastramento</span>
        <small class="field-help">Inserir o nome completo da pessoa que realizou o cadastramento da informação.</small>
        <input v-model="form.txAutorPfDoCadastro" class="input" :class="{ 'is-invalid': errors.txAutorPfDoCadastro }" type="text" placeholder="Ex.: Nome e Sobrenome" :disabled="loading" />
        <small v-if="errors.txAutorPfDoCadastro" class="field-error">{{ errors.txAutorPfDoCadastro }}</small>
      </label>

      <label class="field-stack">
        <span class="field-label">Responsável Técnico - RT pelo Cadastramento</span>
        <small class="field-help">Inserir o nome completo do(a) responsável técnico(a) pelo cadastramento/caracterização da informação.</small>
        <input v-model="form.txNmResponsavelCadastro" class="input" :class="{ 'is-invalid': errors.txNmResponsavelCadastro }" type="text" placeholder="Ex.: Nome e Sobrenome do RT" :disabled="loading" />
        <small v-if="errors.txNmResponsavelCadastro" class="field-error">{{ errors.txNmResponsavelCadastro }}</small>
      </label>

      <label class="field-stack">
        <span class="field-label">Registro Profissional (do RT)</span>
        <small class="field-help">Inserir o registro profissional do(a) responsável técnico(a) pelo cadastramento.</small>
        <input v-model="form.txRpResponsavelCadastro" class="input" type="text" placeholder="Ex.: CREA - 123456" :disabled="loading" />
      </label>

      <label class="field-stack field-stack--full">
        <span class="field-label">Documento de Responsabilidade Técnica (do RT)</span>
        <small class="field-help">Inserir o documento de responsabilidade técnica do(a) RT pela realização do trabalho. Ex.: Anotação de Responsabilidade Técnica - ART.</small>
        <input v-model="form.txDrtResponsavelCadastro" class="input" type="text" placeholder="Ex.: ART nº 123456" :disabled="loading" />
      </label>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

defineProps({
  form: { type: Object, default: () => ({}) },
  domains: { type: Object, default: () => ({}) },
  errors: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false },
})

const authStore = useAuthStore()
const sessionLabel = computed(() => {
  const s = authStore.session
  if (!s) return ''
  const parts = [s.nmUsuario, s.dsEmail].filter(Boolean)
  return parts.join(' · ')
})
</script>

<style scoped>
.session-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 10px;
  background: rgba(234, 25, 31, 0.07);
  font-size: 0.85rem;
  color: var(--muted);
  margin-bottom: 4px;
}
.session-hint-icon { font-size: 1rem; }
</style>
