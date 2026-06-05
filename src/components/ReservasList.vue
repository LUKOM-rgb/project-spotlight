<template>
  <div class="reservations-wrapper">
    <div class="table-header">
      <h2 class="table-title">My Reservations</h2>
      <span class="table-count">{{ reservations.length }} bookings</span>
    </div>

    <div class="table-container">
      <table class="reservations-table">
        <thead>
          <tr>
            <th>Spot</th>
            <th>Date</th>
            <th>Start</th>
            <th>End</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(reservation, index) in reservations" :key="reservation.id_reserva" class="table-row"
            :style="{ animationDelay: `${index * 60}ms` }">
            <td class="spot-cell">
              {{ reservation.id_spot }}
            </td>
            <td class="date-cell">{{ formatDate(reservation.data_evento) }}</td>
            <td class="time-cell">{{ reservation.hora_inicio }}</td>
            <td class="time-cell">{{ reservation.hora_fim }}</td>
            <td>
              <span class="status-badge" :class="getStatusClass(reservation)">
                {{ new Date(`${reservation.data_evento}T${reservation.hora_fim}`) < new Date() ? 'Past' : 'Upcoming' }}
                  </span>
            </td>
            <td class="actions-cell">
              <button class="btn-edit" @click="modalEditOpen = true">Edit</button>
              <button class="btn-delete" @click="modalDeleteOpen = true">Delete</button>
            </td>
          </tr>
          <tr v-if="reservations.length === 0">
            <td colspan="6" class="empty-state">No reservations found.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <div>
    <div v-if="modalEditOpen" class="modal">
      <div class="modal-content">
        <h3>Edit Reservation</h3>
        <!-- Edit form goes here -->
        <button @click="modalEditOpen = false">Close</button>
      </div>
    </div>
    <div v-if="modalDeleteOpen" class="modal">
      <div class="modal-content">
        <h3>Delete Reservation</h3>
        <!-- Delete form goes here -->
        <button @click="modalDeleteOpen = false">Close</button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

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

<style scoped>
.reservations-wrapper {
  font-family: 'Georgia', serif;
  padding: 1.5rem 0;
}

.table-header {
  display: flex;
  align-items: baseline;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.table-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #0b2027;
  letter-spacing: -0.02em;
  margin: 0;
}

.table-count {
  font-size: 0.8rem;
  color: #9a8f80;
  font-family: 'Courier New', monospace;
}

.table-container {
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #e2d9cc;
  box-shadow: 0 2px 16px rgba(11, 32, 39, 0.06);
}

.reservations-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
}

thead tr {
  background: #0b2027;
}

thead th {
  padding: 0.85rem 1.1rem;
  text-align: left;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #c8bfaf;
  font-family: 'Courier New', monospace;
  border: none;
}

.table-row {
  background: #fff;
  border-bottom: 1px solid #f0ebe2;
}

.table-row:hover {
  background: unset !important;
}

.table-row:last-child {
  border-bottom: none;
}

@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

td {
  padding: 0.9rem 1.1rem;
  font-size: 0.875rem;
  color: #3a3028;
  vertical-align: middle;
}

.spot-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: #0b2027;
}

.spot-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #0b2027;
  flex-shrink: 0;
}

.date-cell {
  color: #5a4e42;
}

.time-cell {
  font-family: 'Courier New', monospace;
  font-size: 0.82rem;
  color: #6b5f52;
}

/* Status badges */
.status-badge {
  display: inline-block;
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: capitalize;
}

.status-confirmed {
  background: #d4edda;
  color: #2d6a4f;
}

.status-pending {
  background: #fff3cd;
  color: #7d5a00;
}

.status-cancelled {
  background: #fde8e8;
  color: #9b1c1c;
}

.status-na {
  background: #ede8e0;
  color: #7a6e63;
}

/* Action buttons */
.actions-cell {
  display: flex;
  gap: 0.5rem;
}

.btn-edit,
.btn-delete {
  padding: 0.3rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}

.btn-edit {
  background: #e8e0d0;
  color: #0b2027;
}

.btn-edit:hover {
  background: #d4c9b5;
}

.btn-delete {
  background: transparent;
  color: #b85050;
  border: 1px solid #e8c8c8;
}

.btn-delete:hover {
  background: #fde8e8;
}

.empty-state {
  text-align: center;
  color: #9a8f80;
  font-style: italic;
  padding: 2.5rem;
}
</style>
