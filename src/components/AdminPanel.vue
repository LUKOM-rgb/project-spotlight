<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import {
  mdiAccount,
  mdiClipboardText,
  mdiFileDocument,
  mdiAccountMusic,
  mdiEye,
  mdiDelete,
  mdiChevronLeft,
  mdiChevronRight,
  mdiFilterOutline,
  mdiSortAlphabeticalAscending,
} from '@mdi/js'
import CardBox from '@/components/CardBox.vue'
import BaseIcon from '@/components/BaseIcon.vue'
import api from '@/api/axios'

// State variables
const rapporteurItems = ref([])
const reservationsList = ref([])
const artistsList = ref([])
const spotsList = ref([])
const categoriesList = ref([])
const usersList = ref([])

// Utility functions for mapping
const getSpotLocation = (spotId) => {
  const spot = spotsList.value.find(s => s.id_spot === spotId)
  return spot ? spot.localizacao : `Spot #${spotId}`
}

const getArtistName = (artistaId) => {
  const artist = artistsList.value.find(a => a.id_artista === artistaId)
  return artist ? artist.nome_utilizador : `Artista #${artistaId}`
}

const getCategoryName = (catId) => {
  const cat = categoriesList.value.find(c => c.categoria_id === catId)
  return cat ? cat.nome_categoria : `ID: ${catId}`
}

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  const date = new Date(dateStr)
  return date.toLocaleDateString('pt-PT')
}

// Fetch all administration data
onMounted(async () => {
  // Fetch occurrences
  try {
    const res = await api.get('/ocorrencias')
    if (res.data && Array.isArray(res.data.data)) {
      rapporteurItems.value = res.data.data.map(ocorr => ({
        id: ocorr.id_ocorrencia,
        name: ocorr.descricao_ocorrencia || 'Sem descrição',
        local: ocorr.local_ocorrencia || 'Desconhecido',
        date: `${ocorr.data_ocorrencia} @ ${ocorr.hora_ocorrencia}`,
        avatar: '/src/img/Logo.png',
        tags: [ocorr.estado_ocorrencia || 'pendente'],
      }))
    }
  } catch (error) {
    console.error('Erro ao ir buscar as ocorrências:', error)
  }

  // Fetch reservations, artists, spots, categories, and users
  try {
    const [resReservas, resArtists, resSpots, resCategories, resUsers] = await Promise.all([
      api.get('/reservas'),
      api.get('/artistas'),
      api.get('/spots'),
      api.get('/categorias'),
      api.get('/utilizadores')
    ])

    reservationsList.value = resReservas.data?.data || resReservas.data || []
    artistsList.value = resArtists.data?.data || resArtists.data || []
    spotsList.value = resSpots.data?.data || resSpots.data || []
    categoriesList.value = resCategories.data?.data || resCategories.data || []
    usersList.value = resUsers.data?.data || resUsers.data || []
  } catch (error) {
    console.error('Erro ao carregar dados do painel de administração:', error)
  }
})

// Delete Artist action
const deleteArtistAction = async (idArtista) => {
  if (confirm('Tem a certeza que deseja remover este artista da plataforma?')) {
    try {
      await api.delete(`/artistas/${idArtista}`)
      // Reload artists
      const res = await api.get('/artistas')
      artistsList.value = res.data?.data || res.data || []
    } catch (error) {
      console.error('Erro ao remover artista:', error)
      alert('Não foi possível remover o artista.')
    }
  }
}

// Delete User action
const deleteUserAction = async (idUtilizador) => {
  if (confirm('Tem a certeza que deseja remover este utilizador da plataforma? Esta ação é irreversível.')) {
    try {
      await api.delete(`/utilizadores/${idUtilizador}`)
      // Reload users
      const res = await api.get('/utilizadores')
      usersList.value = res.data?.data || res.data || []
    } catch (error) {
      console.error('Erro ao remover utilizador:', error)
      alert(error.response?.data?.error || 'Não foi possível remover o utilizador.')
    }
  }
}

