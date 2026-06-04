<template>
  <div>
    <table>
      <thead>
        <tr>
          <th>Spot Location</th>
          <th>Date</th>
          <th>Start</th>
          <th>End</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="reservation in reservations" :key="reservation.id_reserva">
          <td>{{ reservation.id_spot }}</td>
          <td>{{ reservation.data_evento }}</td>
          <td>{{ reservation.hora_inicio }}</td>
          <td>{{ reservation.hora_fim }}</td>
          <td>{{ reservation.status || 'N/A' }}</td>
          <td>
            <button>Edit</button>
            <button>Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
const reservations = ref([])
async function getReservations() {
  const res = await fetch(
    'http://localhost:3000/api/reservas/artista/me',
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }
  )

  const data = await res.json()

  if (res.status === 204) {
    reservations.value = []
    return
  }

  // 👇 IMPORTANT: extract only the array
  reservations.value = data.data

  console.log(reservations.value)
}
onMounted(() => {
  getReservations()
})
</script>

<style lang="scss" scoped></style>
