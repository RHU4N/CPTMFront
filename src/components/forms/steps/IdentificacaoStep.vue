<template>
  <section class="wizard-step card">
    <div class="wizard-step-head">
      <div>
        <span class="eyebrow">Step 2</span>
        <h3 class="section-title">Identificação Operacional do Ponto</h3>
        <p class="section-subtitle">Organiza o identificador do registro e os dados de contrato/elemento monitorado.</p>
      </div>
    </div>

    <div class="wizard-grid wizard-grid--2">
      <label class="field-stack">
        <span class="field-label">Código operacional do lançamento</span>
        <span class="field-help">Código único de identificação do registro. Gerado automaticamente em novos cadastros.</span>
        <input v-model="form.pkCdMeioAmbienteCptm" class="input" :class="{ 'is-invalid': errors.pkCdMeioAmbienteCptm }" type="text" placeholder="Ex.: CPTM-2026-0001" :disabled="loading || isEditMode" />
        <small v-if="errors.pkCdMeioAmbienteCptm" class="field-error">{{ errors.pkCdMeioAmbienteCptm }}</small>
      </label>

      <label class="field-stack">
        <span class="field-label">Número do elemento monitorado</span>
        <span class="field-help">Número sequencial do elemento de monitoramento inspecionado.</span>
        <input v-model="form.txNrElementoMonitoramento" class="input" :class="{ 'is-invalid': errors.txNrElementoMonitoramento }" type="text" placeholder="Ex.: 0147-A" :disabled="loading" />
        <small v-if="errors.txNrElementoMonitoramento" class="field-error">{{ errors.txNrElementoMonitoramento }}</small>
      </label>

      <label class="field-stack">
        <span class="field-label">Nome do elemento monitorado</span>
        <span class="field-help">Nome descritivo do ponto de monitoramento (ex.: bueiro, caixa de drenagem).</span>
        <input v-model="form.txNmElementoMonitoramento" class="input" :class="{ 'is-invalid': errors.txNmElementoMonitoramento }" type="text" placeholder="Ex.: Bueiro principal / caixa de drenagem" :disabled="loading" />
        <small v-if="errors.txNmElementoMonitoramento" class="field-error">{{ errors.txNmElementoMonitoramento }}</small>
      </label>

      <label class="field-stack">
        <span class="field-label">Processo ambiental relacionado</span>
        <span class="field-help">Número do processo ambiental vinculado a este elemento, se houver.</span>
        <input v-model="form.txProcessoAmbiental" class="input" :class="{ 'is-invalid': errors.txProcessoAmbiental }" type="text" placeholder="Ex.: Processo ambiental 2026/114" :disabled="loading" />
        <small v-if="errors.txProcessoAmbiental" class="field-error">{{ errors.txProcessoAmbiental }}</small>
      </label>

      <label class="field-stack">
        <span class="field-label">Número do contrato</span>
        <span class="field-help">Número do contrato associado à empresa responsável pelo elemento.</span>
        <input v-model="form.txNumeroContrato" class="input" :class="{ 'is-invalid': errors.txNumeroContrato }" type="text" placeholder="Ex.: CTR-2026-045" :disabled="loading" />
        <small v-if="errors.txNumeroContrato" class="field-error">{{ errors.txNumeroContrato }}</small>
      </label>

      <label class="field-stack">
        <span class="field-label">Empresa contratada responsável</span>
        <span class="field-help">Nome da empresa contratada responsável pela manutenção ou operação do elemento.</span>
        <input v-model="form.txEmpresaContratada" class="input" :class="{ 'is-invalid': errors.txEmpresaContratada }" type="text" placeholder="Ex.: Empresa de manutenção ambiental" :disabled="loading" />
        <small v-if="errors.txEmpresaContratada" class="field-error">{{ errors.txEmpresaContratada }}</small>
      </label>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  form: {
    type: Object,
    default: () => ({}),
  },
  errors: {
    type: Object,
    default: () => ({}),
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const isEditMode = computed(() => Boolean(props.form?.pkCdMeioAmbienteCptm))
</script>
