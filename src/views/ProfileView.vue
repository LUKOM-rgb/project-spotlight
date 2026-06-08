<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/api/axios'
import Navbar from '@/components/NavBar.vue'
import SectionMain from '@/components/SectionMain.vue'
import CardBox from '@/components/CardBox.vue'
import FormField from '@/components/FormField.vue'
import FormControl from '@/components/FormControl.vue'
import BaseButton from '@/components/BaseButton.vue'
import AdminPanel from '@/components/AdminPanel.vue'
import { mdiAccount, mdiAccountMusic, mdiAccountMinus } from '@mdi/js'
import BaseIcon from '@/components/BaseIcon.vue'

const authStore = useAuthStore()

// Mensagens de feedback
const profileMessage = ref('')
const profileMessageStatus = ref('success')

const artistMessage = ref('')
const artistMessageStatus = ref('success')

// Dados do perfil (Editar)
const profileForm = reactive({
  nome_utilizador: '',
  email: '',
  numero_telemovel: ''
})

// Dados de Upgrade para Artista
const artistForm = reactive({
  numero_licenca: '',
  validade_licenca: '',
  categoria_id: ''
})

const categories = ref([])
const followedArtists = ref([])

const getCategoryName = (catId) => {
  const cat = categories.value.find(c => c.categoria_id === catId)
  return cat ? cat.nome_categoria : `N/A`
}

onMounted(async () => {
  // Preencher form de perfil com os dados da store
  if (authStore.user) {
    profileForm.nome_utilizador = authStore.user.nome_utilizador || ''
    profileForm.email = authStore.user.email || ''
    profileForm.numero_telemovel = authStore.user.numero_telemovel || ''
    
    try {
      // Carregar categorias
      const resCategories = await api.get('/categorias')
      categories.value = resCategories.data.data
      
      // Carregar artistas seguidos
      const resFollowed = await api.get('/seguidores')
      followedArtists.value = resFollowed.data.data || []
    } catch (error) {
      console.error('Erro ao carregar dados adicionais:', error)
    }
  }
})

const unfollowArtist = async (id_artista) => {
  if (!id_artista) return
  try {
    await api.delete(`/seguidores/${id_artista}`)
    followedArtists.value = followedArtists.value.filter(a => {
      const aObj = a.Artistum || a.Artista
      return aObj && aObj.id_artista !== id_artista
    })
  } catch (error) {
    console.error("Erro ao deixar de seguir:", error)
  }
}

const submitProfile = async () => {
  try {
    profileMessage.value = ''
    profileMessageStatus.value = 'success'
    await api.patch('/utilizadores/me', profileForm)
    // Atualizar a store após alteração
    await authStore.fetchUser()
    profileMessage.value = 'Perfil atualizado com sucesso!'
    setTimeout(() => profileMessage.value = '', 3000)
  } catch (error) {
    profileMessageStatus.value = 'error'
    let errMsg = error.response?.data?.error || 'Erro ao atualizar perfil.'
    
    // Se o backend enviar detalhes de validação, extrair e mostrar a mensagem específica
    if (error.response?.data?.details) {
      const msgs = Object.values(error.response.data.details).flat()
      if (msgs.length > 0) errMsg = msgs.join(' | ')
    }
    
    profileMessage.value = errMsg
  }
}

const submitArtist = async () => {
  try {
    artistMessage.value = ''
    artistMessageStatus.value = 'success'
    const payload = {
      numero_licenca: artistForm.numero_licenca,
      validade_licenca: artistForm.validade_licenca,
      categoria_id: artistForm.categoria_id
    }
    await api.post(`/artistas`, payload)
    
    // Sucesso, atualizar o user na store para refletir o novo role
    await authStore.fetchUser()
    artistMessage.value = 'Parabéns! Foste promovido a Artista!'
  } catch (error) {
    artistMessageStatus.value = 'error'
    let errMsg = error.response?.data?.error || 'Erro ao submeter pedido.'
    
    if (error.response?.data?.details) {
      const msgs = Object.values(error.response.data.details).flat()
      if (msgs.length > 0) errMsg = msgs.join(' | ')
    }
    
    artistMessage.value = errMsg
  }
}
</script>

