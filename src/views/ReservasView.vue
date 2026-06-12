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
const nome_artista = ref(null)
const route = useRoute()
const spots = ref([])
const getReservations = async () => {
  const id_artista=route.params.id_artista
  try {
    const res = await fetch(`http://localhost:3000/api/reservas/artista/${id_artista}`)
    const data = await res.json()
    reservations.value = data.data
  } catch (error) {
    console.error('Error fetching reservations:', error)
  }
}
const getSpots = async () => {
  try{
    const res = await fetch('http://localhost:3000/api/spots',{
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
    const data = await res.json()
    spots.value = data.data

  } catch (error) {
    console.error('Error fetching spots:', error)
  }
}
import { computed } from 'vue'

const reservationsWithLocal = computed(() => {
  return reservations.value.map(reserva => {
    const spot = spots.value.find(
      s => s.id_spot === reserva.id_spot
    )

    return {
      ...reserva,
      spot_local: spot?.localizacao ?? 'Unknown'
    }
  })
})
const getArtistaById = async () => {
  const id_artista=route.params.id_artista
  try {
    const res=await fetch(`http://localhost:3000/api/artistas/${id_artista}`)
    const data = await res.json()
    nome_artista.value = data.data.nome_utilizador
  } catch (error) {
    console.error('Error fetching artist:', error)
  }
}
getReservations()
getArtistaById()
getSpots()


</script>

<template>
  <SectionMain class="min-h-screen bg-[#f5f0e6] transition-colors dark:bg-slate-900">
    <Navbar />
    <h2 class="text-2xl font-regular tracking-widest text-teal-600 dark:text-teal-400">Reservas for {{ nome_artista }}</h2>

    <ReservasList :reservations="reservationsWithLocal" />

  </SectionMain>
</template>
