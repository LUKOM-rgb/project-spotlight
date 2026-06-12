<template>
  <div class="mt-4">
    <div class="mb-6 flex items-center justify-between">

      <span
        class="rounded-full bg-teal-100 px-3 py-1 text-sm font-medium text-teal-800 dark:bg-teal-900/50 dark:text-teal-300">
        {{ reservations.length }} {{ reservations.length === 1 ? 'reserva' : 'reservas' }}
      </span>
    </div>

    <CardBox class="overflow-hidden shadow-xl dark:bg-slate-800">

      <!-- Header -->
      <div
        class="hidden md:grid grid-cols-12 gap-2 bg-[#40798C] p-4 text-xs font-bold uppercase tracking-wider text-white dark:bg-teal-700">
        <div class="col-span-2 pl-2">Spot</div>
        <div class="col-span-3">Data</div>
        <div class="col-span-2">Início</div>
        <div class="col-span-2">Fim</div>
        <div class="col-span-2">Estado</div>
        <div class="col-span-1 text-center" v-if="$route.path.startsWith('/Spots')">Ações</div>
      </div>

      <!-- Rows -->
      <div class="divide-y divide-gray-100 dark:divide-slate-700/50">
        <div v-for="reservation in reservations" :key="reservation.id_reserva"
          class="grid grid-cols-1 md:grid-cols-12 gap-2 p-4 md:items-center transition-colors hover:bg-gray-50 dark:hover:bg-slate-700/30">
          <div class="md:col-span-2 md:pl-2 font-medium text-gray-800 dark:text-gray-200 flex justify-between md:block">
            <span class="md:hidden text-xs font-bold uppercase text-gray-400">Spot</span>
            Spot {{ reservation.id_spot }}{{ reservation.spot_local ? `- ${reservation.spot_local}` : '' }}
          </div>

          <div class="md:col-span-3 text-sm text-gray-600 dark:text-gray-400 flex justify-between md:block">
            <span class="md:hidden text-xs font-bold uppercase text-gray-400">Data</span>
            {{ formatDate(reservation.data_evento) }}
          </div>

          <div class="md:col-span-2 text-sm text-gray-600 dark:text-gray-400 flex justify-between md:block">
            <span class="md:hidden text-xs font-bold uppercase text-gray-400">Início</span>
            {{ reservation.hora_inicio.slice(0, 5) }}
          </div>

          <div class="md:col-span-2 text-sm text-gray-600 dark:text-gray-400 flex justify-between md:block">
            <span class="md:hidden text-xs font-bold uppercase text-gray-400">Fim</span>
            {{ reservation.hora_fim.slice(0, 5) }}
          </div>

          <div class="md:col-span-2 flex justify-between md:block">
            <span class="md:hidden text-xs font-bold uppercase text-gray-400">Estado</span>
            <span v-if="new Date(`${reservation.data_evento}T${reservation.hora_fim}`) < new Date()"
              class="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
              Passada
            </span>
            <span v-else
              class="rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
              Agendada
            </span>
          </div>

          <div class="md:col-span-1 flex justify-end md:justify-center gap-3 mt-2 md:mt-0"  v-if="$route.path.startsWith('/Spots')">
            <button @click="openEdit(reservation)"
              class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-teal-100 hover:text-teal-600 transition-colors dark:bg-slate-700 dark:text-gray-400 dark:hover:bg-teal-900/40 dark:hover:text-teal-400"
              title="Editar">
              <BaseIcon :path="mdiPencil" size="16" />
            </button>
            <button @click="openDelete(reservation)"
              class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-600 transition-colors dark:bg-slate-700 dark:text-gray-400 dark:hover:bg-red-900/40 dark:hover:text-red-400"
              title="Apagar">
              <BaseIcon :path="mdiTrashCan" size="16" />
            </button>
          </div>
        </div>

        <div v-if="reservations.length === 0" class="p-8 text-center text-sm italic text-gray-400 dark:text-slate-500">
          Nenhuma reserva encontrada de momento.
        </div>
      </div>
    </CardBox>

    <!-- Edit Modal -->
    <Teleport to="body">
      <div v-if="editModal.open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="editModal.open = false">
        <CardBox class="w-full max-w-md bg-white shadow-2xl dark:bg-slate-800">
          <h3 class="mb-4 text-xl font-light tracking-widest text-teal-600 dark:text-teal-400">EDITAR RESERVA</h3>

          <div v-if="editError"
            class="mb-4 rounded bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-600 dark:text-red-400">
            {{ editError }}
          </div>

          <div class="mb-4">
            <label class="mb-1 block text-sm font-semibold text-gray-600 dark:text-gray-300">Data</label>
            <input type="date" v-model="editForm.data_evento"
              class="w-full rounded border border-gray-300 p-2 text-sm focus:border-teal-500 focus:ring focus:ring-teal-500/30 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
          </div>

          <div class="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label class="mb-1 block text-sm font-semibold text-gray-600 dark:text-gray-300">Início</label>
              <input type="time" v-model="editForm.hora_inicio"
                class="w-full rounded border border-gray-300 p-2 text-sm focus:border-teal-500 focus:ring focus:ring-teal-500/30 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
            </div>
            <div>
              <label class="mb-1 block text-sm font-semibold text-gray-600 dark:text-gray-300">Fim</label>
              <input type="time" v-model="editForm.hora_fim"
                class="w-full rounded border border-gray-300 p-2 text-sm focus:border-teal-500 focus:ring focus:ring-teal-500/30 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
            </div>
          </div>

          <div class="flex justify-end gap-3">
            <button @click="editModal.open = false"
              class="rounded border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:border-slate-600 dark:text-gray-400 dark:hover:bg-slate-700">
              Cancelar
            </button>
            <button @click="confirmEdit"
              class="rounded bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700">
              Guardar
            </button>
          </div>
        </CardBox>
      </div>
    </Teleport>

    <!-- Delete Modal -->
    <Teleport to="body">
      <div v-if="deleteModal.open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="deleteModal.open = false">
        <CardBox class="w-full max-w-sm bg-white shadow-2xl dark:bg-slate-800">
          <h3 class="mb-4 text-xl font-light tracking-widest text-teal-600 dark:text-teal-400">APAGAR RESERVA</h3>
          <p class="mb-4 text-sm text-gray-500 dark:text-gray-400">
            Tens a certeza que queres apagar a reserva do
            <strong class="text-gray-700 dark:text-gray-200">Spot {{ deleteModal.reservation?.id_spot }}</strong>
            em <strong class="text-gray-700 dark:text-gray-200">{{ formatDate(deleteModal.reservation?.data_evento)
            }}</strong>?
            Esta ação não pode ser desfeita.
          </p>

          <div v-if="deleteError"
            class="mb-4 rounded bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-600 dark:text-red-400">
            {{ deleteError }}
          </div>

          <div class="flex justify-end gap-3">
            <button @click="deleteModal.open = false"
              class="rounded border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:border-slate-600 dark:text-gray-400 dark:hover:bg-slate-700">
              Cancelar
            </button>
            <button @click="confirmDelete"
              class="rounded bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600">
              Apagar
            </button>
          </div>
        </CardBox>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CardBox from '@/components/CardBox.vue'