<template>
  <SectionMain class="min-h-screen bg-[#f5f0e6] transition-colors dark:bg-slate-900">
    <Navbar />
    
    <div class="p-4">
      <!-- Cabeçalho -->
      <div class="mb-8 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <h1 class="text-3xl font-light tracking-widest text-teal-400 dark:text-teal-300">O MEU PERFIL</h1>
          <div v-if="authStore.user?.tipo === 'artista'" class="flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1 text-sm font-semibold text-teal-400 dark:text-teal-300">
            <span>🌟 Artista Reconhecido</span>
          </div>
        </div>
        
        <BaseButton
          color="danger"
          label="Terminar Sessão"
          class="bg-red-500 hover:bg-red-600 text-white font-semibold border-none"
          @click="authStore.logout()"
        />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- Coluna 1: Dados Pessoais -->
        <CardBox class="shadow-xl dark:bg-slate-800" is-form @submit.prevent="submitProfile">
          <h2 class="mb-6 text-xl font-semibold text-gray-900 dark:text-white">Dados Pessoais</h2>
          
          <div v-if="profileMessage" :class="[
            'mb-4 rounded p-3 text-sm border text-center transition-colors',
            profileMessageStatus === 'error'
              ? 'bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400'
              : 'bg-teal-500/10 text-teal-600 border-teal-500/20 dark:text-teal-400'
          ]">
            {{ profileMessage }}
          </div>

          <FormField label="Nome de Utilizador:" label-class="text-gray-600 dark:text-gray-300">
            <FormControl
              v-model="profileForm.nome_utilizador"
              name="nome"
              class="rounded"
              required
            />
          </FormField>

          <FormField label="E-mail:" label-class="text-gray-600 dark:text-gray-300">
            <FormControl
              v-model="profileForm.email"
              type="email"
              name="email"
              class="rounded"
              required
            />
          </FormField>

          <FormField label="Telemóvel:" label-class="text-gray-600 dark:text-gray-300">
            <FormControl
              v-model="profileForm.numero_telemovel"
              type="tel"
              name="telemovel"
              class="rounded"
            />
          </FormField>

          <div class="mt-6">
            <BaseButton
              type="submit"
              color="info"
              label="Guardar Alterações"
              class="w-full bg-teal-600 hover:bg-teal-700 text-white border-none"
            />
          </div>
        </CardBox>

        <!-- Coluna 2: Promover a Artista -->
        <CardBox v-if="authStore.user?.tipo === 'utilizador'" class="shadow-xl border border-teal-500/20 dark:bg-slate-800 dark:border-teal-500/10" is-form @submit.prevent="submitArtist">
          <div class="text-center mb-6">
            <h2 class="text-2xl font-semibold text-teal-600 mb-2 dark:text-teal-400">Queres atuar nas ruas?</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">Regista a tua licença para te tornares um Artista Oficial Spotlight.</p>
          </div>

          <div v-if="artistMessage" :class="[
            'mb-4 rounded p-3 text-sm border text-center transition-colors',
            artistMessageStatus === 'error'
              ? 'bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400'
              : 'bg-teal-500/10 text-teal-600 border-teal-500/20 dark:text-teal-400'
          ]">
            {{ artistMessage }}
          </div>

          <FormField label="Número da Licença:" label-class="text-gray-600 dark:text-gray-300" help="A licença deve começar obrigatoriamente por 'LIC-'">
            <FormControl
              v-model="artistForm.numero_licenca"
              name="licenca"
              class="rounded"
              placeholder="Ex: LIC-12345"
              required
            />
          </FormField>

          <FormField label="Validade da Licença:" label-class="text-gray-600 dark:text-gray-300">
            <FormControl
              v-model="artistForm.validade_licenca"
              type="date"
              name="validade"
              class="rounded"
              required
            />
          </FormField>

          <FormField label="Categoria de Atuação:" label-class="text-gray-600 dark:text-gray-300">
            <select
              v-model="artistForm.categoria_id"
              class="w-full rounded border-gray-300 p-2 focus:ring focus:ring-teal-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              required
            >
              <option value="" disabled>Seleciona uma categoria...</option>
              <option v-for="cat in categories" :key="cat.categoria_id" :value="cat.categoria_id">
                {{ cat.nome_categoria }}
              </option>
            </select>
          </FormField>

          <div class="mt-6">
            <BaseButton
              type="submit"
              color="info"
              label="Tornar-me Artista"
              class="w-full bg-teal-600 hover:bg-teal-700 text-white border-none"
            />
          </div>
        </CardBox>
      </div>

      <!-- Artistas Seguidos -->
      <div class="mt-8" v-if="authStore.user">
        <CardBox class="shadow-xl border border-gray-100 dark:bg-slate-800 dark:border-slate-700">
          <h2 class="mb-6 text-xl font-semibold text-gray-900 dark:text-white">Artistas que Segues</h2>
          <div v-if="followedArtists.length === 0" class="text-gray-500 dark:text-gray-400 text-sm p-4 bg-gray-50 rounded-lg dark:bg-slate-700/30">
            Ainda não segues nenhum artista. Explora a lista de artistas para acompanhares os teus favoritos!
          </div>
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="artist in followedArtists" :key="artist.id_utilizador" class="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-white shadow-sm dark:bg-slate-700/50 dark:border-slate-600 transition-colors hover:shadow-md">
              <div class="flex items-center gap-3">
                <div class="flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-teal-600 dark:bg-teal-900/50 dark:text-teal-400">
                  <BaseIcon :path="mdiAccountMusic" size="24" />
                </div>
                <div>
                  <div class="font-bold text-gray-800 dark:text-slate-200">{{ artist.nome_utilizador }}</div>
                  <div class="text-xs font-semibold text-teal-600 dark:text-teal-400">{{ (artist.Artistum || artist.Artista) ? getCategoryName((artist.Artistum || artist.Artista).categoria_id) : 'N/A' }}</div>
                </div>
              </div>
              <button 
                @click="unfollowArtist((artist.Artistum || artist.Artista)?.id_artista)" 
                class="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-600 dark:hover:text-white"
                title="Deixar de seguir"
              >
                <BaseIcon :path="mdiAccountMinus" size="20" />
              </button>
            </div>
          </div>
        </CardBox>
      </div>

      <!-- Admin Panel condicional -->
      <AdminPanel v-if="authStore.user?.tipo === 'admin'" class="mt-8" />
    </div>
  </SectionMain>
</template>
