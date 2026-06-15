<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api/axios.js'
import { mdiMusicNote, mdiCity, mdiShieldCheck } from '@mdi/js'
import SectionMain from '@/components/SectionMain.vue'
import CardBox from '@/components/CardBox.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseIcon from '@/components/BaseIcon.vue'
import Navbar from '@/components/NavBar.vue' // Importação do novo componente
import SpotMap from '@/components/SpotMap.vue' // Importação do novo componente

const popularArtists = ref([])

onMounted(async () => {
  try {
    const response = await api.get('/artistas/top')
    popularArtists.value = response.data.data
  } catch (error) {
    console.error('Erro ao buscar artistas populares:', error)
  }
})

const problemCards = ref([
  {
    icon: mdiMusicNote,
    title: "Artists don't know",
    description:
      'where to perform. You find a spot, start playing... and hope no one tells you to stop.',
  },
  {
    icon: mdiCity,
    title: 'Cities lack control,',
    description: "you approach an artist... and have no idea if they're allowed to be there.",
  },
  {
    icon: mdiShieldCheck,
    title: "There's no clear system to",
    description: "manage who's allowed where, officials have difficulty verifying permits",
  },
])

const formatFollowers = (num) => {
  return num.toLocaleString() + ' followers'
}
</script>

<template>
  <SectionMain class="min-h-screen bg-[#f5f0e6] transition-colors dark:bg-slate-900">
    <Navbar />

    <div class="relative mb-8 overflow-hidden rounded-lg">
      <div
        class="relative h-90 bg-cover bg-center"
        style="
          background-image: url('https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&auto=format&fit=crop&q=60');
        "
      >
        <div class="absolute inset-0 bg-black/30"></div>
        <div class="relative z-10 flex h-full flex-col justify-center p-8">
          <h1 class="mb-2 text-3xl leading-tight font-bold text-white md:text-4xl">
            A fair way to<br />
            manage urban<br />
            performance<br />
            spaces
          </h1>
          <p class="mb-4 text-lg text-[#7dd3c0]">
            Connecting cities, artists, and people in one platform.
          </p>
          <BaseButton
            label="Pick a spot!"
            color=""
            class="w-fit rounded-lg border-none bg-[#40798C] text-white hover:bg-[#0B2027]"
            href="Spots"
          />
        </div>
      </div>
    </div>

    <div class="mb-8">
      <h2 class="mb-6 text-xl font-semibold text-[#5b9a8b] dark:text-teal-400">
        Everyone shares the city. No one shares the system.
      </h2>

      <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div v-for="(card, index) in problemCards" :key="index" class="p-4 text-center">
          <div class="mb-3 flex justify-center">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-[#e8e0d0] dark:bg-slate-800">
              <BaseIcon :path="card.icon" class="text-gray-600 dark:text-gray-400" size="24" />
            </div>
          </div>
          <h3 class="mb-1 text-sm font-semibold text-gray-700 dark:text-gray-200">{{ card.title }}</h3>
          <p class="text-xs leading-relaxed text-gray-500 dark:text-gray-400">{{ card.description }}</p>
        </div>
      </div>
    </div>
    <div>
      <h2 class="mb-4 text-xl font-semibold text-[#5b9a8b] dark:text-teal-400">Spots Map</h2>
      <SpotMap />
    </div>
    <br>
    <div>
      <h2 class="mb-4 text-xl font-semibold text-[#5b9a8b] dark:text-teal-400">Most Popular Artists</h2>
      <div v-if="popularArtists.length === 0" class="text-sm italic text-gray-500 dark:text-gray-400">
        Ainda não há artistas com seguidores na plataforma.
      </div>

      <div v-else class="space-y-3">
        <CardBox
          v-for="(artist, index) in popularArtists"
          :key="index"
          class="rounded-lg bg-[#7dd3c0]/30 px-4 py-3 dark:bg-slate-800 dark:border dark:border-slate-700"
        >
          <div class="flex items-center justify-between">
            <span class="font-medium text-gray-700 dark:text-gray-200">{{ artist.name }}</span>
            <span class="text-sm text-gray-500 dark:text-gray-400">{{ formatFollowers(artist.followers) }}</span>
          </div>
        </CardBox>
      </div>
    </div>

    <!-- Call to Action Section (Link to FormsView) -->
    <div class="mt-12 rounded-2xl bg-gradient-to-r from-[#40798C] to-[#5b9a8b] p-8 text-white shadow-lg md:flex md:items-center md:justify-between dark:from-slate-800 dark:to-slate-700 dark:border dark:border-slate-700">
      <div class="mb-6 md:mb-0 md:mr-8">
        <h2 class="text-2xl font-bold mb-2 text-white">Need to contact us or submit a request?</h2>
        <p class="text-sm opacity-90 leading-relaxed max-w-xl text-white dark:text-slate-300">
          Whether you want to suggest a new performance space, report an issue, or apply for an urban permit, our forms are ready to help you get in touch with the administration team.
        </p>
      </div>
      <div>
        <BaseButton
          label="Go to Forms"
          color=""
          class="w-full md:w-auto rounded-lg border-none bg-white text-[#40798C] font-semibold px-6 py-3 shadow-md hover:bg-[#e8e0d0] hover:text-[#0B2027] transition-all"
          to="/ocorrencias"
        />
      </div>
    </div>
  </SectionMain>
</template>
