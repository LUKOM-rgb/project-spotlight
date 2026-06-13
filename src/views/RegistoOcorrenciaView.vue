<script setup>
import { reactive, ref, onMounted, computed } from 'vue'
import api from '@/api/axios.js'
import { mdiBallotOutline, mdiAccount, mdiCalendar, mdiClock, mdiMapMarker } from '@mdi/js'
import SectionMain from '@/components/SectionMain.vue'
import CardBox from '@/components/CardBox.vue'
import FormField from '@/components/FormField.vue'
import FormControl from '@/components/FormControl.vue'
import BaseDivider from '@/components/BaseDivider.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseButtons from '@/components/BaseButtons.vue'
import BaseIcon from '@/components/BaseIcon.vue'
import Navbar from '@/components/NavBar.vue'

const spotsList = ref([])
const successMessage = ref('')
const errorMessage = ref('')
const loggedInUser = ref(null)

const form = reactive({
  selectedSpot: null,
  data_ocorrencia: '',
  hora_ocorrencia: '',
  descricao_ocorrencia: '',
})

// Função para descodificar o token JWT
const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Erro ao descodificar o token:', error)
    return null
  }
}

// Mapeamento dos spots (ID único) obtidos da BD para o formato do FormControl
const spotsOptions = computed(() =>
  spotsList.value.map((s) => ({
    id: s.id_spot,
    label: String(s.id_spot),
  }))
)

// Carregar spots e verificar token do utilizador ao montar o componente
onMounted(async () => {
  const token = localStorage.getItem('token') || localStorage.getItem('auth_token')
  if (token) {
    const decoded = decodeToken(token)
    if (decoded && decoded.sub) {
      loggedInUser.value = {
        id: decoded.sub,
        email: decoded.email,
        role: decoded.role,
      }
    }
  }

  try {
    const headers = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    const spotsRes = await api.get('/spots')
    if (spotsRes.status === 200) {
      spotsList.value = spotsRes.data.data || []
    }
  } catch (err) {
    console.error('Erro ao carregar spots:', err)
  }
})

const submit = async () => {
  successMessage.value = ''
  errorMessage.value = ''

  const token = localStorage.getItem('token') || localStorage.getItem('auth_token')
  let userId = null

  if (token) {
    const decoded = decodeToken(token)
    if (decoded && decoded.sub) {
      userId = decoded.sub
    }
  }

  // Utilizar utilizador da sessão ativa (ou fallback para ID 1 de teste se não houver sessão ativa)
  const finalUserId = userId || 1

  if (!form.selectedSpot) {
    errorMessage.value = 'Por favor, selecione o local da ocorrência (Spot).'
    return
  }
  if (!form.data_ocorrencia) {
    errorMessage.value = 'A data da ocorrência é obrigatória.'
    return
  }
  if (!form.hora_ocorrencia) {
    errorMessage.value = 'A hora da ocorrência é obrigatória.'
    return
  }

  // Adicionar segundos à hora caso seja necessário (:00)
  let hora = form.hora_ocorrencia
  if (hora && hora.length === 5) {
    hora += ':00'
  }

  const selectedSpotData = spotsList.value.find((s) => s.id_spot === Number(form.selectedSpot.id))
  const localOcorrencia = selectedSpotData ? selectedSpotData.localizacao : `Spot ID: ${form.selectedSpot.id}`

  const payload = {
    data_ocorrencia: form.data_ocorrencia,
    hora_ocorrencia: hora,
    local_ocorrencia: localOcorrencia, // Nome do local obtido da BD com base no ID
    descricao_ocorrencia: form.descricao_ocorrencia || 'Sem descrição',
    estado: 'pendente', // O estado inicial é sempre 'pendente' (definido apenas por administradores no painel)
    id_utilizador: Number(finalUserId),
    id_spot: Number(form.selectedSpot.id), // ID do Spot da BD
  }

  const headers = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  try {
    const response = await api.post('/ocorrencias', payload)

    if (response.status === 200 || response.status === 201) {
      successMessage.value = 'Ocorrência registada com sucesso!'
      // Resetar formulário
      form.selectedSpot = null
      form.data_ocorrencia = ''
      form.hora_ocorrencia = ''
      form.descricao_ocorrencia = ''
    } else {
      errorMessage.value = response.data.message || 'Erro ao registar a ocorrência.'
    }
  } catch (error) {
    console.error('Erro ao submeter ocorrência:', error)
    errorMessage.value = error.response?.data?.message || 'Erro de rede: Não foi possível ligar ao servidor.'
  }
}
</script>

