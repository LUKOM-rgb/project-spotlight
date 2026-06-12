<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  mdiAccount,
  mdiAccountMusic,
  mdiCalendarCheck,
  mdiChevronLeft,
  mdiChevronRight,
  mdiFilterOutline,
  mdiSortAlphabeticalAscending,
  mdiAccountPlus,
  mdiAccountMinus
} from '@mdi/js'
import SectionMain from '@/components/SectionMain.vue'
import CardBox from '@/components/CardBox.vue'
import BaseIcon from '@/components/BaseIcon.vue'
import Navbar from '@/components/NavBar.vue'
import api from '@/api/axios'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const artistsList = ref([])
const categoriesList = ref([])
const reservationsList = ref([])

onMounted(async () => {
  try {
    const [resArtists, resCategories, resReservas] = await Promise.all([
      api.get('/artistas'),
      api.get('/categorias'),
      api.get('/reservas')
    ])

    // As in AdminPanel, /artistas returns { data: [...] } and /categorias might return [...] directly
    artistsList.value = resArtists.data?.data || resArtists.data || []
    categoriesList.value = resCategories.data?.data || resCategories.data || []
    reservationsList.value = resReservas.data?.data || resReservas.data || []
  } catch (error) {
    console.error('Erro ao buscar dados:', error)
  }
})

const getCategoryName = (catId) => {
  const cat = categoriesList.value.find(c => c.categoria_id === catId)
  return cat ? cat.nome_categoria : `N/A`
}

const getReservationsCount = (artistaId) => {
  if (!artistaId) return 0
  return reservationsList.value.filter(r => r.id_artista === artistaId).length
}

const currentPage = ref(1)
const itemsPerPage = 8

const selectedCategory = ref('')
const sortBy = ref('followersDesc')

const processedArtists = computed(() => {
  let result = [...artistsList.value]

  // Filter by category
  if (selectedCategory.value !== '') {
    result = result.filter(artist => {
      const artObj = artist.Artistum || artist.Artista
      return artObj && artObj.categoria_id === selectedCategory.value
    })
  }

  // Sort
  result.sort((a, b) => {
    const artObjA = a.Artistum || a.Artista
    const artObjB = b.Artistum || b.Artista
    const followersA = artObjA?.Seguidors?.length || 0
    const followersB = artObjB?.Seguidors?.length || 0

    if (sortBy.value === 'followersDesc') {
      return followersB - followersA
    } else if (sortBy.value === 'followersAsc') {
      return followersA - followersB
    } else if (sortBy.value === 'nameAsc') {
      return a.nome_utilizador.localeCompare(b.nome_utilizador)
    }
    return 0
  })

  return result
})

// Reset to page 1 if filters change
watch([selectedCategory, sortBy], () => {
  currentPage.value = 1
})

const paginatedArtists = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return processedArtists.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(processedArtists.value.length / itemsPerPage) || 1)

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) currentPage.value = page
}

const isFollowing = (artistObj) => {
  if (!authStore.user || !artistObj) return false
  return artistObj.Seguidors?.some(s => s.id_utilizador === authStore.user.id_utilizador)
}

const toggleFollow = async (artist) => {
  if (!authStore.user) {
    alert("Inicia sessão para seguires artistas.")
    return
  }

  const artObj = artist.Artistum || artist.Artista
  if (!artObj) return

  const currentlyFollowing = isFollowing(artObj)

  try {
    if (currentlyFollowing) {
      await api.delete(`/seguidores/${artObj.id_artista}`)
      // Update local state
      artObj.Seguidors = artObj.Seguidors.filter(s => s.id_utilizador !== authStore.user.id_utilizador)
    } else {
      await api.post('/seguidores', {
        id_utilizador: authStore.user.id_utilizador,
        id_artista: artObj.id_artista
      })
      // Update local state
      if (!artObj.Seguidors) artObj.Seguidors = []
      artObj.Seguidors.push({ id_utilizador: authStore.user.id_utilizador })
    }
    // Forçar atualização do array para refletir a nova contagem/estado caso necessário
    artistsList.value = [...artistsList.value]
  } catch (error) {
    console.error("Erro ao alterar seguidor:", error)
    alert(error.response?.data?.error || "Erro ao tentar seguir o artista.")
  }
}
</script>

