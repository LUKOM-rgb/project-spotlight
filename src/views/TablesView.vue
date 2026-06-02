<script setup>
import { reactive, ref } from 'vue'
import {
  mdiAccount,
  mdiAccountMusic,
  mdiEye,
  mdiChevronLeft,
  mdiChevronRight,
} from '@mdi/js'
import SectionMain from '@/components/SectionMain.vue'
import CardBox from '@/components/CardBox.vue'
import BaseIcon from '@/components/BaseIcon.vue'
import Navbar from '@/components/NavBar.vue'

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
</script>

<template>
  <SectionMain class="min-h-screen bg-[#f5f0e6] transition-colors dark:bg-slate-900">
    <Navbar />

    <div class="p-4 max-w-5xl mx-auto mt-8">
      <h1 class="mb-8 text-center text-3xl font-light tracking-widest text-teal-400 dark:text-teal-300">ARTISTAS</h1>

      <section>
        <CardBox class="overflow-hidden border border-gray-200 bg-white shadow-xl rounded-2xl dark:border-slate-700 dark:bg-slate-800">
          <div class="grid grid-cols-12 gap-2 bg-teal-600 p-4 text-sm font-bold text-white uppercase tracking-wider dark:bg-teal-700">
            <div class="col-span-4 pl-2">Nome</div>
            <div class="col-span-2">Estilo</div>
            <div class="col-span-3">Categoria</div>
            <div class="col-span-3 text-right pr-2">Ações</div>
          </div>
          <div class="divide-y divide-gray-100 dark:divide-slate-700">
            <div v-for="artist in artists" :key="artist.id"
              class="grid grid-cols-12 items-center gap-2 p-4 text-sm hover:bg-gray-50 transition-colors dark:hover:bg-slate-700/50">
              <div class="col-span-4 flex items-center gap-3 pl-2">
                <div class="flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 border border-teal-100 text-teal-600 dark:bg-teal-900/50 dark:border-teal-800 dark:text-teal-400">
                  <BaseIcon :path="mdiAccount" size="20" />
                </div>
                <span class="font-semibold text-gray-800 dark:text-slate-200">{{
                  artist.name
                  }}</span>
              </div>
              <div class="col-span-2 text-gray-600 font-medium dark:text-slate-400">{{ artist.genre }}</div>
              <div class="col-span-3 text-gray-600 dark:text-slate-400">{{ artist.category }}</div>
              <div class="col-span-3 flex justify-end pr-2">
                <button class="flex items-center rounded-lg bg-teal-600 px-3 py-2 text-white hover:bg-teal-700 shadow-sm transition-all text-sm font-medium dark:bg-teal-600 dark:hover:bg-teal-500">
                  <BaseIcon :path="mdiEye" size="16" />
                  <span class="ml-2">Ver Perfil</span>
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
