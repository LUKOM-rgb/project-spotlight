<script setup>
import { ref } from 'vue'
import { onMounted } from 'vue'
import { mdiMapMarker, mdiClose, mdiMapMarkerRadius, mdiClock, mdiAccountMultiple } from '@mdi/js'
import SectionMain from '@/components/SectionMain.vue'
import CardBox from '@/components/CardBox.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseIcon from '@/components/BaseIcon.vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Dados dos spots no mapa
const spots = ref([
  {
    id: 1,
    name: 'Rua das Carmelitas 200',
    description: 'Ponto de performance junto à Livraria Lello',
    status: 'open',
    hours: '9am - 8pm',
    artistsToday: 3,
    position: { top: '25%', left: '60%' },
    images: [
      'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=400&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&auto=format&fit=crop&q=60',
    ],
  },
  {
    id: 2,
    name: 'Praça dos Leões',
    description: 'Espaço amplo para performances de rua',
    status: 'open',
    hours: '10am - 10pm',
    artistsToday: 5,
    position: { top: '45%', left: '35%' },
    images: [
      'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&auto=format&fit=crop&q=60',
    ],
  },
  {
    id: 3,
    name: 'Jardim da Cordoaria',
    description: 'Zona verde ideal para música acústica',
    status: 'closed',
    hours: '8am - 6pm',
    artistsToday: 0,
    position: { top: '70%', left: '55%' },
    images: [
      'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=400&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&auto=format&fit=crop&q=60',
    ],
  },
])

const selectedSpot = ref(null)
const showSidebar = ref(false)
const activeFilter = ref('all')

const filters = [
  { id: 'all', label: 'All' },
  { id: 'street', label: 'Street Music' },
]

const selectSpot = (spot) => {
  selectedSpot.value = spot
  showSidebar.value = true
}

const closeSidebar = () => {
  showSidebar.value = false
  selectedSpot.value = null
}

const reserveSpot = () => {
  if (selectedSpot.value) {
    alert(`Reserva iniciada para: ${selectedSpot.value.name}`)
    // Aqui implementarias a lógica de reserva
  }
}
// Mapa
onMounted(() => {
  const map = L.map('map').setView([41.1579, -8.6291], 13)

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap &copy; CARTO',
  }).addTo(map)
})
</script>

<template>
  <SectionMain class="min-h-screen bg-[#f5f0e6]">

    <div class="mb-4 flex items-center gap-4">
      <span class="text-sm text-gray-600">⚡ Spots</span>
      <div class="flex gap-2">
        <button v-for="filter in filters" :key="filter.id" :class="[
          'rounded-full px-4 py-1 text-sm transition-colors',
          activeFilter === filter.id
            ? 'bg-[#e8e0d0] text-gray-700'
            : 'bg-transparent text-gray-500 hover:bg-[#e8e0d0]/50',
        ]" @click="activeFilter = filter.id">
          {{ filter.label }}
        </button>
      </div>
    </div>

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
            <button
              class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200"
              @click="closeSidebar">
              <BaseIcon :path="mdiClose" class="text-gray-500" size="18" />
            </button>
          </div>

          <div class="space-y-3 px-4">
            <div v-for="(image, index) in selectedSpot.images" :key="index" class="h-32 rounded-xl bg-cover bg-center"
              :style="{ backgroundImage: `url('${image}')` }">
              <div v-if="index === 0" class="relative h-full">
                <div class="absolute top-4 right-4">
                  <div class="flex h-6 w-6 items-center justify-center rounded-full bg-red-500">
                    <BaseIcon :path="mdiMapMarker" class="text-white" size="14" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-3 p-4">
            <div class="flex items-start gap-3">
              <div class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#e8e0d0]">
                <BaseIcon :path="mdiMapMarkerRadius" class="text-gray-600" size="16" />
              </div>
              <div>
                <p class="text-sm font-medium text-gray-700">{{ selectedSpot.name }}</p>
                <p class="text-xs text-gray-500">{{ selectedSpot.description }}</p>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <div class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#e8e0d0]">
                <div :class="[
                  'h-3 w-3 rounded-full',
                  selectedSpot.status === 'open' ? 'bg-green-500' : 'bg-red-500',
                ]"></div>
              </div>
              <p class="text-sm text-gray-700">
                {{ selectedSpot.status === 'open' ? 'Open' : 'Closed' }}
              </p>
            </div>

            <div class="flex items-center gap-3">
              <div class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#e8e0d0]">
                <BaseIcon :path="mdiClock" class="text-gray-600" size="16" />
              </div>
              <p class="text-sm text-gray-700">{{ selectedSpot.hours }}</p>
            </div>

            <div class="flex items-center gap-3">
              <div class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#e8e0d0]">
                <BaseIcon :path="mdiAccountMultiple" class="text-gray-600" size="16" />
              </div>
              <p class="text-sm text-gray-700">
                {{ selectedSpot.artistsToday }} artists will play here
              </p>
            </div>
          </div>

          <div class="p-4 pt-0">
            <BaseButton label="Reserve" color=""
              class="w-full rounded-lg border-none bg-[#40798C] text-white hover:bg-[#0B2027]"
              :disabled="selectedSpot.status === 'closed'" @click="reserveSpot" />
          </div>
        </CardBox>
      </transition>
    </div>
  </SectionMain>
</template>

<style scoped>
/* Slide transition for sidebar */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

/* Pulse animation */
@keyframes ping {

  75%,
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

.animate-ping {
  animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
}
</style>
