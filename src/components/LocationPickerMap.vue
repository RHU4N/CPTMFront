<template>
  <div class="location-picker-shell surface">
    <div ref="mapContainer" class="location-picker-map"></div>
    <p class="location-picker-caption">
      <span v-if="hasCoordinates">Clique em outro ponto do mapa para atualizar a posição.</span>
      <span v-else>Toque no mapa para definir a coordenada inicial.</span>
    </p>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps({
  latitude: {
    type: [Number, null],
    default: null,
  },
  longitude: {
    type: [Number, null],
    default: null,
  },
  zoom: {
    type: Number,
    default: 15,
  },
})

const emit = defineEmits(['pick'])

const mapContainer = ref(null)
let mapInstance = null
let marker = null
let markerDragListenerRegistered = false

const hasCoordinates = computed(() => Number.isFinite(Number(props.latitude)) && Number.isFinite(Number(props.longitude)))

function setMarker(latitude, longitude, zoom = props.zoom) {
  if (!mapInstance) {
    return
  }

  const coordinates = [latitude, longitude]

  if (!marker) {
    marker = L.marker(coordinates, { draggable: true }).addTo(mapInstance)
  } else {
    marker.setLatLng(coordinates)
  }

  if (!markerDragListenerRegistered) {
    marker.on('dragend', () => {
      const position = marker?.getLatLng()

      if (!position) {
        return
      }

      emit('pick', {
        latitude: Number(position.lat.toFixed(6)),
        longitude: Number(position.lng.toFixed(6)),
      })
    })

    markerDragListenerRegistered = true
  }

  mapInstance.setView(coordinates, zoom)
}

function renderCurrentCoordinates() {
  if (!hasCoordinates.value || !mapInstance) {
    return
  }

  setMarker(Number(props.latitude), Number(props.longitude))
}

onMounted(() => {
  if (!mapContainer.value) {
    return
  }

  mapInstance = L.map(mapContainer.value, {
    zoomControl: true,
  }).setView([-23.55052, -46.633308], 12)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(mapInstance)

  mapInstance.on('click', (event) => {
    emit('pick', {
      latitude: Number(event.latlng.lat.toFixed(6)),
      longitude: Number(event.latlng.lng.toFixed(6)),
    })
  })

  renderCurrentCoordinates()
})

watch(
  () => [props.latitude, props.longitude],
  () => renderCurrentCoordinates(),
)

onBeforeUnmount(() => {
  if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
    marker = null
    markerDragListenerRegistered = false
  }
})
</script>

<style scoped>
.location-picker-shell {
  display: grid;
  gap: 10px;
  padding: 12px;
  border-radius: 20px;
}

.location-picker-map {
  width: 100%;
  min-height: 260px;
  border-radius: 16px;
  overflow: hidden;
}

.location-picker-caption {
  margin: 0;
  font-size: 0.9rem;
  color: var(--muted);
}
</style>