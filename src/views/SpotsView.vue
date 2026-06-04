<script setup>
import { ref, onMounted, computed } from 'vue'
import {
  mdiMapMarker,
  mdiClose,
  mdiMapMarkerRadius,
  mdiClock,
} from '@mdi/js'
import ReservationChart from '@/components/ReservationChart.vue'
import ReservasList from '@/components/ReservasList.vue'
import Navbar from '@/components/NavBar.vue'
import SectionMain from '@/components/SectionMain.vue'
import CardBox from '@/components/CardBox.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseIcon from '@/components/BaseIcon.vue'

import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

delete L.Icon.Default.prototype._getIconUrl

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})
const selectedSpot = ref(null)
const showSidebar = ref(false)

const markers = new Map()
const selectedSpotId = ref(null)

let activeMarker = null

const defaultIcon = new L.Icon.Default()
const activeIcon = L.icon({
  iconUrl:
    'data:image/svg+xml;charset=UTF-8,' +
    encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24">
        <path fill="#0B2027" d="M12 2C8.1 2 5 5.1 5 9c0 5.3 7 13 7 13s7-7.7 7-13c0-3.9-3.1-7-7-7z"/>
        <circle cx="12" cy="9" r="2.5" fill="white"/>
      </svg>
    `),
  iconSize: [40, 40],
  iconAnchor: [20, 40],
})

const selectSpot = (spot) => {
  selectedSpot.value = spot
  showSidebar.value = true
}

const closeSidebar = () => {
  showSidebar.value = false
  selectedSpot.value = null
}


onMounted(async () => {
  const map = L.map('map').setView([41.1579, -8.6291], 13)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { attribution: '&copy; OpenStreetMap &copy; CARTO', }).addTo(map)
  const token = localStorage.getItem('token')

  const response = await fetch('http://localhost:3000/api/spots', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  const spotsData = await response.json()
  spotsData.forEach((spot) => {
    const lat = Number(spot.latitude)
    const lng = Number(spot.longitude)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      console.warn('Invalid coords:', spot)
      return
    }
    const marker = L.marker([lat, lng], {
      icon: defaultIcon,
    }).addTo(map)
    markers.set(spot.id_spot, marker)
    marker.on('click', () => {
      selectSpot(spot)

      selectedSpotId.value = spot.id_spot
      if (activeMarker) {
        activeMarker.setIcon(defaultIcon)
      }

      marker.setIcon(activeIcon)
      activeMarker = marker
    })
  })
})

const toMinutes = (time) => {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}
const getSpotStatus = (spot) => {
  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  const openingMinutes = toMinutes(spot.abertura)
  const closingMinutes = toMinutes(spot.fecho)

  return currentMinutes >= openingMinutes &&
    currentMinutes <= closingMinutes
    ? 'open'
    : 'closed'
}

</script>

<template>
  <SectionMain class="min-h-screen bg-[#f5f0e6]">
    <Navbar />

    <div class="mb-4 flex items-center gap-4">
      <span class="text-sm text-gray-600">⚡Spot Map</span>

      <div class="flex gap-2">
        <button>
          My Reservations
        </button>
      </div>
    </div>

    <!-- MAP + SIDEBAR -->
    <div class="relative flex gap-4">

      <CardBox :class="[
        'overflow-hidden rounded-2xl transition-all duration-300',
        showSidebar ? 'flex-1' : 'w-full',
      ]">
        <div id="map" class="h-[500px] w-full"></div>
      </CardBox>

      <transition name="slide">

        <CardBox v-if="showSidebar && selectedSpot" class="w-80 flex-shrink-0 overflow-hidden rounded-2xl bg-white">

          <div class="flex justify-end p-2">
            <button class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
              @click="closeSidebar">
              <BaseIcon :path="mdiClose" size="18" class="text-gray-500" />
            </button>
          </div>

          <div class="space-y-3 p-4">

            <div class="flex items-start gap-3">
              <div class="flex h-8 w-8 items-center justify-center rounded-full bg-[#e8e0d0]">
                <BaseIcon :path="mdiMapMarkerRadius" size="16" class="text-gray-600" />
              </div>

              <div>
                <p class="text-sm font-medium text-gray-700">
                  {{ selectedSpot.localizacao }}
                </p>
                <p class="text-xs text-gray-500">
                  {{ selectedSpot.latitude }}, {{ selectedSpot.longitude }}
                </p>
              </div>
            </div>


            <div class="flex items-center gap-3">
              <div class="flex h-8 w-8 items-center justify-center rounded-full bg-[#e8e0d0]">
                <BaseIcon v-if="getSpotStatus(selectedSpot) === 'open'" :path="mdiClock" size="16"
                  class="text-green-600" />
                <BaseIcon v-else :path="mdiClock" size="16" class="text-red-400" />
              </div>
              <p class="text-sm text-gray-700">
                {{ getSpotStatus(selectedSpot) }}:
                {{ selectedSpot.abertura }} - {{ selectedSpot.fecho }}
              </p>
            </div>

          </div>

        </CardBox>
      </transition>
    </div>
    <br>
    <div>
      <ReservasList />
      <ReservationChart :selectedSpotId="selectedSpotId" />
    </div>

  </SectionMain />

</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
