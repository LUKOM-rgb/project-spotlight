<script setup>
import { ref } from 'vue'
import { Bar } from 'vue-chartjs'
import { watch, onMounted, computed } from 'vue'

import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
)
const props = defineProps({
  selectedSpotId: Number
})
const toHours = (time) => {
  const [h, m] = time.split(':').map(Number)
  return h + m / 60
}
const formatHours = (value) => {
  const h = Math.floor(value)
  const m = Math.round((value - h) * 60)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}
const selectedDate = ref('')
const openTime = ref('')
const closeTime = ref('')
console.log('selected spot id in chart', props.selectedSpotId)
async function getReservations() {
  if (!selectedDate.value || !props.selectedSpotId) return

  const res = await fetch(
    `http://localhost:3000/api/reservas/spot/${props.selectedSpotId}/?date=${selectedDate.value}`
  )
  // Nao tem reservas nesse dia, e da erro do json
  if (res.status === 204) {
    chartData.value = {
      labels: [''],
      datasets: [],
    }
    return
  }
  const result = await res.json()
  const reservations = result.data || []

  chartData.value = {
    labels: [''],
    datasets: [
      {
        label: '',
        data: reservations.map((r) => ({
          x: [toHours(r.hora_inicio), toHours(r.hora_fim)],
          y: '',
        })),
        backgroundColor: 'rgba(64, 121, 140, 0.7)',
        borderRadius: 4,
      },
    ],
  }
}
watch(
  [() => props.selectedSpotId, selectedDate],
  ([id, date]) => {
    if (!id || !date) return
    fetchSpotData()
    getReservations()
  },
  { immediate: true }
)
const chartData = ref({
  labels: [''],
  datasets: [],
})
onMounted(() => {
  selectedDate.value = new Date().toISOString().split('T')[0]
})
async function fetchSpotData() {
  if (!props.selectedSpotId) return
  const res = await fetch(
    `http://localhost:3000/api/spots/${props.selectedSpotId}`
  )
  const spot = await res.json()
  openTime.value = toHours(spot.data.abertura)
  closeTime.value = toHours(spot.data.fecho)
}

const chartOptions = computed(() => ({
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,

  scales: {
    x: {
      min: openTime.value - 1 ?? 0,
      max: closeTime.value + 1 ?? 24,

      ticks: {
        stepSize: 1,
        callback: (value) => `${value}:00`,
      },
    },
  },

  plugins: {
    tooltip: {
      callbacks: {
        displayColors: false,
        label: (context) => {
          const [start, end] = context.raw.x
          return ` ${formatHours(start)} - ${formatHours(end)}`
        },
      },
    },
  },
}))
</script>

<template>
  <div v-if="props.selectedSpotId">
    <div>
      <input type="date" v-model="selectedDate" />
    </div>
    <div class="chart-wrapper">
      <Bar :data="chartData" :options="chartOptions" />
    </div>
  </div>

</template>
<style scoped>
.chart-wrapper {
  height: 150px;

  width: 100%;
}
</style>
