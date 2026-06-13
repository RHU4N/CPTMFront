<template>
  <section class="photo-uploader card">
    <div class="uploader-head">
      <div>
        <h3>Fotos operacionais</h3>
        <p class="muted">Câmera 3×4, upload mobile, arrastar e soltar e ordem de evidências.</p>
      </div>

      <div class="uploader-actions">
        <span class="photo-count">{{ previews.length }} / {{ maxFiles }}</span>
        <button v-if="cameraAvailable && previews.length < maxFiles && !disabled" class="btn btn-primary" type="button" @click="openCamera">
          Câmera
        </button>
        <label v-if="previews.length < maxFiles && !disabled" class="btn btn-secondary">
          Arquivo
          <input ref="inputRef" class="visually-hidden" type="file" accept="image/*" multiple @change="onChange" />
        </label>
      </div>
    </div>

    <div class="photo-dropzone" @drop.prevent="handleDropZone" @dragover.prevent>
      <p>Solte imagens aqui ou use os botões acima. Crop automático 3×4. Máximo 4 fotos.</p>
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
          <input
            class="input input--desc"
            type="text"
            :value="preview.description"
            :placeholder="`Descrição foto ${index + 1}...`"
            :disabled="disabled"
            @input="updateDescription(index, $event.target.value)"
          />
          <div class="preview-actions">
            <button class="btn btn-ghost" type="button" :disabled="index === 0" @click="moveFile(index, -1)">↑</button>
            <button class="btn btn-ghost" type="button" :disabled="index === previews.length - 1" @click="moveFile(index, 1)">↓</button>
            <button class="btn btn-ghost" type="button" @click="removeFile(index)">Remover</button>
          </div>
        </figcaption>
      </figure>
    </div>

    <!-- Overlay de câmera 3×4 -->
    <Teleport to="body">
      <div v-if="showCamera" class="camera-overlay" @click.self="closeCamera">
        <div class="camera-shell">
          <div class="camera-frame">
            <video ref="videoRef" class="camera-video" autoplay playsinline muted></video>
            <div class="camera-guide">
              <span class="camera-guide-label">3×4</span>
            </div>
          </div>
          <div class="camera-bar">
            <button class="camera-btn camera-btn--cancel" type="button" @click="closeCamera">Cancelar</button>
            <button class="camera-btn camera-btn--capture" type="button" :disabled="!streamReady" @click="capturePhoto">⊙</button>
            <button class="camera-btn camera-btn--flip" type="button" @click="flipCamera">⇄</button>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  files: {
    type: Array,
    default: () => [],
  },
  descriptions: {
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

const emit = defineEmits(['update:files', 'update:descriptions'])

const previews = ref([])
const inputRef = ref(null)
const dragIndex = ref(null)

const MAX_PHOTO_WIDTH = 900
const PHOTO_RATIO = 3 / 4
const COMPRESSION_QUALITY = 0.82

// ─── câmera getUserMedia ────────────────────────────────────────────────────
const cameraAvailable = ref(false)
const showCamera = ref(false)
const streamReady = ref(false)
const videoRef = ref(null)
let mediaStream = null
let facingMode = 'environment'

onMounted(async () => {
  if (navigator.mediaDevices?.getUserMedia) {
    cameraAvailable.value = true
  }
})

async function openCamera() {
  if (props.disabled || props.files.length >= props.maxFiles) return
  showCamera.value = true
  streamReady.value = false
  await startStream()
}

async function startStream() {
  stopStream()
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode,
        aspectRatio: { ideal: PHOTO_RATIO },
        width: { ideal: 900 },
        height: { ideal: 1200 },
      },
    })
    if (videoRef.value) {
      videoRef.value.srcObject = mediaStream
      videoRef.value.onloadedmetadata = () => { streamReady.value = true }
    }
  } catch {
    stopStream()
    showCamera.value = false
    // fallback: abre seletor de arquivo
    inputRef.value?.click()
  }
}

async function flipCamera() {
  facingMode = facingMode === 'environment' ? 'user' : 'environment'
  await startStream()
}

function stopStream() {
  mediaStream?.getTracks().forEach((t) => t.stop())
  mediaStream = null
  streamReady.value = false
}

function closeCamera() {
  stopStream()
  showCamera.value = false
}

async function capturePhoto() {
  const video = videoRef.value
  if (!video || !streamReady.value) return

  const vw = video.videoWidth
  const vh = video.videoHeight
  if (!vw || !vh) return

  // Crop central 3:4
  const srcRatio = vw / vh
  let sx, sy, sw, sh
  if (srcRatio > PHOTO_RATIO) {
    sh = vh; sw = sh * PHOTO_RATIO; sx = (vw - sw) / 2; sy = 0
  } else {
    sw = vw; sh = sw / PHOTO_RATIO; sx = 0; sy = (vh - sh) / 2
  }

  const scale = Math.min(1, MAX_PHOTO_WIDTH / sw)
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(sw * scale)
  canvas.height = Math.round(sh * scale)
  canvas.getContext('2d').drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', COMPRESSION_QUALITY))
  if (!blob) return

  const file = new File([blob], `foto-campo-${Date.now()}.jpg`, { type: 'image/jpeg' })
  closeCamera()
  addFiles([file])
}

// ─── compressão / crop para uploads por arquivo ───────────────────────────
function fingerprint(file) {
  return `${file.name}-${file.size}-${file.lastModified}`
}

