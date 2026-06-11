<template>
  <div class="mb-8 mt-4">
    <div class="mb-6 flex items-center justify-between">
      <h2 class="list-title">Reservations</h2>
      <span class="list-count">{{ reservations.length }} {{ reservations.length === 1 ? 'reserva' : 'reservas' }}</span>
    </div>

    <CardBox
      class="overflow-hidden border border-gray-200 bg-white shadow-xl rounded-2xl dark:border-slate-700 dark:bg-slate-800">

      <div
        class="hidden md:grid grid-cols-12 gap-2 bg-[#0b2027] p-4 text-xs font-semibold text-[#c8bfaf] uppercase tracking-widest"
        style="font-family: 'Courier New', monospace">
        <div class="col-span-2 pl-2">Spot</div>
        <div class="col-span-3">Data</div>
        <div class="col-span-2">Início</div>
        <div class="col-span-2">Fim</div>
        <div class="col-span-2">Estado</div>
        <div class="col-span-1 text-center">Ações</div>
      </div>

      <div class="divide-y divide-gray-100 dark:divide-slate-700/50">
        <div v-for="reservation in reservations" :key="reservation.id_reserva"
          class="grid grid-cols-1 md:grid-cols-12 gap-2 p-4 md:items-center transition-colors"
          style="font-family: 'Georgia', serif">
          <div
            class="md:col-span-2 md:pl-2 font-medium text-[#0b2027] dark:text-gray-200 flex justify-between md:block">
            <span class="md:hidden field-label">Spot</span>
            <span class="flex items-center gap-2">
              <span class="spot-dot"></span>
              {{ reservation.id_spot }}
            </span>
          </div>

          <div class="md:col-span-3 text-sm text-[#5a4e42] dark:text-gray-400 flex justify-between md:block">
            <span class="md:hidden field-label">Data</span>
            {{ formatDate(reservation.data_evento) }}
          </div>

          <div class="md:col-span-2 text-sm flex justify-between md:block"
            style="font-family: 'Courier New', monospace; color: #6b5f52">
            <span class="md:hidden field-label">Início</span>
            {{ reservation.hora_inicio.slice(0, 5) }}
          </div>

          <div class="md:col-span-2 text-sm flex justify-between md:block"
            style="font-family: 'Courier New', monospace; color: #6b5f52">
            <span class="md:hidden field-label">Fim</span>
            {{ reservation.hora_fim.slice(0, 5) }}
          </div>

          <div class="md:col-span-2 flex justify-between md:block">
            <span class="md:hidden field-label">Estado</span>
            <span class="status-badge"
              :class="new Date(`${reservation.data_evento}T${reservation.hora_fim}`) < new Date() ? 'status-past' : 'status-upcoming'">
              {{ new Date(`${reservation.data_evento}T${reservation.hora_fim}`) < new Date() ? 'Passada' : 'Agendada' }}
                </span>
          </div>

          <div class="md:col-span-1 flex justify-end md:justify-center gap-3 mt-2 md:mt-0">
            <button @click="openEdit(reservation)" class="action-btn edit-btn" title="Editar">
              <BaseIcon :path="mdiPencil" size="16" />
            </button>
            <button @click="openDelete(reservation)" class="action-btn delete-btn" title="Apagar">
              <BaseIcon :path="mdiTrashCan" size="16" />
            </button>
          </div>
        </div>

        <div v-if="reservations.length === 0" class="p-10 text-center text-[#9a8f80] text-sm italic"
          style="font-family: 'Georgia', serif">
          Nenhuma reserva encontrada de momento.
        </div>
      </div>
    </CardBox>

    <!-- Edit Modal -->
    <Teleport to="body">
      <div v-if="editModal.open" class="modal-overlay" @click.self="editModal.open = false">
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title">Editar Reserva</h3>
            <button class="modal-close" @click="editModal.open = false">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Data</label>
              <input type="date" v-model="editForm.data_evento" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Início</label>
                <input type="time" v-model="editForm.hora_inicio" />
              </div>
              <div class="form-group">
                <label>Fim</label>
                <input type="time" v-model="editForm.hora_fim" />
              </div>
            </div>
            <div v-if="editError" class="feedback error">{{ editError }}</div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" @click="editModal.open = false">Cancelar</button>
            <button class="btn-confirm" @click="confirmEdit">Guardar</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Delete Modal -->
    <Teleport to="body">
      <div v-if="deleteModal.open" class="modal-overlay" @click.self="deleteModal.open = false">
        <div class="modal modal-sm">
          <div class="modal-header">
            <h3 class="modal-title">Apagar Reserva</h3>
            <button class="modal-close" @click="deleteModal.open = false">✕</button>
          </div>
          <div class="modal-body">
            <p class="delete-message">
              Tens a certeza que queres apagar a reserva do
              <strong>Spot {{ deleteModal.reservation?.id_spot }}</strong>
              em <strong>{{ formatDate(deleteModal.reservation?.data_evento) }}</strong>?
              Esta ação não pode ser desfeita.
            </p>

            <div v-if="deleteError" class="feedback error">
              {{ deleteError }}
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" @click="deleteModal.open = false">Cancelar</button>
            <button class="btn-danger" @click="confirmDelete">Apagar</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import CardBox from '@/components/CardBox.vue'
