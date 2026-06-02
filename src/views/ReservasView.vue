<script setup>
import { ref } from 'vue'
import { mdiMusicNote, mdiCity, mdiShieldCheck } from '@mdi/js'
import SectionMain from '@/components/SectionMain.vue'
import CardBox from '@/components/CardBox.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseIcon from '@/components/BaseIcon.vue'
import Navbar from '@/components/NavBar.vue' // Importação do novo componente
import ReservasList from '@/components/ReservasList.vue'

const getReservations = async () => {
  try {
    const res = await fetch('http://localhost:3000/api/reservas/artista/4')
    const data = await res.json()
    console.log(data)
  } catch (error) {
    console.error('Error fetching reservations:', error)
  }
}

getReservations()
</script>

<template>
  <SectionMain class="min-h-screen bg-[#f5f0e6]">
    <Navbar />
    <ReservasList />

  </SectionMain>
</template>
