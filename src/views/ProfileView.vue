<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/api/axios'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import SectionMain from '@/components/SectionMain.vue'
import CardBox from '@/components/CardBox.vue'
import FormField from '@/components/FormField.vue'
import FormControl from '@/components/FormControl.vue'
import BaseButton from '@/components/BaseButton.vue'

const authStore = useAuthStore()

// Mensagens de feedback
const profileMessage = ref('')
const artistMessage = ref('')

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

onMounted(async () => {
  // Preencher form de perfil com os dados da store
  if (authStore.user) {
    profileForm.nome_utilizador = authStore.user.nome_utilizador || ''
    profileForm.email = authStore.user.email || ''
    profileForm.numero_telemovel = authStore.user.numero_telemovel || ''
  }

  // Se for utilizador, carregar categorias para o form de artista
  if (authStore.user && authStore.user.tipo === 'utilizador') {
    try {
      const { data } = await api.get('/categorias')
      categories.value = data
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    }
  }
})

const submitProfile = async () => {
  try {
    profileMessage.value = ''
    const { data } = await api.patch('/utilizadores/me', profileForm)
    // Atualizar a store após alteração
    await authStore.fetchUser()
    profileMessage.value = 'Perfil atualizado com sucesso!'
    setTimeout(() => profileMessage.value = '', 3000)
  } catch (error) {
    profileMessage.value = error.response?.data?.error || 'Erro ao atualizar perfil.'
  }
}

const submitArtist = async () => {
  try {
    artistMessage.value = ''
    const payload = {
      tipo: 'artista',
      numero_licenca: artistForm.numero_licenca,
      validade_licenca: artistForm.validade_licenca,
      categoria_id: artistForm.categoria_id
    }
    await api.patch(`/utilizadores/${authStore.user.id_utilizador}/role`, payload)
    
    // Sucesso, atualizar o user na store para refletir o novo role
    await authStore.fetchUser()
    artistMessage.value = 'Parabéns! Foste promovido a Artista!'
  } catch (error) {
    artistMessage.value = error.response?.data?.error || 'Erro ao submeter pedido.'
  }
}
</script>

<template>
  <LayoutAuthenticated hide-aside>
    <SectionMain class="min-h-screen">
      
      <!-- Cabeçalho -->
      <div class="mb-8 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <h1 class="text-3xl font-light tracking-widest text-teal-400">O MEU PERFIL</h1>
          <div v-if="authStore.user?.tipo === 'artista'" class="flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1 text-sm font-semibold text-teal-400">
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
        <CardBox class="shadow-xl" is-form @submit.prevent="submitProfile">
          <h2 class="mb-6 text-xl font-semibold text-gray-900">Dados Pessoais</h2>
          
          <div v-if="profileMessage" class="mb-4 rounded bg-teal-500/10 p-3 text-teal-400 text-sm border border-teal-500/20 text-center">
            {{ profileMessage }}
          </div>

          <FormField label="Nome de Utilizador:" label-class="text-gray-600">
            <FormControl
              v-model="profileForm.nome_utilizador"
              name="nome"
              class="rounded"
              required
            />
          </FormField>

          <FormField label="E-mail:" label-class="text-gray-600">
            <FormControl
              v-model="profileForm.email"
              type="email"
              name="email"
              class="rounded"
              required
            />
          </FormField>

          <FormField label="Telemóvel:" label-class="text-gray-600">
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
        <CardBox v-if="authStore.user?.tipo === 'utilizador'" class="shadow-xl border border-teal-500/20" is-form @submit.prevent="submitArtist">
          <div class="text-center mb-6">
            <h2 class="text-2xl font-semibold text-teal-600 mb-2">Queres atuar nas ruas?</h2>
            <p class="text-sm text-gray-500">Regista a tua licença para te tornares um Artista Oficial Spotlight.</p>
          </div>

          <div v-if="artistMessage" class="mb-4 rounded bg-teal-500/10 p-3 text-teal-400 text-sm border border-teal-500/20 text-center">
            {{ artistMessage }}
          </div>

          <FormField label="Número da Licença:" label-class="text-gray-600">
            <FormControl
              v-model="artistForm.numero_licenca"
              name="licenca"
              class="rounded"
              required
            />
          </FormField>

          <FormField label="Validade da Licença:" label-class="text-gray-600">
            <FormControl
              v-model="artistForm.validade_licenca"
              type="date"
              name="validade"
              class="rounded"
              required
            />
          </FormField>

          <FormField label="Categoria de Atuação:" label-class="text-gray-600">
            <select
              v-model="artistForm.categoria_id"
              class="w-full rounded border-gray-300 p-2 focus:ring focus:ring-teal-500"
              required
            >
              <option value="" disabled>Seleciona uma categoria...</option>
              <option v-for="cat in categories" :key="cat.id_categoria" :value="cat.id_categoria">
                {{ cat.nome_categoria }}
              </option>
            </select>
          </FormField>

          <div class="mt-6">
            <BaseButton
              type="submit"
              color="success"
              label="Tornar-me Artista"
              class="w-full bg-emerald-600 hover:bg-emerald-700 text-white border-none"
            />
          </div>
        </CardBox>

      </div>
    </SectionMain>
  </LayoutAuthenticated>
</template>