import BaseIcon from '@/components/BaseIcon.vue'
import { mdiPencil, mdiTrashCan } from '@mdi/js'

const editModal = ref({ open: false, reservation: null })
const deleteModal = ref({ open: false, reservation: null })
const editForm = ref({ data_evento: '', hora_inicio: '', hora_fim: '' })
const editError = ref('')
const deleteError = ref('')
const emit = defineEmits(['updated'])

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function openEdit(reservation) {
  editError.value = ''
  editModal.value.reservation = reservation
  editForm.value = {
    data_evento: reservation.data_evento,
    hora_inicio: reservation.hora_inicio.slice(0, 5),
    hora_fim: reservation.hora_fim.slice(0, 5),
  }
  editModal.value.open = true
}

function openDelete(reservation) {
  deleteError.value = ''
  deleteModal.value.reservation = reservation
  deleteModal.value.open = true
}

async function confirmEdit() {
  editError.value = ''
  const id = editModal.value.reservation.id_reserva
  const res = await fetch(`http://localhost:3000/api/reservas/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(editForm.value),
  })
  if (!res.ok) {
    const result = await res.json()
    editError.value =
      typeof result.details === 'string'
        ? result.details
        : Object.values(result.details || {}).flat().find(Boolean) ||
        result.message ||
        'Erro ao atualizar.'
    return
  }
  editModal.value.open = false
  emit('updated')
}

async function confirmDelete() {
  deleteError.value = ''
  const id = deleteModal.value.reservation.id_reserva
  try {
    const res = await fetch(`http://localhost:3000/api/reservas/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
    if (!res.ok) {
      const result = await res.json()
      deleteError.value =
        Object.values(result.details || {}).flat().find(Boolean) ||
        result.message ||
        'Erro ao apagar reserva.'
      return
    }
    deleteModal.value.open = false
    emit('updated')
  } catch (error) {
    deleteError.value = 'Erro de ligação.'
  }
}
const props = defineProps({
  reservations: {
    type: Array,
    default: () => [],
  },
})

</script>