<template>
  <SectionMain class="min-h-screen bg-[#f5f0e6] transition-colors dark:bg-slate-900">
    <Navbar />

    <div class="p-4 max-w-3xl mx-auto">
      <h1 class="mb-8 text-center text-2xl font-bold text-[#40798C] dark:text-teal-400">REGISTO DE OCORRÊNCIA</h1>

      <!-- Mensagens de Feedback -->
      <div
        v-if="successMessage"
        class="mb-6 p-4 rounded-lg bg-emerald-100 text-emerald-800 font-medium text-sm shadow-sm dark:bg-emerald-950/40 dark:text-emerald-400"
      >
        {{ successMessage }}
      </div>
      <div
        v-if="errorMessage"
        class="mb-6 p-4 rounded-lg bg-rose-100 text-rose-800 font-medium text-sm shadow-sm dark:bg-rose-950/40 dark:text-rose-400"
      >
        {{ errorMessage }}
      </div>

      <section class="mb-8">
        <h2 class="mb-4 flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200">
          <BaseIcon :path="mdiBallotOutline" size="20" />
          Preencha os dados da Ocorrência
        </h2>
        <CardBox is-form @submit.prevent="submit" class="border-none bg-white shadow-lg dark:bg-slate-800 rounded-lg">
          
          <!-- Secção informativa do utilizador ativo -->
          <div
            v-if="loggedInUser"
            class="mb-6 p-4 rounded-lg bg-gray-50 text-slate-700 text-sm border border-gray-200 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 flex items-center gap-2"
          >
            <BaseIcon :path="mdiAccount" size="18" class="text-[#40798C]" />
            <span>Sessão ativa como: <strong>{{ loggedInUser.email }}</strong> (ID: {{ loggedInUser.id }})</span>
          </div>
          <div
            v-else
            class="mb-6 p-4 rounded-lg bg-amber-50 text-amber-800 text-sm border border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50 flex items-center gap-2"
          >
            <BaseIcon :path="mdiAccount" size="18" class="text-amber-600" />
            <span>Nenhum utilizador autenticado detetado. A submeter como utilizador de testes (ID: 1).</span>
          </div>

          <!-- Dropdown dinâmica para escolha do Spot da base de dados por ID -->
          <FormField label="ID do Spot">
            <FormControl
              v-model="form.selectedSpot"
              :options="spotsOptions"
              placeholder="Selecione o ID do spot"
              :icon="mdiMapMarker"
            />
          </FormField>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Data da Ocorrência">
              <FormControl
                v-model="form.data_ocorrencia"
                type="date"
                :icon="mdiCalendar"
              />
            </FormField>

            <FormField label="Hora da Ocorrência">
              <FormControl
                v-model="form.hora_ocorrencia"
                type="time"
                :icon="mdiClock"
              />
            </FormField>
          </div>


          <BaseDivider />

          <FormField label="Descrição da Ocorrência" help="Descreva detalhadamente o sucedido. Máx. 255 caracteres.">
            <FormControl
              v-model="form.descricao_ocorrencia"
              type="textarea"
              placeholder="Ex: O artista excedeu os limites de ruído estabelecidos após o fecho..."
            />
          </FormField>

          <template #footer>
            <BaseButtons>
              <BaseButton
                type="submit"
                color=""
                class="rounded-lg border-none bg-[#40798C] text-white hover:bg-[#0B2027] transition-all px-4 py-2 font-semibold dark:bg-teal-600 dark:hover:bg-teal-700"
                label="Registar Ocorrência"
              />
              <BaseButton
                type="reset"
                color=""
                class="rounded-lg border border-[#40798C] text-[#40798C] hover:bg-[#40798C] hover:text-white transition-all px-4 py-2 font-semibold bg-white dark:bg-slate-800 dark:text-teal-400 dark:border-teal-500/50 dark:hover:bg-slate-700"
                outline
                label="Limpar"
              />
            </BaseButtons>
          </template>
        </CardBox>
      </section>
    </div>
  </SectionMain>
</template>
