<template>
  <section class="photo-uploader card">
    <div class="uploader-head">
      <div>
        <h3>Fotos operacionais</h3>
        <p class="muted">Câmera, upload mobile, arrastar e soltar e ordem de evidências.</p>
      </div>

      <div class="uploader-actions">
        <span class="photo-count">{{ previews.length }} / {{ maxFiles }}</span>
        <label class="btn btn-secondary">
          Selecionar
          <input ref="inputRef" class="visually-hidden" type="file" accept="image/*" capture="environment" multiple @change="onChange" />
        </label>
      </div>
    </div>

    <div class="photo-dropzone" @drop.prevent="handleDropZone" @dragover.prevent>
      <p>Solte imagens aqui ou use o botão Selecionar. O sistema mantém até 4 evidências por registro.</p>
    </div>

    <div v-if="previews.length" class="preview-grid preview-grid--photo">
      <figure
        v-for="(preview, index) in previews"
        :key="preview.id"
        class="preview-card"
        draggable="true"
        @dragstart="handleDragStart(index)"
        @dragover.prevent
        @drop.prevent="handleDrop(index)"
      >
        <span class="preview-order">{{ index + 1 }}</span>
        <img :src="preview.src" :alt="preview.name" />
        <figcaption>
          <span>{{ preview.name }}</span>
          <div class="preview-actions">
            <button class="btn btn-ghost" type="button" :disabled="index === 0" @click="moveFile(index, -1)">↑</button>
            <button class="btn btn-ghost" type="button" :disabled="index === previews.length - 1" @click="moveFile(index, 1)">↓</button>
            <button class="btn btn-ghost" type="button" @click="removeFile(index)">Remover</button>
          </div>
        </figcaption>
      </figure>
    </div>
  </section>
</template>

<script setup>
import { onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps({
  files: {
    type: Array,
    default: () => [],
  },
  maxFiles: {
    type: Number,
    default: 4,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:files'])

const previews = ref([])
const inputRef = ref(null)
const dragIndex = ref(null)

const MAX_COMPRESSED_WIDTH = 1600
const COMPRESSION_THRESHOLD = 1_500_000
const COMPRESSION_QUALITY = 0.82

function fingerprint(file) {
  return `${file.name}-${file.size}-${file.lastModified}`
}

function revokeAll() {
  previews.value.forEach((preview) => URL.revokeObjectURL(preview.src))
}

function rebuildPreviews(files) {
  revokeAll()
  previews.value = (files || []).map((file) => ({
    id: fingerprint(file),
    src: URL.createObjectURL(file),
    name: file.name,
  }))
}

async function maybeCompressFile(file) {
  if (!file.type.startsWith('image/') || file.size <= COMPRESSION_THRESHOLD || typeof createImageBitmap !== 'function') {
    return file
  }

  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, MAX_COMPRESSED_WIDTH / bitmap.width)
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)

    const context = canvas.getContext('2d')
    if (!context) {
      bitmap.close?.()
      return file
    }

    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)

    const blob = await new Promise((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', COMPRESSION_QUALITY)
    })

    bitmap.close?.()

    if (!blob) {
      return file
    }

    const normalizedName = file.name.replace(/\.[^.]+$/, '') || file.name
    return new File([blob], `${normalizedName}.jpg`, {
      type: 'image/jpeg',
      lastModified: Date.now(),
    })
  } catch {
    return file
  }
}

function emitFiles(nextFiles) {
  emit('update:files', nextFiles.slice(0, props.maxFiles))
}

async function addFiles(selectedFiles) {
  if (props.disabled) {
    return
  }

  const nextFiles = [...props.files]

  for (const file of selectedFiles) {
    if (nextFiles.length >= props.maxFiles) {
      break
    }

    const compressed = await maybeCompressFile(file)
    if (!nextFiles.some((existing) => fingerprint(existing) === fingerprint(compressed))) {
      nextFiles.push(compressed)
    }
  }

  emitFiles(nextFiles)

  if (inputRef.value) {
    inputRef.value.value = ''
  }
}

function onChange(event) {
  addFiles(Array.from(event.target.files || []))
}

function handleDropZone(event) {
  addFiles(Array.from(event.dataTransfer?.files || []))
}

function reorderFile(sourceIndex, targetIndex) {
  const nextFiles = [...props.files]
  const [item] = nextFiles.splice(sourceIndex, 1)
  const adjustedTarget = sourceIndex < targetIndex ? targetIndex - 1 : targetIndex
  nextFiles.splice(adjustedTarget, 0, item)
  emitFiles(nextFiles)
}

function removeFile(index) {
  const nextFiles = [...props.files]
  nextFiles.splice(index, 1)
  emitFiles(nextFiles)
}

function moveFile(index, direction) {
  const targetIndex = index + direction
  if (targetIndex < 0 || targetIndex >= props.files.length) {
    return
  }

  reorderFile(index, targetIndex)
}

function handleDragStart(index) {
  dragIndex.value = index
}

function handleDrop(index) {
  if (dragIndex.value === null || dragIndex.value === index) {
    return
  }

  reorderFile(dragIndex.value, index)
  dragIndex.value = null
}

watch(
  () => props.files,
  (files) => {
    rebuildPreviews(files)
  },
  { immediate: true, deep: true },
)

onBeforeUnmount(() => {
  revokeAll()
})
</script>

<style scoped>
.photo-uploader {
  display: grid;
  gap: 14px;
}

.uploader-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
}

.uploader-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.photo-count {
  color: var(--muted);
  font-weight: 700;
}

.uploader-head h3 {
  margin: 0;
}

.uploader-head p {
  margin: 4px 0 0;
}

.photo-dropzone {
  border: 1px dashed rgba(234, 25, 31, 0.28);
  background: linear-gradient(180deg, rgba(234, 25, 31, 0.05), rgba(234, 25, 31, 0.02));
  border-radius: 18px;
  padding: 14px;
  color: var(--muted);
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
}

.preview-grid--photo {
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
}

.preview-card {
  margin: 0;
  overflow: hidden;
  border-radius: 18px;
  border: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.03);
  position: relative;
  cursor: grab;
}

.preview-card img {
  width: 100%;
  aspect-ratio: 3 / 4;
  object-fit: cover;
}

.preview-order {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  background: rgba(17, 17, 17, 0.72);
  color: #fff;
  font-size: 0.82rem;
  font-weight: 800;
}

.preview-card figcaption {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 10px;
  padding: 10px;
}

.preview-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.preview-card span {
  min-width: 0;
  font-size: 0.82rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 720px) {
  .uploader-head {
    flex-direction: column;
    align-items: stretch;
  }

  .uploader-actions {
    justify-content: space-between;
  }
}
</style>