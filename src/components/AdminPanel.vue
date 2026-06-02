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
import CardBox from '@/components/CardBox.vue'
import BaseIcon from '@/components/BaseIcon.vue'

// Data
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
    const token = localStorage.getItem('token')
    const response = await fetch('http://localhost:3000/api/ocorrencias', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
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
  <div class="mt-12">
    <h1 class="mb-8 text-center text-3xl font-light tracking-widest text-teal-400 border-t border-teal-500/20 pt-8 dark:text-teal-300">ADMINISTRAÇÃO</h1>

    <section class="mb-8">
      <h2 class="mb-4 flex items-center gap-2 font-semibold text-gray-700 dark:text-gray-200">
        <BaseIcon :path="mdiClipboardText" size="20" class="text-teal-500" />
        Reservations
      </h2>
      <div class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        <div v-for="reservation in paginatedReservations" :key="reservation.id"
          class="cursor-pointer rounded-2xl bg-teal-600 p-4 text-white shadow-md transition-all hover:bg-teal-700 hover:shadow-lg dark:bg-teal-700 dark:hover:bg-teal-600">
          <p class="font-medium">{{ reservation.name }}</p>
          <p class="text-xs opacity-80 mt-1">{{ reservation.date }}</p>
        </div>
      </div>

      <!-- Pagination for Reservations -->
      <div v-if="reservations.length > 9"
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
        <div class="grid grid-cols-12 gap-2 bg-teal-600 p-4 text-sm font-bold text-white uppercase tracking-wider dark:bg-teal-700">
          <div class="col-span-3 pl-2">Name</div>
          <div class="col-span-2">Genre</div>
          <div class="col-span-3">Category</div>
          <div class="col-span-2">Created</div>
          <div class="col-span-2 text-right pr-2">Actions</div>
        </div>
        <div class="divide-y divide-gray-100 dark:divide-slate-700">
          <div v-for="artist in artists" :key="artist.id"
            class="grid grid-cols-12 items-center gap-2 p-4 text-sm hover:bg-gray-50 transition-colors dark:hover:bg-slate-700/50">
            <div class="col-span-3 flex items-center gap-3 pl-2">
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 border border-teal-100 text-teal-600 dark:bg-teal-900/50 dark:border-teal-800 dark:text-teal-400">
                <BaseIcon :path="mdiAccount" size="20" />
              </div>
              <span class="font-semibold text-gray-800 dark:text-slate-200">{{
                artist.name
                }}</span>
            </div>
            <div class="col-span-2 text-gray-600 font-medium dark:text-slate-400">{{ artist.genre }}</div>
            <div class="col-span-3 text-gray-600 dark:text-slate-400">{{ artist.category }}</div>
            <div class="col-span-2 text-gray-500 dark:text-slate-500">{{ artist.created }}</div>
            <div class="col-span-2 flex justify-end gap-2 pr-2">
              <button class="flex items-center justify-center h-8 w-8 rounded-lg bg-amber-100 text-amber-600 hover:bg-amber-200 transition-colors dark:bg-amber-900/50 dark:text-amber-400 dark:hover:bg-amber-900/80">
                <BaseIcon :path="mdiEye" size="16" />
              </button>
              <button class="flex items-center justify-center h-8 w-8 rounded-lg bg-rose-100 text-rose-600 hover:bg-rose-200 transition-colors dark:bg-rose-900/50 dark:text-rose-400 dark:hover:bg-rose-900/80">
                <BaseIcon :path="mdiDelete" size="16" />
              </button>
            </div>
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
                ? 'bg-teal-600 text-white shadow-sm dark:bg-teal-500'
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
</template>
