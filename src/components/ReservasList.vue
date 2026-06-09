<template>
  <div class="mb-8 mt-4">
    <div class="mb-6 flex items-center justify-between">
      <h2 class="text-2xl font-light tracking-widest text-teal-600 dark:text-teal-400">RESERVAS</h2>
      <span class="rounded-full bg-teal-100 px-3 py-1 text-sm font-medium text-teal-800 dark:bg-teal-900/50 dark:text-teal-300">
        {{ reservations.length }} {{ reservations.length === 1 ? 'reserva' : 'reservas' }}
      </span>
    </div>

    <CardBox class="overflow-hidden border border-gray-200 bg-white shadow-xl rounded-2xl dark:border-slate-700 dark:bg-slate-800">

      <!-- Table Header -->
      <div class="hidden md:grid grid-cols-12 gap-2 bg-teal-600 p-4 text-sm font-bold text-white uppercase tracking-wider dark:bg-teal-700">
        <div class="col-span-2 pl-2">Spot</div>
        <div class="col-span-3">Data</div>
        <div class="col-span-2">Início</div>
        <div class="col-span-2">Fim</div>
        <div class="col-span-2">Estado</div>
        <div class="col-span-1 text-center">Ações</div>
      </div>

      <!-- Table Body -->
      <div class="divide-y divide-gray-100 dark:divide-slate-700/50">
        <div v-for="reservation in reservations" :key="reservation.id_reserva"
          class="grid grid-cols-1 md:grid-cols-12 gap-2 p-4 md:items-center hover:bg-gray-50 transition-colors dark:hover:bg-slate-700/50">

          <div class="md:col-span-2 md:pl-2 font-medium text-gray-800 dark:text-gray-200 flex justify-between md:block">
            <span class="md:hidden font-bold text-xs uppercase text-gray-400">Spot</span>
            Spot #{{ reservation.id_spot }}
          </div>

          <div class="md:col-span-3 text-sm text-gray-600 dark:text-gray-400 flex justify-between md:block">
            <span class="md:hidden font-bold text-xs uppercase text-gray-400">Data</span>
            {{ formatDate(reservation.data_evento) }}
          </div>

          <div class="md:col-span-2 text-sm text-gray-600 dark:text-gray-400 flex justify-between md:block">
            <span class="md:hidden font-bold text-xs uppercase text-gray-400">Início</span>
            {{ reservation.hora_inicio.slice(0, 5) }}
          </div>

          <div class="md:col-span-2 text-sm text-gray-600 dark:text-gray-400 flex justify-between md:block">
            <span class="md:hidden font-bold text-xs uppercase text-gray-400">Fim</span>
            {{ reservation.hora_fim.slice(0, 5) }}
          </div>

          <div class="md:col-span-2 flex justify-between md:block">
            <span class="md:hidden font-bold text-xs uppercase text-gray-400">Estado</span>
            <span v-if="new Date(`${reservation.data_evento}T${reservation.hora_fim}`) < new Date()"
              class="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
              Passada
            </span>
            <span v-else
              class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              Agendada
            </span>
          </div>

          <div class="md:col-span-1 flex justify-end md:justify-center gap-4 md:gap-2 mt-2 md:mt-0">
            <button @click="modalEditOpen = true" class="text-gray-400 hover:text-teal-600 transition-colors dark:hover:text-teal-400" title="Editar">
              <BaseIcon :path="mdiPencil" size="18" />
            </button>
            <button @click="modalDeleteOpen = true" class="text-gray-400 hover:text-red-600 transition-colors dark:hover:text-red-400" title="Apagar">
              <BaseIcon :path="mdiTrashCan" size="18" />
            </button>
          </div>
        </div>

        <div v-if="reservations.length === 0" class="p-8 text-center text-slate-400 dark:text-slate-500 text-sm">
          Nenhuma reserva encontrada de momento.
        </div>
      </div>
    </CardBox>

    <!-- Modals -->
    <div v-if="modalEditOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <CardBox class="w-full max-w-md bg-white p-6 shadow-2xl dark:bg-slate-800">
        <h3 class="mb-4 text-xl font-bold text-gray-800 dark:text-white">Editar Reserva</h3>
        <p class="mb-6 text-sm text-gray-500 dark:text-gray-400">Funcionalidade em desenvolvimento.</p>
        <div class="flex justify-end">
          <button @click="modalEditOpen = false" class="rounded bg-teal-600 px-4 py-2 text-white hover:bg-teal-700">Fechar</button>
        </div>
      </CardBox>
    </div>

    <div v-if="modalDeleteOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <CardBox class="w-full max-w-md bg-white p-6 shadow-2xl dark:bg-slate-800">
        <h3 class="mb-4 text-xl font-bold text-gray-800 dark:text-white">Apagar Reserva</h3>
        <p class="mb-6 text-sm text-gray-500 dark:text-gray-400">Funcionalidade em desenvolvimento.</p>
        <div class="flex justify-end">
          <button @click="modalDeleteOpen = false" class="rounded bg-rose-600 px-4 py-2 text-white hover:bg-rose-700">Fechar</button>
        </div>
      </CardBox>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import CardBox from '@/components/CardBox.vue'
import BaseIcon from '@/components/BaseIcon.vue'
import { mdiPencil, mdiTrashCan } from '@mdi/js'

const reservations = ref([])
const modalEditOpen = ref(false)
const modalDeleteOpen = ref(false)

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function getStatusClass(reservation) {
  const end = new Date(`${reservation.data_evento}T${reservation.hora_fim}`)
  return end < new Date() ? 'status-cancelled' : 'status-confirmed'
}

async function getReservations() {
  const res = await fetch('http://localhost:3000/api/reservas/artista/me', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  })

  if (res.status === 204) {
    reservations.value = []
    return
  }

  const data = await res.json()
  reservations.value = data.data
}

onMounted(() => {
  getReservations()
})
</script>


