<template>
  <section class="wizard-step card">
    <div class="wizard-step-head">
      <div>
        <span class="eyebrow">Passo 7 de 8</span>
        <h3 class="section-title">Registro Fotográfico</h3>
        <p class="section-subtitle">Até 4 fotos, com preview, câmera mobile, upload desktop e ordenação operacional.</p>
      </div>
    </div>

    <div class="helper-box helper-box--compact">
      <div>
        <strong>Orientações para registro fotográfico</strong>
        <p>Fotografe o elemento de monitoramento com boa iluminação e enquadramento. Adicione uma descrição a cada foto para facilitar a identificação durante a análise. A imagem será automaticamente ajustada para o formato 3×4.</p>
      </div>
    </div>

    <PhotoUploader
      v-model:files="filesProxy"
      :descriptions="photoDescriptions"
      :max-files="4"
      :disabled="loading"
      @update:descriptions="onDescriptions"
    />
  </section>
</template>

<script setup>
import { computed } from 'vue'
import PhotoUploader from '@/components/PhotoUploader.vue'

const props = defineProps({
  files: { type: Array, default: () => [] },
  form: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['update:files'])

const filesProxy = computed({
  get: () => props.files,
  set: (value) => emit('update:files', value),
})

const SLOTS = ['txNomeFoto01', 'txNomeFoto02', 'txNomeFoto03', 'txNomeFoto04']

const photoDescriptions = computed(() => SLOTS.map((slot) => props.form?.[slot] || ''))

function onDescriptions(descriptions) {
  SLOTS.forEach((slot, i) => {
    if (props.form) props.form[slot] = descriptions[i] || ''
  })
}
</script>
