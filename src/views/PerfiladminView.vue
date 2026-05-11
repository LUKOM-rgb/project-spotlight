<script setup>
import { reactive, ref } from 'vue'
import {
  mdiAccount,
  mdiCalendar,
  mdiPencil,
  mdiCog,
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
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'

// Tabs
const activeTab = ref('profile')

const tabs = [
  { id: 'logo', icon: null, label: 'LOGO' },
  { id: 'profile', icon: mdiAccount },
  { id: 'calendar', icon: mdiCalendar },
  { id: 'edit', icon: mdiPencil },
  { id: 'settings', icon: mdiCog },
]

// Reservations data
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

// Rapporteur data
const rapporteurItems = reactive([
  {
    id: 1,
    name: 'Refined Soft Chicken',
    date: '3 days ago',
    avatar: '/img/avatar-1.jpg',
    tags: ['music', 'live'],
  },
  {
    id: 2,
    name: 'Intelligent Metal Bacon',
    date: '4 days ago',
    avatar: '/img/avatar-2.jpg',
    tags: ['music'],
  },
  {
    id: 3,
    name: 'Rustic Wooden Shoes',
    date: '7 days ago',
    avatar: '/img/avatar-3.jpg',
    tags: ['music', 'live'],
  },
])

// Artists data
const artists = reactive([
  {
    id: 1,
    name: 'Howell Hand',
    genre: 'EDM',
    category: 'Music spinning',
    created: '04.11.2024',
    avatar: '/img/avatar-1.jpg',
  },
  {
    id: 2,
    name: 'Roger Mayer',
    genre: 'DRM',
    category: 'Living statue',
    created: '03.11.2024',
    avatar: '/img/avatar-2.jpg',
  },
  {
    id: 3,
    name: 'Nelson Jerde',
    genre: 'TETA',
    category: 'Urban intervention',
    created: '02.10.2024',
    avatar: '/img/avatar-3.jpg',
  },
  {
    id: 4,
    name: 'Ken Glensson',
    genre: 'GYAZ',
    category: 'Living statue',
    created: '',
    avatar: '/img/avatar-4.jpg',
  },
  {
    id: 5,
    name: "Janice O'Reilly",
    genre: 'RNR',
    category: 'Graphics and Projection',
    created: '04.07.2024',
    avatar: '/img/avatar-5.jpg',
  },
])

const currentPage = ref(1)
const totalPages = ref(4)

const setActiveTab = (tabId) => {
  activeTab.value = tabId
}

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <div class="min-h-screen bg-amber-50 p-4">
        <!-- Tab Navigation -->
        <div class="mb-6 flex justify-center">
          <div class="flex items-center gap-1 rounded-full bg-slate-700 px-2 py-2">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              :class="[
                'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                activeTab === tab.id
                  ? 'bg-teal-500 text-white'
                  : 'text-gray-300 hover:bg-slate-600',
              ]"
              @click="setActiveTab(tab.id)"
            >
              <span v-if="tab.label">{{ tab.label }}</span>
              <BaseIcon v-else :path="tab.icon" size="20" />
            </button>
          </div>
        </div>

        <!-- Admin Title -->
        <h1 class="mb-8 text-center text-2xl font-semibold text-slate-700">ADMIN</h1>

        <!-- Reservations Section -->
        <section class="mb-8">
          <h2 class="mb-4 flex items-center gap-2 font-medium text-slate-700">
            <BaseIcon :path="mdiClipboardText" size="20" />
            reservations
          </h2>

          <div class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            <div
              v-for="reservation in reservations"
              :key="reservation.id"
              class="cursor-pointer rounded-lg bg-teal-600 p-3 text-white transition-colors hover:bg-teal-700"
            >
              <p class="text-sm font-medium">{{ reservation.name }}</p>
              <p class="text-xs text-teal-200">{{ reservation.date }}</p>
            </div>
          </div>
        </section>

        <!-- Rapporteur Section -->
        <section class="mb-8">
          <h2 class="mb-4 flex items-center gap-2 font-medium text-slate-700">
            <BaseIcon :path="mdiFileDocument" size="20" />
            rapporteur
          </h2>

          <div class="space-y-3">
            <div
              v-for="item in rapporteurItems"
              :key="item.id"
              class="flex items-center justify-between rounded-lg bg-teal-600 p-3 text-white"
            >
              <div class="flex items-center gap-3">
                <img
                  :src="item.avatar"
                  :alt="item.name"
                  class="h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <p class="text-sm font-medium">{{ item.name }}</p>
                  <p class="text-xs text-teal-200">{{ item.date }}</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span
                  v-for="tag in item.tags"
                  :key="tag"
                  class="rounded bg-teal-500 px-2 py-1 text-xs"
                >
                  {{ tag }}
                </span>
                <button class="rounded bg-amber-100 p-1 text-slate-700 hover:bg-amber-200">
                  <BaseIcon :path="mdiEye" size="16" />
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- Artists Section -->
        <section>
          <h2 class="mb-4 flex items-center gap-2 font-medium text-slate-700">
            <BaseIcon :path="mdiAccountMusic" size="20" />
            Artists
          </h2>

          <CardBox class="overflow-hidden bg-slate-700">
            <!-- Table Header -->
            <div class="grid grid-cols-12 gap-2 bg-teal-600 p-3 text-xs font-medium text-white">
              <div class="col-span-3">Name</div>
              <div class="col-span-2">Genre</div>
              <div class="col-span-3">Category</div>
              <div class="col-span-2">Created</div>
              <div class="col-span-2 text-right">Actions</div>
            </div>

            <!-- Table Body -->
            <div class="divide-y divide-slate-600">
              <div
                v-for="(artist, index) in artists"
                :key="artist.id"
                :class="[
                  'grid grid-cols-12 items-center gap-2 p-3 text-sm',
                  index % 2 === 0 ? 'bg-slate-700' : 'bg-slate-600',
                ]"
              >
                <div class="col-span-3 flex items-center gap-2">
                  <img
                    :src="artist.avatar"
                    :alt="artist.name"
                    class="h-8 w-8 rounded-full object-cover"
                  />
                  <span class="text-xs text-teal-300">{{ artist.name }}</span>
                </div>
                <div class="col-span-2 text-xs text-gray-300">{{ artist.genre }}</div>
                <div class="col-span-3 text-xs text-gray-300">{{ artist.category }}</div>
                <div class="col-span-2 text-xs text-gray-400">{{ artist.created }}</div>
                <div class="col-span-2 flex justify-end gap-1">
                  <button class="rounded bg-amber-500 p-1.5 text-xs text-white hover:bg-amber-600">
                    <BaseIcon :path="mdiEye" size="14" />
                  </button>
                  <button class="rounded bg-red-500 p-1.5 text-xs text-white hover:bg-red-600">
                    <BaseIcon :path="mdiDelete" size="14" />
                  </button>
                </div>
              </div>
            </div>

            <!-- Pagination -->
            <div class="flex items-center justify-between bg-slate-800 p-3">
              <div class="flex gap-1">
                <button
                  class="rounded bg-teal-600 p-1.5 text-white hover:bg-teal-700"
                  @click="goToPage(currentPage - 1)"
                >
                  <BaseIcon :path="mdiChevronLeft" size="16" />
                </button>
                <button
                  v-for="page in totalPages"
                  :key="page"
                  :class="[
                    'rounded px-2.5 py-1 text-xs font-medium',
                    currentPage === page
                      ? 'bg-teal-500 text-white'
                      : 'bg-teal-700 text-teal-200 hover:bg-teal-600',
                  ]"
                  @click="goToPage(page)"
                >
                  {{ page }}
                </button>
                <button
                  class="rounded bg-teal-600 p-1.5 text-white hover:bg-teal-700"
                  @click="goToPage(currentPage + 1)"
                >
                  <BaseIcon :path="mdiChevronRight" size="16" />
                </button>
              </div>
              <span class="text-xs text-gray-400">Page {{ currentPage }} of {{ totalPages }}</span>
            </div>
          </CardBox>
        </section>
      </div>
    </SectionMain>
  </LayoutAuthenticated>
</template>

<style scoped>
/* Estilos adicionais se necessário */
</style>
