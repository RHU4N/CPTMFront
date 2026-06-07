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
        <strong>Armazenamento técnico</strong>
        <p>Os nomes das fotos são enviados no registro principal e os arquivos seguem via multipart/form-data para o upload de anexos, onde o Oracle armazena o byte[] em BLOB.</p>
      </div>
      <ul class="mapping-list">
        <li>Foto 1: PT_EFLUENTE.TX_NOME_FOTO_01</li>
        <li>Foto 2: PT_EFLUENTE.TX_NOME_FOTO_02</li>
        <li>Foto 3: PT_EFLUENTE.TX_NOME_FOTO_03</li>
        <li>Foto 4: PT_EFLUENTE.TX_NOME_FOTO_04</li>
      </ul>
    </div>

    <PhotoUploader v-model:files="filesProxy" :max-files="4" :disabled="loading" />
  </section>
</template>

<script setup>
import { computed } from 'vue'
import PhotoUploader from '@/components/PhotoUploader.vue'

const props = defineProps({
  files: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:files'])

const filesProxy = computed({
  get: () => props.files,
  set: (value) => emit('update:files', value),
})
</script>
