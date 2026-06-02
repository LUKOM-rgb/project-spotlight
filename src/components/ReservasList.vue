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
        <tr v-for="reservation in reservations" :key="reservation.id">
          <td>{{ reservation.localizacao }}</td>
          <td>{{ reservation.data_evento }}</td>
          <td>{{ reservation.hora_inicio}}</td>
          <td>{{ reservation.hora_fim }}</td>
          <td>{{ reservation.status }}</td>
          <td>
            <button @click="" style="margin-right: 10px;">Edit</button>
            <button @click="">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>

const reservations = [
  {
    id: 1,
    localizacao: 'Praça Central',
    data_evento: '2024-07-15',
    hora_inicio: '18:00',
    hora_fim: '20:00',
    status: 'Confirmed'
  },
  {
    id: 2,
    localizacao: 'Parque das Artes',
    data_evento: '2024-07-20',
    hora_inicio: '19:00',
    hora_fim: '21:00',
    status: 'Pending'},
  ]

</script>

<style lang="scss" scoped>

</style>
