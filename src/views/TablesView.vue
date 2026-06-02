<script setup>
import { reactive, ref, onMounted, computed } from 'vue'
import {
  mdiAccount,
  mdiClipboardText,
  mdiFileDocument,
  mdiAccountMusic,
  mdiEye,
  mdiDelete,
  mdiChevronLeft,
  mdiChevronRight,
} from '@mdi/js'
import SectionMain from '@/components/SectionMain.vue'
import CardBox from '@/components/CardBox.vue'
import BaseIcon from '@/components/BaseIcon.vue'
import Navbar from '@/components/NavBar.vue' // Importação da tua Navbar

// Data (Mantendo a tua estrutura de dados reativos)
const reservations = reactive([
  { id: 1, name: 'Howell Hand', date: 'Mar 3, 2025 @ pending', status: 'pending' },
  { id: 2, name: 'Howell Hand', date: 'Mar 3, 2025 @ pending', status: 'pending' },
  { id: 3, name: 'Howell Hand', date: 'Mar 3, 2025 @ pending', status: 'pending' },
  { id: 4, name: 'Howell Hand', date: 'Mar 3, 2025 @ pending', status: 'pending' },
  { id: 5, name: 'Howell Hand', date: 'Mar 3, 2025 @ pending', status: 'pending' },
  { id: 6, name: 'Howell Hand', date: 'Mar 3, 2025 @ pending', status: 'pending' },
  { id: 7, name: 'Howell Hand', date: 'Mar 3, 2025 @ pending', status: 'pending' },
  { id: 8, name: 'Howell Hand', date: 'Mar 3, 2025 @ pending', status: 'pending' },
  { id: 9, name: 'Howell Hand', date: 'Mar 3, 2025 @ pending', status: 'pending' },
])

const rapporteurItems = ref([])

