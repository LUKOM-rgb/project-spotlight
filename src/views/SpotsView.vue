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
    <div class="tabs">
      <button
        class="tab-btn"
        :class="{ active: selectedView === 'map' }"
        @click="selectedView = 'map'"
      >
        Spot Map
      </button>
      <button
        class="tab-btn"
        :class="{ active: selectedView === 'Reservations' }"
        @click="selectedView = 'Reservations'"
      >
        My Reservations
      </button>
    </div>

    <!-- Map view -->
    <div v-show="selectedView === 'map'">
      <SpotMap @spot-selected="selectedSpotId = $event" />
      <ReservationChart :selectedSpotId="selectedSpotId" />
    </div>

    <!-- Reservations view -->
    <div v-if="selectedView === 'Reservations'">
      <ReservasList />
    </div>

  </SectionMain>
</template>

<style scoped>
.tabs {
  display: flex;
  gap: 0.25rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #e2d9cc;
  padding-bottom: 0;
}

.tab-btn {
  padding: 0.6rem 1.25rem;
  font-size: 0.82rem;
  font-weight: 600;
  font-family: 'Courier New', monospace;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #9a8f80;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
}

.tab-btn:hover {
  color: #0b2027;
}

.tab-btn.active {
  color: #0b2027;
  border-bottom-color: #0b2027;
}
</style>