function revokeAll() {
  previews.value.forEach((preview) => URL.revokeObjectURL(preview.src))
}

function rebuildPreviews(files) {
  revokeAll()
  const prevDescMap = Object.fromEntries(previews.value.map((p) => [p.id, p.description || '']))
  previews.value = (files || []).map((file, index) => {
    const fp = fingerprint(file)
    return {
      id: fp,
      src: URL.createObjectURL(file),
      name: file.name,
      description: prevDescMap[fp] ?? props.descriptions[index] ?? '',
    }
  })
}

function updateDescription(index, value) {
  previews.value[index].description = value
  emit('update:descriptions', previews.value.map((p) => p.description))
}

async function maybeCompressFile(file) {
  if (!file.type.startsWith('image/') || typeof createImageBitmap !== 'function') {
    return file
  }

  try {
    const bitmap = await createImageBitmap(file)

    const srcRatio = bitmap.width / bitmap.height
    let srcX, srcY, srcW, srcH
    if (srcRatio > PHOTO_RATIO) {
      srcH = bitmap.height; srcW = srcH * PHOTO_RATIO; srcX = (bitmap.width - srcW) / 2; srcY = 0
    } else {
      srcW = bitmap.width; srcH = srcW / PHOTO_RATIO; srcX = 0; srcY = (bitmap.height - srcH) / 2
    }

    const scale = Math.min(1, MAX_PHOTO_WIDTH / srcW)
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(srcW * scale)
    canvas.height = Math.round(srcH * scale)

    const context = canvas.getContext('2d')
    if (!context) { bitmap.close?.(); return file }

    context.drawImage(bitmap, srcX, srcY, srcW, srcH, 0, 0, canvas.width, canvas.height)

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', COMPRESSION_QUALITY))
    bitmap.close?.()
    if (!blob) return file

    const normalizedName = file.name.replace(/\.[^.]+$/, '') || file.name
    return new File([blob], `${normalizedName}.jpg`, { type: 'image/jpeg', lastModified: Date.now() })
  } catch {
    return file
  }
}

function emitFiles(nextFiles) {
  emit('update:files', nextFiles.slice(0, props.maxFiles))
}

async function addFiles(selectedFiles) {
  if (props.disabled) return

  const nextFiles = [...props.files]
  for (const file of selectedFiles) {
    if (nextFiles.length >= props.maxFiles) break
    const compressed = await maybeCompressFile(file)
    if (!nextFiles.some((existing) => fingerprint(existing) === fingerprint(compressed))) {
      nextFiles.push(compressed)
    }
  }

  emitFiles(nextFiles)
  if (inputRef.value) inputRef.value.value = ''
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
  if (targetIndex < 0 || targetIndex >= props.files.length) return
  reorderFile(index, targetIndex)
}

function handleDragStart(index) { dragIndex.value = index }

function handleDrop(index) {
  if (dragIndex.value === null || dragIndex.value === index) return
  reorderFile(dragIndex.value, index)
  dragIndex.value = null
}

watch(() => props.files, (files) => { rebuildPreviews(files) }, { immediate: true, deep: true })

onBeforeUnmount(() => {
  revokeAll()
  stopStream()
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

.uploader-head h3 { margin: 0; }
.uploader-head p { margin: 4px 0 0; }

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
  grid-template-columns: repeat(auto-fill, minmax(140px, 160px));
  gap: 12px;
  justify-content: start;
}

.preview-grid--photo {
  grid-template-columns: repeat(auto-fill, minmax(140px, 160px));
  justify-content: start;
}

.preview-card {
  margin: 0;
  overflow: hidden;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.03);
  position: relative;
  cursor: grab;
  width: 100%;
}

.preview-card img {
  display: block;
  width: 100%;
  aspect-ratio: 3 / 4;
  object-fit: cover;
  object-position: center;
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

.input--desc {
  width: 100%;
  font-size: 0.82rem;
  padding: 5px 8px;
  border: 1px solid var(--border, #e0e0e0);
  border-radius: 6px;
  background: #fff;
  color: #333;
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

/* ─── Overlay de câmera ──────────────────────────────────────────────────── */
.camera-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.camera-shell {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
}

.camera-frame {
  position: relative;
  flex: 1;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.camera-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.camera-guide {
  position: absolute;
  inset: 0;
  pointer-events: none;
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  padding: 12px;
}

.camera-guide::before {
  /* moldura 3×4 centralizada */
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: min(75vw, 56.25vh);    /* 3 partes de 4 */
  height: min(100vh, 75vw * 4 / 3);
  aspect-ratio: 3 / 4;
  border: 2px solid rgba(255, 255, 255, 0.7);
  border-radius: 8px;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.45);
}

.camera-guide-label {
  position: relative;
  z-index: 1;
  background: rgba(0,0,0,0.55);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
}

.camera-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 18px 28px;
  padding-bottom: max(18px, env(safe-area-inset-bottom));
  background: #111;
  gap: 20px;
}

.camera-btn {
  border: none;
  background: none;
  color: #fff;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 10px;
  border-radius: 10px;
  transition: background 0.15s;
}

.camera-btn:hover { background: rgba(255,255,255,0.12); }

.camera-btn--capture {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: #fff;
  color: #111;
  font-size: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.camera-btn--capture:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.camera-btn--capture:not(:disabled):active {
  transform: scale(0.93);
}

.camera-btn--flip { font-size: 1.4rem; }

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