// Pagination for Reservations
const reservationsPage = ref(1)
const reservationsPerPage = 9
const paginatedReservations = computed(() =>
  reservationsList.value.slice(
    (reservationsPage.value - 1) * reservationsPerPage,
    reservationsPage.value * reservationsPerPage
  )
)
const reservationsTotalPages = computed(() =>
  Math.ceil(reservationsList.value.length / reservationsPerPage)
)
const goToReservationsPage = (page) => {
  if (page >= 1 && page <= reservationsTotalPages.value) {
    reservationsPage.value = page
  }
}

// Pagination for Ocorrências
const ocorrenciasPage = ref(1)
const ocorrenciasPerPage = 5
const paginatedOcorrencias = computed(() =>
  rapporteurItems.value.slice(
    (ocorrenciasPage.value - 1) * ocorrenciasPerPage,
    ocorrenciasPage.value * ocorrenciasPerPage
  )
)
const ocorrenciasTotalPages = computed(() =>
  Math.ceil(rapporteurItems.value.length / ocorrenciasPerPage)
)
const goToOcorrenciasPage = (page) => {
  if (page >= 1 && page <= ocorrenciasTotalPages.value) {
    ocorrenciasPage.value = page
  }
}

// --- Artists Filter & Sort ---
const artistCategoryFilter = ref('')
const artistSortBy = ref('followersDesc')

const processedArtists = computed(() => {
  let result = [...artistsList.value]
  if (artistCategoryFilter.value !== '') {
    result = result.filter(artist => {
      const artObj = artist.Artistum || artist.Artista
      return artObj && artObj.categoria_id === artistCategoryFilter.value
    })
  }
  result.sort((a, b) => {
    const followersA = (a.Artistum || a.Artista)?.Seguidors?.length || 0
    const followersB = (b.Artistum || b.Artista)?.Seguidors?.length || 0
    if (artistSortBy.value === 'followersDesc') return followersB - followersA
    if (artistSortBy.value === 'followersAsc') return followersA - followersB
    if (artistSortBy.value === 'nameAsc') return a.nome_utilizador.localeCompare(b.nome_utilizador)
    return 0
  })
  return result
})

watch([artistCategoryFilter, artistSortBy], () => { artistsPage.value = 1 })

// Pagination for Artists
const artistsPage = ref(1)
const artistsPerPage = 5
const paginatedArtists = computed(() =>
  processedArtists.value.slice(
    (artistsPage.value - 1) * artistsPerPage,
    artistsPage.value * artistsPerPage
  )
)
const artistsTotalPages = computed(() =>
  Math.ceil(processedArtists.value.length / artistsPerPage) || 1
)
const goToArtistsPage = (page) => {
  if (page >= 1 && page <= artistsTotalPages.value) {
    artistsPage.value = page
  }
}

// --- Users Filter & Sort ---
const userRoleFilter = ref('')
const userSortBy = ref('dateDesc')

const processedUsers = computed(() => {
  let result = [...usersList.value]
  if (userRoleFilter.value !== '') {
    result = result.filter(u => u.tipo === userRoleFilter.value)
  }
  result.sort((a, b) => {
    if (userSortBy.value === 'nameAsc') return a.nome_utilizador.localeCompare(b.nome_utilizador)
    if (userSortBy.value === 'dateDesc') return new Date(b.data_registo) - new Date(a.data_registo)
    if (userSortBy.value === 'dateAsc') return new Date(a.data_registo) - new Date(b.data_registo)
    return 0
  })
  return result
})

watch([userRoleFilter, userSortBy], () => { usersPage.value = 1 })

// Pagination for Users
const usersPage = ref(1)
const usersPerPage = 5
const paginatedUsers = computed(() =>
  processedUsers.value.slice(
    (usersPage.value - 1) * usersPerPage,
    usersPage.value * usersPerPage
  )
)
const usersTotalPages = computed(() =>
  Math.ceil(processedUsers.value.length / usersPerPage) || 1
)
const goToUsersPage = (page) => {
  if (page >= 1 && page <= usersTotalPages.value) {
    usersPage.value = page
  }
}
</script>

