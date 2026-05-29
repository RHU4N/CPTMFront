<template>
  <div ref="mapContainer" class="map-shell surface"></div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  selectedId: {
    type: [String, Number],
    default: null,
  },
})

const mapContainer = ref(null)
let mapInstance = null
let markersLayer = null

const validItems = computed(() =>
  props.items.filter((item) => Number.isFinite(Number(item.txCoordenadaX)) && Number.isFinite(Number(item.txCoordenadaY))),
)

function renderMarkers() {
  if (!mapInstance || !markersLayer) {
    return
  }

  markersLayer.clearLayers()

  validItems.value.forEach((item) => {
    const lat = Number(item.txCoordenadaY)
    const lng = Number(item.txCoordenadaX)
    const marker = L.circleMarker([lat, lng], {
      radius: String(item.pkCdMeioAmbienteCptm) === String(props.selectedId) ? 9 : 7,
      color: '#be1e2d',
      weight: 2,
      fillColor: '#f6f7f8',
      fillOpacity: 0.92,
    })

    const popupHtml = `
      <div style="min-width:220px">
        <strong>${item.pkCdMeioAmbienteCptm || 'Efluente'}</strong><br />
        <small>${item.txEndereco || 'Sem endereço'}</small><br />
        <small>Linha ${item.idLinha} | Município ${item.idMunicipio}</small>
      </div>
    `

    marker.bindPopup(popupHtml)
    marker.addTo(markersLayer)
  })

  if (validItems.value.length) {
    const bounds = validItems.value.map((item) => [Number(item.txCoordenadaY), Number(item.txCoordenadaX)])
    mapInstance.fitBounds(bounds, { padding: [28, 28] })
  }
}

onMounted(() => {
  if (!mapContainer.value) {
    return
  }

  mapInstance = L.map(mapContainer.value, { zoomControl: true }).setView([-23.55052, -46.633308], 11)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(mapInstance)
  markersLayer = L.layerGroup().addTo(mapInstance)
  renderMarkers()
})

watch(
  () => [props.items, props.selectedId],
  () => renderMarkers(),
  { deep: true },
)

onBeforeUnmount(() => {
  if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
    markersLayer = null
  }
})
</script>

<style scoped>
.map-shell {
  width: 100%;
  height: 420px;
  border-radius: 24px;
  overflow: hidden;
}

@media (max-width: 720px) {
  .map-shell {
    height: 320px;
  }
}
</style>