import BaseIcon from '@/components/BaseIcon.vue'
import { mdiPencil, mdiTrashCan } from '@mdi/js'

const reservations = ref([])
const editModal = ref({ open: false, reservation: null })
const deleteModal = ref({ open: false, reservation: null })
const editForm = ref({ data_evento: '', hora_inicio: '', hora_fim: '' })
const editError = ref('')
const deleteError = ref('')
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
        : Object.values(result.details || {})
          .flat()
          .find(Boolean) ||
        result.message ||
        'Erro ao atualizar.'

    return
  }
  editModal.value.open = false
  await getReservations()
}

async function confirmDelete() {
  deleteError.value = ''
  const id = deleteModal.value.reservation.id_reserva
  try {
    const res = await fetch(
      `http://localhost:3000/api/reservas/${id}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    )
    if (!res.ok) {
      const result = await res.json()
      console.log('DELETE ERROR:', result)
      deleteError.value =
        Object.values(result.details || {})
          .flat()
          .find(Boolean) ||
        result.message ||
        'Erro ao apagar reserva.'
      return
    }
    deleteModal.value.open = false
    await getReservations()
  } catch (error) {
    console.error('Error deleting reservation:', error)
    deleteError.value = 'Erro de ligação.'
  }
}

async function getReservations() {
  const res = await fetch('http://localhost:3000/api/reservas/artista/me', {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  })
  if (res.status === 204) { reservations.value = []; return }
  const data = await res.json()
  reservations.value = data.data
}

onMounted(() => { getReservations() })
</script>

<style scoped>
.list-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #0b2027;
  letter-spacing: -0.02em;
  margin: 0;
  font-family: 'Georgia', serif;
}

.list-count {
  font-size: 0.78rem;
  color: #9a8f80;
  font-family: 'Courier New', monospace;
  background: #f0ebe2;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
}

.field-label {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #c8bfaf;
  font-family: 'Courier New', monospace;
}

.spot-dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #0b2027;
  flex-shrink: 0;
}

.status-badge {
  display: inline-block;
  padding: 0.22rem 0.65rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  font-family: 'Courier New', monospace;
}

.status-upcoming {
  background: #d4edda;
  color: #2d6a4f;
}

.status-past {
  background: #fde8e8;
  color: #9b1c1c;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.edit-btn {
  background: #e8e0d0;
  color: #0b2027;
}

.edit-btn:hover {
  background: #d4c9b5;
}

.delete-btn {
  background: transparent;
  color: #b85050;
  border: 1px solid #e8c8c8;
}

.delete-btn:hover {
  background: #fde8e8;
}

/* Modals */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(11, 32, 39, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(2px);
  animation: fadeIn 0.15s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.modal {
  background: #fff;
  border-radius: 16px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 20px 60px rgba(11, 32, 39, 0.18);
  animation: slideUp 0.2s ease;
  font-family: 'Georgia', serif;
}

.modal-sm {
  max-width: 360px;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem 0;
}

.modal-title {
  font-size: 1rem;
  font-weight: 600;
  color: #0b2027;
  margin: 0;
}

.modal-close {
  background: #f0ebe2;
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  cursor: pointer;
  font-size: 0.75rem;
  color: #6b5f52;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}

.modal-close:hover {
  background: #e2d9cc;
}

.modal-body {
  padding: 1.25rem 1.5rem;
}

.delete-message {
  font-size: 0.875rem;
  color: #5a4e42;
  line-height: 1.6;
  margin: 0;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 1rem;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-row .form-group {
  flex: 1;
}

.form-group label {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #9a8f80;
  font-family: 'Courier New', monospace;
}

.form-group input {
  padding: 0.55rem 0.75rem;
  border: 1px solid #e2d9cc;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #0b2027;
  font-family: 'Georgia', serif;
  outline: none;
  transition: border-color 0.15s;
  background: #faf7f2;
}

.form-group input:focus {
  border-color: #0b2027;
}

.feedback {
  font-size: 0.8rem;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  margin-top: 0.5rem;
}

.feedback.error {
  background: #fde8e8;
  color: #9b1c1c;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  padding: 0 1.5rem 1.25rem;
}

.btn-cancel {
  padding: 0.5rem 1.1rem;
  font-size: 0.8rem;
  font-weight: 600;
  border-radius: 8px;
  border: 1px solid #e2d9cc;
  background: transparent;
  color: #6b5f52;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
}

.btn-cancel:hover {
  background: #f5f0e6;
}

.btn-confirm {
  padding: 0.5rem 1.1rem;
  font-size: 0.8rem;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  background: #0b2027;
  color: #fff;
  cursor: pointer;
  font-family: inherit;
  transition: opacity 0.15s;
}

.btn-confirm:hover {
  opacity: 0.85;
}

.btn-danger {
  padding: 0.5rem 1.1rem;
  font-size: 0.8rem;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  background: #b85050;
  color: #fff;
  cursor: pointer;
  font-family: inherit;
  transition: opacity 0.15s;
}

.btn-danger:hover {
  opacity: 0.85;
}
</style>