<template>
  <div class="mt-12">
    <h1 class="mb-8 text-center text-3xl font-light tracking-widest text-teal-400 border-t border-teal-500/20 pt-8 dark:text-teal-300">ADMINISTRAÇÃO</h1>

    <section class="mb-8">
      <h2 class="mb-4 flex items-center gap-2 font-semibold text-gray-700 dark:text-gray-200">
        <BaseIcon :path="mdiClipboardText" size="20" class="text-teal-500" />
        Reservations
      </h2>
      <div class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        <div v-for="reservation in paginatedReservations" :key="reservation.id_reserva"
          class="cursor-pointer rounded-2xl bg-teal-600 p-4 text-white shadow-md transition-all hover:bg-teal-700 hover:shadow-lg dark:bg-teal-700 dark:hover:bg-teal-600">
          <p class="font-medium">{{ getArtistName(reservation.id_artista) }}</p>
          <p class="text-xs opacity-80 mt-1">
            {{ getSpotLocation(reservation.id_spot) }} @ {{ formatDate(reservation.data_evento) }} ({{ reservation.hora_inicio.slice(0, 5) }} - {{ reservation.hora_fim.slice(0, 5) }})
          </p>
        </div>
      </div>
      <div v-if="reservationsList.length === 0" class="p-8 text-center text-slate-400 dark:text-slate-500 text-sm">
        Nenhuma reserva encontrada de momento.
      </div>

      <!-- Pagination for Reservations -->
      <div v-if="reservationsList.length > 9"
        class="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-3 shadow-sm mt-4 dark:bg-slate-800 dark:border-slate-700">
        <div class="flex gap-2 mx-auto">
          <button
            class="flex items-center justify-center h-8 w-8 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-600 dark:hover:text-teal-300"
            :disabled="reservationsPage === 1" @click="goToReservationsPage(reservationsPage - 1)">
            <BaseIcon :path="mdiChevronLeft" size="20" />
          </button>
          <button v-for="page in reservationsTotalPages" :key="page" :class="[
            'flex items-center justify-center h-8 w-8 rounded-lg text-sm font-bold transition-colors',
            reservationsPage === page
              ? 'bg-teal-600 text-white shadow-sm dark:bg-teal-500'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-teal-600 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-600 dark:hover:text-teal-300',
          ]" @click="goToReservationsPage(page)">
            {{ page }}
          </button>
          <button
            class="flex items-center justify-center h-8 w-8 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-600 dark:hover:text-teal-300"
            :disabled="reservationsPage === reservationsTotalPages"
            @click="goToReservationsPage(reservationsPage + 1)">
            <BaseIcon :path="mdiChevronRight" size="20" />
          </button>
        </div>
      </div>
    </section>

    <section class="mb-8">
      <h2 class="mb-4 flex items-center gap-2 font-semibold text-gray-700 dark:text-gray-200">
        <BaseIcon :path="mdiFileDocument" size="20" class="text-teal-500" />
        Ocorrências
      </h2>
      <div class="space-y-3">
        <div v-for="item in paginatedOcorrencias" :key="item.id"
          class="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-800/80">
          <div class="flex items-center gap-4">
            <div
              class="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-teal-100 bg-teal-50 dark:bg-teal-900/50 dark:border-teal-800">
              <img src="/src/img/Logo.png" class="h-8 w-8 object-contain" />
            </div>
            <div>
              <p class="text-sm font-semibold text-gray-800 dark:text-white">
                {{ item.name }}
              </p>
              <p v-if="item.local" class="text-xs font-semibold text-teal-600 mt-0.5 dark:text-teal-400">
                Local: {{ item.local }}
              </p>
              <p class="text-xs text-gray-500 mt-0.5 dark:text-gray-400">{{ item.date }}</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <span v-for="tag in item.tags" :key="tag" :class="[
              'rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider',
              tag === 'resolvida'
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400'
                : tag === 'em progresso'
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400'
                  : 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-400'
            ]">
              {{ tag }}
            </span>
            <button
              class="flex items-center justify-center h-8 w-8 rounded-full bg-gray-50 border border-gray-200 text-gray-500 transition-colors hover:bg-teal-50 hover:text-teal-600 hover:border-teal-200 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-teal-900/50 dark:hover:text-teal-300 dark:hover:border-teal-700">
              <BaseIcon :path="mdiEye" size="16" />
            </button>
          </div>
        </div>

        <!-- Pagination for Ocorrências -->
        <div v-if="rapporteurItems.length > 5"
          class="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-3 shadow-sm mt-4 dark:bg-slate-800 dark:border-slate-700">
          <div class="flex gap-2 mx-auto">
            <button
              class="flex items-center justify-center h-8 w-8 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-600 dark:hover:text-teal-300"
              :disabled="ocorrenciasPage === 1" @click="goToOcorrenciasPage(ocorrenciasPage - 1)">
              <BaseIcon :path="mdiChevronLeft" size="20" />
            </button>
            <button v-for="page in ocorrenciasTotalPages" :key="page" :class="[
              'flex items-center justify-center h-8 w-8 rounded-lg text-sm font-bold transition-colors',
              ocorrenciasPage === page
                ? 'bg-teal-600 text-white shadow-sm dark:bg-teal-500'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-teal-600 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-600 dark:hover:text-teal-300',
            ]" @click="goToOcorrenciasPage(page)">
              {{ page }}
            </button>
            <button
              class="flex items-center justify-center h-8 w-8 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-600 dark:hover:text-teal-300"
              :disabled="ocorrenciasPage === ocorrenciasTotalPages" @click="goToOcorrenciasPage(ocorrenciasPage + 1)">
              <BaseIcon :path="mdiChevronRight" size="20" />
            </button>
          </div>
        </div>
      </div>
    </section>

    <section>
      <h2 class="mb-4 flex items-center gap-2 font-semibold text-gray-700 dark:text-gray-200">
        <BaseIcon :path="mdiAccountMusic" size="20" class="text-teal-500" />
        Artists
      </h2>
      <CardBox class="overflow-hidden border border-gray-200 bg-white shadow-xl rounded-2xl dark:border-slate-700 dark:bg-slate-800">
        
        <!-- Artists Filters -->
        <div class="flex flex-col sm:flex-row justify-between items-center bg-gray-50 p-4 border-b border-gray-100 gap-4 dark:bg-slate-800 dark:border-slate-700">
          <div class="flex items-center gap-2 w-full sm:w-auto">
            <BaseIcon :path="mdiFilterOutline" size="20" class="text-teal-600 dark:text-teal-400" />
            <select v-model="artistCategoryFilter" class="w-full sm:w-auto rounded-lg border-gray-300 text-sm focus:border-teal-500 focus:ring-teal-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white">
              <option value="">Todas as Categorias</option>
              <option v-for="cat in categoriesList" :key="cat.categoria_id" :value="cat.categoria_id">
                {{ cat.nome_categoria }}
              </option>
            </select>
          </div>
          <div class="flex items-center gap-2 w-full sm:w-auto">
            <BaseIcon :path="mdiSortAlphabeticalAscending" size="20" class="text-teal-600 dark:text-teal-400" />
            <select v-model="artistSortBy" class="w-full sm:w-auto rounded-lg border-gray-300 text-sm focus:border-teal-500 focus:ring-teal-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white">
              <option value="followersDesc">Mais Seguidores</option>
              <option value="followersAsc">Menos Seguidores</option>
              <option value="nameAsc">Nome (A-Z)</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-12 gap-2 bg-teal-600 p-4 text-sm font-bold text-white uppercase tracking-wider dark:bg-teal-700">
          <div class="col-span-3 pl-2">Name</div>
          <div class="col-span-3">License</div>
          <div class="col-span-3">Category</div>
          <div class="col-span-2">Validity</div>
          <div class="col-span-1 text-right pr-2">Actions</div>
        </div>
        <div class="divide-y divide-gray-100 dark:divide-slate-700">
          <div v-for="artist in paginatedArtists" :key="artist.id_utilizador"
            class="grid grid-cols-12 items-center gap-2 p-4 text-sm hover:bg-gray-50 transition-colors dark:hover:bg-slate-700/50">
            <div class="col-span-3 flex items-center gap-3 pl-2">
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 border border-teal-100 text-teal-600 dark:bg-teal-900/50 dark:border-teal-800 dark:text-teal-400">
                <BaseIcon :path="mdiAccount" size="20" />
              </div>
              <span class="font-semibold text-gray-800 dark:text-slate-200 truncate">{{
                artist.nome_utilizador
                }}</span>
            </div>
            <div class="col-span-3 text-gray-600 font-medium dark:text-slate-400 truncate">{{ (artist.Artistum || artist.Artista)?.numero_licenca || 'N/A' }}</div>
            <div class="col-span-3 text-gray-600 dark:text-slate-400 truncate">{{ (artist.Artistum || artist.Artista) ? getCategoryName((artist.Artistum || artist.Artista).categoria_id) : 'N/A' }}</div>
            <div class="col-span-2 text-gray-500 dark:text-slate-500">{{ (artist.Artistum || artist.Artista) ? formatDate((artist.Artistum || artist.Artista).validade_licenca) : 'N/A' }}</div>
            <div class="col-span-1 flex justify-end gap-2 pr-2">
              <button
                @click="deleteArtistAction(artist.id_artista)"
                class="flex items-center justify-center h-8 w-8 rounded-lg bg-rose-100 text-rose-600 hover:bg-rose-200 transition-colors dark:bg-rose-900/50 dark:text-rose-400 dark:hover:bg-rose-900/80"
              >
                <BaseIcon :path="mdiDelete" size="16" />
              </button>
            </div>
          </div>
          <div v-if="artistsList.length === 0" class="p-8 text-center text-slate-400 dark:text-slate-500 text-sm">
            Nenhum artista registado de momento.
          </div>
        </div>
        <!-- Pagination for Artists -->
        <div v-if="artistsList.length > 5" class="flex items-center justify-between bg-gray-50 p-4 border-t border-gray-100 dark:bg-slate-900/50 dark:border-slate-700">
          <div class="flex gap-2 mx-auto">
            <button class="flex items-center justify-center h-8 w-8 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-slate-800 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-teal-400"
              :disabled="artistsPage === 1" @click="goToArtistsPage(artistsPage - 1)">
              <BaseIcon :path="mdiChevronLeft" size="20" />
            </button>
            <button v-for="page in artistsTotalPages" :key="page" :class="[
              'flex items-center justify-center h-8 w-8 rounded-lg text-sm font-bold transition-colors',
              artistsPage === page
                ? 'bg-teal-600 text-white shadow-sm dark:bg-teal-500'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-teal-600 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-teal-400',
            ]" @click="goToArtistsPage(page)">
              {{ page }}
            </button>
            <button class="flex items-center justify-center h-8 w-8 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-slate-800 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-teal-400"
              :disabled="artistsPage === artistsTotalPages" @click="goToArtistsPage(artistsPage + 1)">
              <BaseIcon :path="mdiChevronRight" size="20" />
            </button>
          </div>
        </div>
      </CardBox>
    </section>

    <section class="mt-16 mb-8">
      <h2 class="mb-4 flex items-center gap-2 font-semibold text-gray-700 dark:text-gray-200">
        <BaseIcon :path="mdiAccount" size="20" class="text-teal-500" />
        Users
      </h2>
      <CardBox class="overflow-hidden border border-gray-200 bg-white shadow-xl rounded-2xl dark:border-slate-700 dark:bg-slate-800">
        
        <!-- Users Filters -->
        <div class="flex flex-col sm:flex-row justify-between items-center bg-gray-50 p-4 border-b border-gray-100 gap-4 dark:bg-slate-800 dark:border-slate-700">
          <div class="flex items-center gap-2 w-full sm:w-auto">
            <BaseIcon :path="mdiFilterOutline" size="20" class="text-teal-600 dark:text-teal-400" />
            <select v-model="userRoleFilter" class="w-full sm:w-auto rounded-lg border-gray-300 text-sm focus:border-teal-500 focus:ring-teal-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white">
              <option value="">Todos os Cargos</option>
              <option value="admin">Admin</option>
              <option value="artista">Artista</option>
              <option value="utilizador">Utilizador</option>
            </select>
          </div>
          <div class="flex items-center gap-2 w-full sm:w-auto">
            <BaseIcon :path="mdiSortAlphabeticalAscending" size="20" class="text-teal-600 dark:text-teal-400" />
            <select v-model="userSortBy" class="w-full sm:w-auto rounded-lg border-gray-300 text-sm focus:border-teal-500 focus:ring-teal-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white">
              <option value="dateDesc">Mais Recentes</option>
              <option value="dateAsc">Mais Antigos</option>
              <option value="nameAsc">Nome (A-Z)</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-12 gap-2 bg-teal-600 p-4 text-sm font-bold text-white uppercase tracking-wider dark:bg-teal-700">
          <div class="col-span-3 pl-2">Name</div>
          <div class="col-span-3">Email</div>
          <div class="col-span-2">Type</div>
          <div class="col-span-2">Phone</div>
          <div class="col-span-1 text-center">Date</div>
          <div class="col-span-1 text-right pr-2">Actions</div>
        </div>
        <div class="divide-y divide-gray-100 dark:divide-slate-700">
          <div v-for="user in paginatedUsers" :key="user.id_utilizador"
            class="grid grid-cols-12 items-center gap-2 p-4 text-sm hover:bg-gray-50 transition-colors dark:hover:bg-slate-700/50">
            <div class="col-span-3 flex items-center gap-3 pl-2">
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 border border-teal-100 text-teal-600 dark:bg-teal-900/50 dark:border-teal-800 dark:text-teal-400">
                <BaseIcon :path="mdiAccount" size="20" />
              </div>
              <span class="font-semibold text-gray-800 dark:text-slate-200 truncate">{{ user.nome_utilizador }}</span>
            </div>
            <div class="col-span-3 text-gray-600 dark:text-slate-400 truncate">{{ user.email }}</div>
            <div class="col-span-2 flex items-center">
              <span :class="[
                'rounded-full px-2 py-1 text-xs font-bold uppercase tracking-wider',
                user.tipo === 'admin' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-400' :
                user.tipo === 'artista' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400' :
                'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
              ]">{{ user.tipo }}</span>
            </div>
            <div class="col-span-2 text-gray-500 dark:text-slate-500 truncate">{{ user.numero_telemovel || 'N/A' }}</div>
            <div class="col-span-1 text-center text-gray-500 dark:text-slate-500">{{ formatDate(user.data_registo) }}</div>
            <div class="col-span-1 flex justify-end gap-2 pr-2">
              <button
                @click="deleteUserAction(user.id_utilizador)"
                class="flex items-center justify-center h-8 w-8 rounded-lg bg-rose-100 text-rose-600 hover:bg-rose-200 transition-colors dark:bg-rose-900/50 dark:text-rose-400 dark:hover:bg-rose-900/80"
                title="Apagar Utilizador"
              >
                <BaseIcon :path="mdiDelete" size="16" />
              </button>
            </div>
          </div>
          <div v-if="usersList.length === 0" class="p-8 text-center text-slate-400 dark:text-slate-500 text-sm">
            Nenhum utilizador registado de momento.
          </div>
        </div>
        <!-- Pagination for Users -->
        <div v-if="usersList.length > 5" class="flex items-center justify-between bg-gray-50 p-4 border-t border-gray-100 dark:bg-slate-900/50 dark:border-slate-700">
          <div class="flex gap-2 mx-auto">
            <button class="flex items-center justify-center h-8 w-8 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-slate-800 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-teal-400"
              :disabled="usersPage === 1" @click="goToUsersPage(usersPage - 1)">
              <BaseIcon :path="mdiChevronLeft" size="20" />
            </button>
            <button v-for="page in usersTotalPages" :key="page" :class="[
              'flex items-center justify-center h-8 w-8 rounded-lg text-sm font-bold transition-colors',
              usersPage === page
                ? 'bg-teal-600 text-white shadow-sm dark:bg-teal-500'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-teal-600 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-teal-400',
            ]" @click="goToUsersPage(page)">
              {{ page }}
            </button>
            <button class="flex items-center justify-center h-8 w-8 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-slate-800 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-teal-400"
              :disabled="usersPage === usersTotalPages" @click="goToUsersPage(usersPage + 1)">
              <BaseIcon :path="mdiChevronRight" size="20" />
            </button>
          </div>
        </div>
      </CardBox>
    </section>
  </div>
</template>
