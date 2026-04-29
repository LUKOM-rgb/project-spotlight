<script setup>
import { ref, computed } from 'vue'
import {
  mdiMapMarker,
  mdiCurrencyUsd,
  mdiChartBar,
  mdiEmail,
  mdiMusicNote,
  mdiAccountGroup,
  mdiLogout,
  mdiClose,
  mdiMapMarkerRadius,
  mdiClock,
  mdiAccountMultiple,
  mdiImage,
} from '@mdi/js'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import SectionMain from '@/components/SectionMain.vue'
import CardBox from '@/components/CardBox.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseIcon from '@/components/BaseIcon.vue'

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
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain class="min-h-screen bg-[#f5f0e6]">
      <!-- Navigation Bar -->
      <CardBox class="mb-6 rounded-full bg-[#2d3748] px-6 py-2">
        <nav class="flex items-center justify-between">
          <div class="flex items-center gap-6">
            <span class="rounded bg-gray-600 px-3 py-1 font-bold text-white">LOGO</span>
            <div class="flex items-center gap-4">
              <div
                v-for="(icon, index) in [
                  mdiCurrencyUsd,
                  mdiChartBar,
                  mdiEmail,
                  mdiMusicNote,
                  mdiAccountGroup,
                ]"
                :key="index"
                class="flex h-8 w-8 cursor-pointer items-center justify-center rounded bg-gray-700 transition-colors hover:bg-gray-600"
              >
                <BaseIcon :path="icon" class="text-gray-300" size="18" />
              </div>
            </div>
          </div>
          <div
            class="flex h-8 w-8 cursor-pointer items-center justify-center rounded bg-gray-700 transition-colors hover:bg-gray-600"
          >
            <BaseIcon :path="mdiLogout" class="text-gray-300" size="18" />
          </div>
        </nav>
      </CardBox>

      <!-- Filters -->
      <div class="mb-4 flex items-center gap-4">
        <span class="text-sm text-gray-600">⚡ Spots</span>
        <div class="flex gap-2">
          <button
            v-for="filter in filters"
            :key="filter.id"
            :class="[
              'rounded-full px-4 py-1 text-sm transition-colors',
              activeFilter === filter.id
                ? 'bg-[#e8e0d0] text-gray-700'
                : 'bg-transparent text-gray-500 hover:bg-[#e8e0d0]/50',
            ]"
            @click="activeFilter = filter.id"
          >
            {{ filter.label }}
          </button>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="relative flex gap-4">
        <!-- Map Container -->
        <CardBox
          :class="[
            'overflow-hidden rounded-2xl transition-all duration-300',
            showSidebar ? 'flex-1' : 'w-full',
          ]"
        >
          <div
            class="relative h-[500px] bg-cover bg-center"
            style="
              background-image: url('https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&auto=format&fit=crop&q=60');
            "
          >
            <!-- Map Markers -->
            <div
              v-for="spot in spots"
              :key="spot.id"
              :style="{ top: spot.position.top, left: spot.position.left }"
              :class="[
                'absolute -translate-x-1/2 -translate-y-1/2 transform cursor-pointer transition-transform hover:scale-110',
                selectedSpot?.id === spot.id ? 'z-10 scale-125' : '',
              ]"
              @click="selectSpot(spot)"
            >
              <div
                :class="[
                  'flex h-8 w-8 items-center justify-center rounded-full shadow-lg',
                  spot.status === 'open' ? 'bg-red-500' : 'bg-gray-500',
                ]"
              >
                <BaseIcon :path="mdiMapMarker" class="text-white" size="20" />
              </div>
              <!-- Pulse animation for selected -->
              <div
                v-if="selectedSpot?.id === spot.id"
                class="absolute inset-0 h-8 w-8 animate-ping rounded-full bg-red-500 opacity-30"
              ></div>
            </div>
          </div>
        </CardBox>

        <!-- Sidebar Panel -->
        <transition name="slide">
          <CardBox
            v-if="showSidebar && selectedSpot"
            class="w-80 flex-shrink-0 overflow-hidden rounded-2xl bg-white"
          >
            <!-- Close Button -->
            <div class="flex justify-end p-2">
              <button
                class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200"
                @click="closeSidebar"
              >
                <BaseIcon :path="mdiClose" class="text-gray-500" size="18" />
              </button>
            </div>

            <!-- Spot Images -->
            <div class="space-y-3 px-4">
              <div
                v-for="(image, index) in selectedSpot.images"
                :key="index"
                class="h-32 rounded-xl bg-cover bg-center"
                :style="{ backgroundImage: `url('${image}')` }"
              >
                <!-- Red marker overlay on first image -->
                <div v-if="index === 0" class="relative h-full">
                  <div class="absolute top-4 right-4">
                    <div class="flex h-6 w-6 items-center justify-center rounded-full bg-red-500">
                      <BaseIcon :path="mdiMapMarker" class="text-white" size="14" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Spot Details -->
            <div class="space-y-3 p-4">
              <!-- Location -->
              <div class="flex items-start gap-3">
                <div
                  class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#e8e0d0]"
                >
                  <BaseIcon :path="mdiMapMarkerRadius" class="text-gray-600" size="16" />
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-700">{{ selectedSpot.name }}</p>
                  <p class="text-xs text-gray-500">{{ selectedSpot.description }}</p>
                </div>
              </div>

              <!-- Status -->
              <div class="flex items-center gap-3">
                <div
                  class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#e8e0d0]"
                >
                  <div
                    :class="[
                      'h-3 w-3 rounded-full',
                      selectedSpot.status === 'open' ? 'bg-green-500' : 'bg-red-500',
                    ]"
                  ></div>
                </div>
                <p class="text-sm text-gray-700">
                  {{ selectedSpot.status === 'open' ? 'Open' : 'Closed' }}
                </p>
              </div>

              <!-- Hours -->
              <div class="flex items-center gap-3">
                <div
                  class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#e8e0d0]"
                >
                  <BaseIcon :path="mdiClock" class="text-gray-600" size="16" />
                </div>
                <p class="text-sm text-gray-700">{{ selectedSpot.hours }}</p>
              </div>

              <!-- Artists Today -->
              <div class="flex items-center gap-3">
                <div
                  class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#e8e0d0]"
                >
                  <BaseIcon :path="mdiAccountMultiple" class="text-gray-600" size="16" />
                </div>
                <p class="text-sm text-gray-700">
                  {{ selectedSpot.artistsToday }} artists will play here
                </p>
              </div>
            </div>

            <!-- Reserve Button -->
            <div class="p-4 pt-0">
              <BaseButton
                label="Reserve"
                color="info"
                class="w-full rounded-lg border-none bg-[#5b9a8b] hover:bg-[#4a8a7b]"
                :disabled="selectedSpot.status === 'closed'"
                @click="reserveSpot"
              />
            </div>
          </CardBox>
        </transition>
      </div>
    </SectionMain>
  </LayoutAuthenticated>
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
