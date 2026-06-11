<script setup>
import { ref, watch, onMounted, computed, reactive } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

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
const errorMsg = ref('')
const successMsg = ref('')

const form = reactive({ date: '', startTime: '', endTime: '' })

async function submitReservation() {
  errorMsg.value = ''
  successMsg.value = ''
if (!form.date || !form.startTime || !form.endTime) {
    errorMsg.value = 'Please fill in all fields.'
    return
  }
  try {
    const res = await fetch(
      `http://localhost:3000/api/reservas/${props.selectedSpotId}/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          data_evento: form.date,
          hora_inicio: form.startTime,
          hora_fim: form.endTime,
        }),
      }
    )

    const result = await res.json()

    if (!res.ok) {

      errorMsg.value =
        Object.values(result.details || {})
          .flat()
          .find(Boolean) ||
        result.message ||
        'Erro ao criar reserva.'

      return
    }

    successMsg.value = 'Reserva criada com sucesso!'
    form.startTime = ''
    form.endTime = ''
    getReservations()

  } catch (err) {
    errorMsg.value = 'Erro de ligação.'
  }
}

async function getReservations() {
  if (!form.date || !props.selectedSpotId) return
  const res = await fetch(
    `http://localhost:3000/api/reservas/spot/${props.selectedSpotId}/?date=${form.date}`,
    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
  )
  if (res.status === 204) {
    chartData.value = { labels: [''], datasets: [] }
    return
  }
  const result = await res.json()
  const reservations = result.data || []
  chartData.value = {
    labels: [''],
    datasets: [{
      label: '',
      data: reservations.map((r) => ({
        x: [toHours(r.hora_inicio), toHours(r.hora_fim)],
        y: '',
      })),
      backgroundColor: 'rgba(11, 32, 39, 0.75)',
      borderRadius: 6,
    }],
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

const chartData = ref({ labels: [''], datasets: [] })

onMounted(() => {
  form.date = new Date().toISOString().split('T')[0]
})

async function fetchSpotData() {
  if (!props.selectedSpotId) return
  const res = await fetch(`http://localhost:3000/api/spots/${props.selectedSpotId}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  })
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
      grid: { color: 'rgba(0,0,0,0.05)' },
      ticks: {
        stepSize: 1,
        callback: (value) => `${value}:00`,
        font: { family: 'Courier New', size: 11 },
        color: '#9a8f80',
      },
      border: { color: '#e2d9cc' }
    },
    y: {
      grid: { display: false },
      ticks: { display: false }
    }
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#0b2027',
      titleFont: { family: 'Georgia' },
      bodyFont: { family: 'Courier New' },
      callbacks: {
        displayColors: false,
        label: (context) => {
          const [start, end] = context.raw.x
          return ` ${formatHours(start)} — ${formatHours(end)}`
        },
      },
    },
  },
}))
</script>

<template>
  <div v-if="props.selectedSpotId" class="reservation-panel">

    <div class="panel-header">
      <span class="panel-label">Book this Spot</span>
    </div>

    <div class="panel-body">
      <!-- Form -->
      <div class="booking-form">
        <div class="field-row">
          <div class="field">
            <label>Date</label>
            <input type="date" v-model="form.date" />
          </div>
          <div class="field">
            <label>Start</label>
            <input type="time" v-model="form.startTime"  required/>
          </div>
          <div class="field">
            <label>End</label>
            <input type="time" v-model="form.endTime" required />
          </div>
        </div>

        <div v-if="errorMsg" class="feedback error">{{ errorMsg }}</div>
        <div v-if="successMsg" class="feedback success">{{ successMsg }}</div>

        <button class="btn-reserve" @click="submitReservation">
          Confirm Reservation
        </button>
      </div>

      <!-- Chart -->
      <div class="chart-area">
        <p class="chart-label">Occupied slots for selected day</p>
        <div class="chart-wrapper">
          <Bar :data="chartData" :options="chartOptions" />
        </div>
        <p v-if="!chartData.datasets.length" class="chart-empty">No reservations yet for this day.</p>
      </div>
    </div>

  </div>
</template>

<style scoped>
.reservation-panel {
  margin-top: 1.5rem;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #e2d9cc;
  background: #fff;
  box-shadow: 0 2px 16px rgba(11, 32, 39, 0.06);
  font-family: 'Georgia', serif;
}

.panel-header {
  background: #0b2027;
  padding: 0.75rem 1.25rem;
}

.panel-label {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #c8bfaf;
  font-family: 'Courier New', monospace;
}

.panel-body {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1.25rem;
}

.booking-form {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.field-row {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  flex: 1;
  min-width: 120px;
}

.field label {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: #9a8f80;
  font-family: 'Courier New', monospace;
}

.field input {
  padding: 0.5rem 0.7rem;
  border: 1px solid #e2d9cc;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #0b2027;
  background: #faf7f2;
  font-family: 'Georgia', serif;
  outline: none;
  transition: border-color 0.15s;
}

.field input:focus {
  border-color: #0b2027;
}

.btn-reserve {
  align-self: flex-start;
  padding: 0.55rem 1.25rem;
  background: #0b2027;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  font-family: 'Georgia', serif;
  cursor: pointer;
  transition: opacity 0.15s;
}

.btn-reserve:hover {
  opacity: 0.85;
}

.feedback {
  font-size: 0.8rem;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
}

.feedback.error {
  background: #fde8e8;
  color: #9b1c1c;
}

.feedback.success {
  background: #d4edda;
  color: #2d6a4f;
}

.chart-area {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.chart-label {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: #9a8f80;
  font-family: 'Courier New', monospace;
  margin: 0;
}

.chart-wrapper {
  height: 80px;
  width: 100%;
}

.chart-empty {
  font-size: 0.8rem;
  color: #c8bfaf;
  font-style: italic;
  margin: 0;
}
</style>