onMounted(async () => {
  try {
    const token = localStorage.getItem('token') || localStorage.getItem('auth_token')
    const headers = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    const response = await fetch('http://localhost:3000/api/ocorrencias', {
      headers,
    })
    const result = await response.json()
    if (result && result.data && Array.isArray(result.data)) {
      rapporteurItems.value = result.data.map(ocorr => ({
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
})

const artists = reactive([
  { id: 1, name: 'Howell Hand', genre: 'EDM', category: 'Music spinning', created: '04.11.2024' },
  { id: 2, name: 'Roger Mayer', genre: 'DRM', category: 'Living statue', created: '03.11.2024' },
  {
    id: 3,
    name: 'Nelson Jerde',
    genre: 'TETA',
    category: 'Urban intervention',
    created: '02.10.2024',
  },
  { id: 4, name: 'Ken Glensson', genre: 'GYAZ', category: 'Living statue', created: '' },
  {
    id: 5,
    name: "Janice O'Reilly",
    genre: 'RNR',
    category: 'Graphics and Projection',
    created: '04.07.2024',
  },
])

const currentPage = ref(1)
const totalPages = ref(4)

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) currentPage.value = page
}

// Pagination for Reservations
const reservationsPage = ref(1)
const reservationsPerPage = 9
const paginatedReservations = computed(() =>
  reservations.slice(
    (reservationsPage.value - 1) * reservationsPerPage,
    reservationsPage.value * reservationsPerPage
  )
)
const reservationsTotalPages = computed(() =>
  Math.ceil(reservations.length / reservationsPerPage)
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
</script>

<template>
  <SectionMain class="min-h-screen bg-[#f5f0e6] transition-colors dark:bg-slate-900">
    <Navbar />

    <div class="p-4">
      <h1 class="mb-8 text-center text-2xl font-bold text-[#40798C]">ADMINISTRAÇÃO</h1>

      <section class="mb-8">
        <h2 class="mb-4 flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200">
          <BaseIcon :path="mdiClipboardText" size="20" />
          Reservations
        </h2>
        <div class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="reservation in paginatedReservations"
            :key="reservation.id"
            class="cursor-pointer rounded-lg bg-[#40798C] p-3 text-white shadow-sm transition-all hover:bg-[#0B2027]"
          >
            <p class="text-sm font-medium">{{ reservation.name }}</p>
            <p class="text-xs opacity-75">{{ reservation.date }}</p>
          </div>
        </div>

        <!-- Pagination for Reservations -->
        <div v-if="reservations.length > 9" class="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3 shadow-md dark:border-slate-700 dark:bg-slate-900/50 mt-4">
          <div class="flex gap-1">
            <button
              class="rounded bg-[#40798C] p-1.5 text-white hover:bg-[#0B2027] disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="reservationsPage === 1"
              @click="goToReservationsPage(reservationsPage - 1)"
            >
              <BaseIcon :path="mdiChevronLeft" size="16" />
            </button>
            <button
              v-for="page in reservationsTotalPages"
              :key="page"
              :class="[
                'rounded px-2.5 py-1 text-xs font-bold transition-colors',
                reservationsPage === page
                  ? 'bg-[#40798C] text-white'
                  : 'border border-[#40798C] bg-white text-[#40798C]',
              ]"
              @click="goToReservationsPage(page)"
            >
              {{ page }}
            </button>
            <button
              class="rounded bg-[#40798C] p-1.5 text-white hover:bg-[#0B2027] disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="reservationsPage === reservationsTotalPages"
              @click="goToReservationsPage(reservationsPage + 1)"
            >
              <BaseIcon :path="mdiChevronRight" size="16" />
            </button>
          </div>
        </div>
      </section>

      <section class="mb-8">
        <h2 class="mb-4 flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200">
          <BaseIcon :path="mdiFileDocument" size="20" />
          Ocorrências
        </h2>
        <div class="space-y-3">
          <div
            v-for="item in paginatedOcorrencias"
            :key="item.id"
            class="flex items-center justify-between rounded-lg border border-gray-100 bg-white p-4 shadow-md transition-all hover:shadow-lg dark:border-slate-700 dark:bg-slate-800"
          >
            <div class="flex items-center gap-3">
              <div
                class="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-[#40798C] bg-[#e8e0d0]"
              >
                <img src="/src/img/Logo.png" class="h-6 w-6 object-contain" />
              </div>
              <div>
                <p class="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {{ item.name }}
                </p>
                <p v-if="item.local" class="text-xs font-semibold text-[#40798C] dark:text-[#7dd3c0] mt-0.5">
                  Local: {{ item.local }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ item.date }}</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <span
                v-for="tag in item.tags"
                :key="tag"
                :class="[
                  'rounded px-2.5 py-1 text-xs font-extrabold uppercase tracking-wider shadow-sm',
                  tag === 'resolvida'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400'
                    : tag === 'em progresso'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400'
                ]"
              >
                {{ tag }}
              </span>
              <button class="rounded-full bg-gray-100 p-1.5 text-slate-600 transition-colors hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600">
                <BaseIcon :path="mdiEye" size="16" />
              </button>
            </div>
          </div>

          <!-- Pagination for Ocorrências -->
          <div v-if="rapporteurItems.length > 5" class="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3 shadow-md dark:border-slate-700 dark:bg-slate-900/50 mt-4">
            <div class="flex gap-1">
              <button
                class="rounded bg-[#40798C] p-1.5 text-white hover:bg-[#0B2027] disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="ocorrenciasPage === 1"
                @click="goToOcorrenciasPage(ocorrenciasPage - 1)"
              >
                <BaseIcon :path="mdiChevronLeft" size="16" />
              </button>
              <button
                v-for="page in ocorrenciasTotalPages"
                :key="page"
                :class="[
                  'rounded px-2.5 py-1 text-xs font-bold transition-colors',
                  ocorrenciasPage === page
                    ? 'bg-[#40798C] text-white'
                    : 'border border-[#40798C] bg-white text-[#40798C]',
                ]"
                @click="goToOcorrenciasPage(page)"
              >
                {{ page }}
              </button>
              <button
                class="rounded bg-[#40798C] p-1.5 text-white hover:bg-[#0B2027] disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="ocorrenciasPage === ocorrenciasTotalPages"
                @click="goToOcorrenciasPage(ocorrenciasPage + 1)"
              >
                <BaseIcon :path="mdiChevronRight" size="16" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 class="mb-4 flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200">
          <BaseIcon :path="mdiAccountMusic" size="20" />
          Artists
        </h2>
        <CardBox class="overflow-hidden border-none bg-white shadow-lg dark:bg-slate-800">
          <div
            class="grid grid-cols-12 gap-2 bg-[#40798C] p-3 text-xs font-bold text-white uppercase"
          >
            <div class="col-span-3">Name</div>
            <div class="col-span-2">Genre</div>
            <div class="col-span-3">Category</div>
            <div class="col-span-2">Created</div>
            <div class="col-span-2 text-right">Actions</div>
          </div>
          <div class="divide-y divide-gray-100 dark:divide-slate-700">
            <div
              v-for="artist in artists"
              :key="artist.id"
              class="grid grid-cols-12 items-center gap-2 p-3 text-sm hover:bg-gray-50 dark:hover:bg-slate-700/50"
            >
              <div class="col-span-3 flex items-center gap-2">
                <div class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
                  <BaseIcon :path="mdiAccount" size="14" class="text-gray-500" />
                </div>
                <span class="text-xs font-semibold text-slate-700 dark:text-slate-300">{{
                  artist.name
                }}</span>
              </div>
              <div class="col-span-2 text-xs text-gray-500">{{ artist.genre }}</div>
              <div class="col-span-3 text-xs text-gray-500">{{ artist.category }}</div>
              <div class="col-span-2 text-xs text-gray-400">{{ artist.created }}</div>
              <div class="col-span-2 flex justify-end gap-1">
                <button class="rounded bg-amber-500 p-1.5 text-white hover:bg-amber-600">
                  <BaseIcon :path="mdiEye" size="14" />
                </button>
                <button class="rounded bg-red-500 p-1.5 text-white hover:bg-red-600">
                  <BaseIcon :path="mdiDelete" size="14" />
                </button>
              </div>
            </div>
          </div>
          <div class="flex items-center justify-between bg-gray-50 p-3 dark:bg-slate-900/50">
            <div class="flex gap-1">
              <button
                class="rounded bg-[#40798C] p-1.5 text-white hover:bg-[#0B2027]"
                @click="goToPage(currentPage - 1)"
              >
                <BaseIcon :path="mdiChevronLeft" size="16" />
              </button>
              <button
                v-for="page in totalPages"
                :key="page"
                :class="[
                  'rounded px-2.5 py-1 text-xs font-bold transition-colors',
                  currentPage === page
                    ? 'bg-[#40798C] text-white'
                    : 'border border-[#40798C] bg-white text-[#40798C]',
                ]"
                @click="goToPage(page)"
              >
                {{ page }}
              </button>
              <button
                class="rounded bg-[#40798C] p-1.5 text-white hover:bg-[#0B2027]"
                @click="goToPage(currentPage + 1)"
              >
                <BaseIcon :path="mdiChevronRight" size="16" />
              </button>
            </div>
          </div>
        </CardBox>
      </section>
    </div>
  </SectionMain>
</template>
