<script setup>
import { ref } from 'vue'
import { Bar } from 'vue-chartjs'
import { watch, onMounted, computed, reactive } from 'vue'

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

const openTime = ref('')
const closeTime = ref('')

/* Reservation Form */
const form = reactive({
  date: '',
  startTime: '',
  endTime: ''
})

async function submitReservation() {
  try {
    const res = await fetch(
      `http://localhost:3000/api/spots/${props.selectedSpotId}/reservas`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: form.date,
          hora_inicio: form.startTime,
          hora_fim: form.endTime
        })
      }
    )

    const result = await res.json()

    console.log('Reservation created:', result)

    // Refresh chart after reservation
    getReservations()

  } catch (err) {
    console.error(err)
  }
}

async function getReservations() {
  if (!form.date || !props.selectedSpotId) return

  const res = await fetch(
    `http://localhost:3000/api/reservas/spot/${props.selectedSpotId}/?date=${form.date}`
  )

  // No reservations for this day
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
  [() => props.selectedSpotId, () => form.date],
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
  const today = new Date().toISOString().split('T')[0]
  form.date = today
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
  <div v-if="props.selectedSpotId" class="reservation-container">

    <!-- Reservation Form -->
    <form class="reservation-form" @submit.prevent="submitReservation">

      <div class="form-group">
        <label>Event Date</label>
        <input
          type="date"
          v-model="form.date"
          required
        />
      </div>

      <div class="form-group">
        <label>Start Time</label>
        <input
          type="time"
          v-model="form.startTime"
          required
        />
      </div>

      <div class="form-group">
        <label>End Time</label>
        <input
          type="time"
          v-model="form.endTime"
          required
        />
      </div>

      <button type="submit">
        Confirm Reservation
      </button>
    </form>

    <!-- Reservations Graph -->
    <div class="chart-section">
      <h3>Reservations for Selected Day</h3>

      <div class="chart-wrapper">
        <Bar :data="chartData" :options="chartOptions" />
      </div>
    </div>

  </div>
</template>

<style scoped>
.reservation-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
}

.reservation-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  border-radius: 12px;
  background: white;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.form-group {
  display: flex;
  flex-direction: column;
}

label {
  margin-bottom: 6px;
  font-weight: 600;
}

input {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
}

button {
  padding: 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

.chart-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.chart-wrapper {
  height: 150px;
  width: 100%;
}
</style>
