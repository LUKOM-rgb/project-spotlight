<script setup>
import { useRouter } from 'vue-router'
import { useDarkModeStore } from '@/stores/darkMode.js'
import {
  mdiEmail,
  mdiMusicNote,
  mdiAccountGroup,
  mdiLogout,
  mdiAccountCircle,
  mdiThemeLightDark,
} from '@mdi/js'
import CardBox from '@/components/CardBox.vue'
import BaseIcon from '@/components/BaseIcon.vue'

const router = useRouter()
const darkModeStore = useDarkModeStore()

const toggleDarkMode = () => {
  darkModeStore.set(null, true)
}

const navItems = [
  {
    icon: mdiAccountCircle,
    label: 'Perfil',
    action: () => router.push('/src/views/ProfileView.vue'),
  },
  { icon: mdiAccountGroup, label: 'Comunidade', action: () => router.push('/tables') },
  { icon: mdiEmail, label: 'Mensagens', action: () => router.push('/forms') },
  { icon: mdiMusicNote, label: 'Música', action: () => router.push('/') },
  { icon: mdiThemeLightDark, label: 'Modo', action: toggleDarkMode },
]

const logout = () => {
  router.push('/login')
}
</script>

<template>
  <CardBox
    class="mb-6 rounded-full bg-[#e8e0d0] px-6 py-2 shadow-md transition-colors dark:bg-slate-800"
  >
    <nav class="flex items-center justify-between">
      <div class="flex items-center gap-6">
        <img
          src="/src/img/Logo.png"
          alt="Logo"
          class="h-8 w-auto cursor-pointer object-contain"
          @click="router.push('/dashboard')"
        />
        <div class="flex items-center gap-4">
          <BaseIcon
            v-for="(item, index) in navItems"
            :key="index"
            :path="item.icon"
            class="cursor-pointer text-[#40798C] transition-colors hover:text-gray-800 dark:hover:text-white"
            size="20"
            @click="item.action ? item.action() : null"
          />
        </div>
      </div>
      <BaseIcon
        :path="mdiLogout"
        class="cursor-pointer text-[#40798C] transition-colors hover:text-gray-800 dark:hover:text-white"
        size="20"
        @click="logout"
      />
    </nav>
  </CardBox>
</template>
