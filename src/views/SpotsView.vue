<script setup>
import { ref } from 'vue'
import ReservationChart from '@/components/ReservationChart.vue'
import ReservasList from '@/components/ReservasList.vue'
import Navbar from '@/components/NavBar.vue'
import SectionMain from '@/components/SectionMain.vue'
import SpotMap from '@/components/SpotMap.vue'

const selectedView = ref('map')
const selectedSpotId = ref(null)
</script>

<template>
  <SectionMain class="min-h-screen bg-[#f5f0e6] transition-colors dark:bg-slate-900">
    <Navbar />

    <!-- Tab bar -->
    <div class="mb-6 flex gap-1 border-b border-gray-200 dark:border-slate-700">
      <button
        class="px-5 py-2.5 text-sm font-semibold tracking-wide transition-colors border-b-2 -mb-px"
        :class="selectedView === 'map'
          ? 'border-teal-500 text-teal-600 dark:text-teal-400 dark:border-teal-400'
          : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'"
        @click="selectedView = 'map'"
      >
        Spot Map
      </button>
      <button
        class="px-5 py-2.5 text-sm font-semibold tracking-wide transition-colors border-b-2 -mb-px"
        :class="selectedView === 'Reservations'
          ? 'border-teal-500 text-teal-600 dark:text-teal-400 dark:border-teal-400'
          : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'"
        @click="selectedView = 'Reservations'"
      >
        My Reservations
      </button>
    </div>

    <div v-show="selectedView === 'map'">
      <SpotMap @spot-selected="selectedSpotId = $event" />
      <ReservationChart :selectedSpotId="selectedSpotId" />
    </div>

    <div v-if="selectedView === 'Reservations'">
      <ReservasList />
    </div>

  </SectionMain>
</template>
