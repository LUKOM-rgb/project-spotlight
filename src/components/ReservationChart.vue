<script setup>
import { ref, watch, onMounted, computed, reactive } from 'vue'
import { Bar } from 'vue-chartjs'
import CardBox from '@/components/CardBox.vue'
import {
  Chart as ChartJS, Title, Tooltip, Legend,
  BarElement, CategoryScale, LinearScale
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const props = defineProps({ selectedSpotId: Number })

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
    errorMsg.value = 'Por favor preenche todos os campos.'
    return
  }

  try {
    const res = await fetch(`/api/reservas/${props.selectedSpotId}/`, {
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
    })

    const result = await res.json()
    console.log(result)
    if (!res.ok) {
      errorMsg.value =
        Object.values(result.details || {}).flat().find(Boolean) ||
        result.message ||
        'Erro ao criar reserva.'
      return
    }

    successMsg.value = 'Reserva criada com sucesso!'
    form.startTime = ''
    form.endTime = ''
    getReservations()

  } catch {
    errorMsg.value = 'Erro de ligação.'
  }
}

async function getReservations() {
  if (!form.date || !props.selectedSpotId) return
  const res = await fetch(
    `/api/reservas/spot/${props.selectedSpotId}/?date=${form.date}`,
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
      backgroundColor: 'rgba(64, 121, 140, 0.75)',
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
  const res = await fetch(`/api/spots/${props.selectedSpotId}`, {
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
      min: typeof openTime.value === 'number' ? openTime.value - 1 : 0,
      max: typeof closeTime.value === 'number' ? closeTime.value + 1 : 24,
      grid: { color: 'rgba(0,0,0,0.05)' },
      ticks: {
        stepSize: 1,
        callback: (value) => `${value}:00`,
        color: '#6b7280',
        font: { size: 11 }
      },
      border: { color: '#e5e7eb' }
    },
    y: { grid: { display: false }, ticks: { display: false } }
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#0b2027',
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
  <div v-if="props.selectedSpotId" class="mt-6">
    <CardBox class="shadow-xl dark:bg-slate-800">

      <h2 class="mb-6 text-xl font-light tracking-widest text-teal-600 dark:text-teal-400">RESERVAR SPOT</h2>

      <!-- Form -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-4">
        <div>
          <label class="mb-1 block text-sm font-semibold text-gray-600 dark:text-gray-300">Data do Evento</label>
          <input
            type="date"
            v-model="form.date"
            class="w-full rounded border border-gray-300 p-2 text-sm focus:border-teal-500 focus:ring focus:ring-teal-500/30 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-semibold text-gray-600 dark:text-gray-300">Hora de Início</label>
          <input
            type="time"
            v-model="form.startTime"
            required
            class="w-full rounded border border-gray-300 p-2 text-sm focus:border-teal-500 focus:ring focus:ring-teal-500/30 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-semibold text-gray-600 dark:text-gray-300">Hora de Fim</label>
          <input
            type="time"
            v-model="form.endTime"
            required
            class="w-full rounded border border-gray-300 p-2 text-sm focus:border-teal-500 focus:ring focus:ring-teal-500/30 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
          />
        </div>
      </div>

      <!-- Feedback -->
      <div v-if="errorMsg" class="mb-4 rounded bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-600 dark:text-red-400">
        {{ errorMsg }}
      </div>
      <div v-if="successMsg" class="mb-4 rounded bg-teal-500/10 border border-teal-500/20 p-3 text-sm text-teal-600 dark:text-teal-400">
        {{ successMsg }}
      </div>

      <button
        @click="submitReservation"
        class="mb-6 rounded bg-teal-600 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-700"
      >
        Confirmar Reserva
      </button>

      <!-- Chart -->
      <div>
        <p class="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          Ocupação do dia selecionado
        </p>
        <div class="h-20 w-full">
          <Bar :data="chartData" :options="chartOptions" />
        </div>
        <p v-if="!chartData.datasets.length" class="mt-2 text-xs italic text-gray-400 dark:text-gray-500">
          Sem reservas para este dia.
        </p>
      </div>

    </CardBox>
  </div>
</template>