<template>
  <SectionMain class="min-h-screen bg-[#f5f0e6] transition-colors dark:bg-slate-900">
    <Navbar />

    <div class="p-4 max-w-5xl mx-auto mt-8">
      <h1 class="mb-8 text-center text-3xl font-light tracking-widest text-teal-400 dark:text-teal-300">ARTISTAS</h1>

      <section>
        <CardBox class="overflow-hidden border border-gray-200 bg-white shadow-xl rounded-2xl dark:border-slate-700 dark:bg-slate-800">

          <!-- Filtros e Ordenação -->
          <div class="flex flex-col sm:flex-row justify-between items-center bg-gray-50 p-4 border-b border-gray-100 gap-4 dark:bg-slate-800 dark:border-slate-700">
            <div class="flex items-center gap-2 w-full sm:w-auto">
              <BaseIcon :path="mdiFilterOutline" size="20" class="text-teal-600 dark:text-teal-400" />
              <select v-model="selectedCategory" class="w-full sm:w-auto rounded-lg border-gray-300 text-sm focus:border-teal-500 focus:ring-teal-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                <option value="">Todas as Categorias</option>
                <option v-for="cat in categoriesList" :key="cat.categoria_id" :value="cat.categoria_id">
                  {{ cat.nome_categoria }}
                </option>
              </select>
            </div>

            <div class="flex items-center gap-2 w-full sm:w-auto">
              <BaseIcon :path="mdiSortAlphabeticalAscending" size="20" class="text-teal-600 dark:text-teal-400" />
              <select v-model="sortBy" class="w-full sm:w-auto rounded-lg border-gray-300 text-sm focus:border-teal-500 focus:ring-teal-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                <option value="followersDesc">Mais Seguidores</option>
                <option value="followersAsc">Menos Seguidores</option>
                <option value="nameAsc">Nome (A-Z)</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-12 gap-2 bg-teal-600 p-4 text-sm font-bold text-white uppercase tracking-wider dark:bg-teal-700">
            <div class="col-span-4 pl-2">Nome</div>
            <div class="col-span-3">Categoria</div>
            <div class="col-span-2 text-center">Seguidores</div>
            <div class="col-span-2 text-center pr-2">Reservas</div>
            <div class="col-span-1 text-center">Ação</div>
          </div>
          <div class="divide-y divide-gray-100 dark:divide-slate-700">
            <div v-for="artist in paginatedArtists" :key="artist.id_utilizador"
              class="grid grid-cols-12 items-center gap-2 p-4 text-sm hover:bg-gray-50 transition-colors dark:hover:bg-slate-700/50">
              <div class="col-span-4 flex items-center gap-3 pl-2">
                <div class="flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 border border-teal-100 text-teal-600 dark:bg-teal-900/50 dark:border-teal-800 dark:text-teal-400">
                  <BaseIcon :path="mdiAccount" size="20" />
                </div>
                <span class="font-semibold text-gray-800 dark:text-slate-200 truncate">{{
                  artist.nome_utilizador
                  }}</span>
              </div>
              <div class="col-span-3 text-gray-600 dark:text-slate-400 truncate">{{ (artist.Artistum || artist.Artista) ? getCategoryName((artist.Artistum || artist.Artista).categoria_id) : 'N/A' }}</div>
              <div class="col-span-2 text-center font-bold text-teal-600 dark:text-teal-400">{{ (artist.Artistum || artist.Artista)?.Seguidors?.length || 0 }}</div>
              <div class="col-span-2 flex justify-center pr-2">
                <button @click="router.push(`/reservas/${(artist.Artistum || artist.Artista)?.id_artista}`)" class="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-teal-700 font-bold hover:bg-teal-600 hover:text-white transition-colors dark:bg-teal-900/50 dark:text-teal-300 dark:hover:bg-teal-600 dark:hover:text-white">
                  {{ getReservationsCount((artist.Artistum || artist.Artista)?.id_artista) }}
                </button>
              </div>
              <div class="col-span-1 flex justify-center">
                <button
                  v-if="(artist.Artistum || artist.Artista)?.id_artista !== authStore.user?.id_artista"
                  @click="toggleFollow(artist)"
                  class="flex h-8 w-8 items-center justify-center rounded-full transition-colors"
                  :class="isFollowing(artist.Artistum || artist.Artista) ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-400 dark:hover:bg-red-900' : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-400 dark:hover:bg-emerald-900'"
                  :title="isFollowing(artist.Artistum || artist.Artista) ? 'Deixar de seguir' : 'Seguir'"
                >
                  <BaseIcon :path="isFollowing(artist.Artistum || artist.Artista) ? mdiAccountMinus : mdiAccountPlus" size="18" />
                </button>
              </div>
            </div>
            <div v-if="artistsList.length === 0" class="p-8 text-center text-slate-400 dark:text-slate-500 text-sm">
              Nenhum artista registado de momento.
            </div>
          </div>
          <div class="flex items-center justify-between bg-gray-50 p-4 border-t border-gray-100 dark:bg-slate-900/50 dark:border-slate-700">
            <div class="flex gap-2 mx-auto">
              <button class="flex items-center justify-center h-8 w-8 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-teal-600 transition-colors dark:bg-slate-800 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-teal-400"
                @click="goToPage(currentPage - 1)">
                <BaseIcon :path="mdiChevronLeft" size="20" />
              </button>
              <button v-for="page in totalPages" :key="page" :class="[
                'flex items-center justify-center h-8 w-8 rounded-lg text-sm font-bold transition-colors',
                currentPage === page
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-teal-600 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-teal-400',
              ]" @click="goToPage(page)">
                {{ page }}
              </button>
              <button class="flex items-center justify-center h-8 w-8 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-teal-600 transition-colors dark:bg-slate-800 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-teal-400"
                @click="goToPage(currentPage + 1)">
                <BaseIcon :path="mdiChevronRight" size="20" />
              </button>
            </div>
          </div>
        </CardBox>
      </section>
    </div>
  </SectionMain>
</template>
