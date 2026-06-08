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
import SpotMap from '@/components/SpotMap.vue'
const selectedView = ref('map')
const selectedSpotId = ref(null)
</script>

<template>
  <SectionMain class="min-h-screen bg-[#f5f0e6] transition-colors dark:bg-slate-900">
    <Navbar />

    <div class="mb-4 flex items-center gap-4">

      <div class="flex gap-2">
        <base-button class="text-sm text-gray-600 dark:text-gray-300 dark:hover:text-teal-400" @click="selectedView='map'" label="Spot Map"></base-button>
        <base-button class="text-sm text-gray-600 dark:text-gray-300 dark:hover:text-teal-400" @click="selectedView='Reservations'" label="My Reservations"></base-button>
      </div>
    </div>

    <div v-show="selectedView=='map'" class="relative h-[400px]">
      <SpotMap @spot-selected="selectedSpotId = $event" />
      <ReservationChart  :selectedSpotId="selectedSpotId" />
    </div>
    <br>
    <div>
      <ReservasList v-if="selectedView=='Reservations'" />
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
button:hover{
  color: #333;
  text-decoration-style: bold;
}
</style>
