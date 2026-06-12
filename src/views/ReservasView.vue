<script setup>
import { ref } from 'vue'
import { mdiMusicNote, mdiCity, mdiShieldCheck } from '@mdi/js'
import SectionMain from '@/components/SectionMain.vue'
import CardBox from '@/components/CardBox.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseIcon from '@/components/BaseIcon.vue'
import Navbar from '@/components/NavBar.vue' // Importação do novo componente
import ReservasList from '@/components/ReservasList.vue'
import { useRoute } from 'vue-router'

const reservations = ref([])
const route = useRoute()
const getReservations = async () => {
  const id_artista=route.params.id_artista
  console.log(id_artista)
  try {
    const res = await fetch(`http://localhost:3000/api/reservas/artista/${id_artista}`)
    const data = await res.json()
    console.log(data.data)
    reservations.value = data.data
  } catch (error) {
    console.error('Error fetching reservations:', error)
  }
}

getReservations()
</script>

<template>
  <SectionMain class="min-h-screen bg-[#f5f0e6] transition-colors dark:bg-slate-900">
    <Navbar />
    <ReservasList :reservations="reservations" />

  </SectionMain>
</template>
