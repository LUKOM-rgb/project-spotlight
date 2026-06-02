<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import CardBox from '@/components/CardBox.vue'
import FormField from '@/components/FormField.vue'
import FormControl from '@/components/FormControl.vue'

const authStore = useAuthStore()
const router = useRouter()

const registerForm = reactive({
  nome_utilizador: '',
  email: '',
  password: '',
})

const errorMessage = ref('')
const successMessage = ref('')
const isLoading = ref(false)

const submitRegister = async () => {
  try {
    errorMessage.value = ''
    successMessage.value = ''
    isLoading.value = true
    await authStore.register(registerForm)
    successMessage.value = 'Conta criada com sucesso! A redirecionar para o login...'
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } catch (error) {
    errorMessage.value = error.response?.data?.error || 'Erro ao criar conta. Verifique os dados introduzidos.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-amber-50 p-4">
    <CardBox
      class="w-full max-w-md rounded-lg bg-slate-800 shadow-xl"
      is-form
      @submit.prevent="submitRegister"
    >
      <!-- Título -->
      <h1 class="mb-8 text-center text-3xl font-light tracking-widest text-teal-400">SPOTLIGHT REGISTO</h1>

      <!-- Mensagens -->
      <div v-if="errorMessage" class="mb-4 rounded bg-red-500/10 p-3 text-red-500 text-sm border border-red-500/20 text-center">
        {{ errorMessage }}
      </div>
      <div v-if="successMessage" class="mb-4 rounded bg-green-500/10 p-3 text-green-500 text-sm border border-green-500/20 text-center">
        {{ successMessage }}
      </div>

      <!-- Campo Nome -->
      <FormField label="Nome de Utilizador:" label-class="text-gray-400 text-sm">
        <FormControl
          v-model="registerForm.nome_utilizador"
          name="nome_utilizador"
          class="rounded border-slate-600 bg-slate-700 text-teal-400"
          required
        />
      </FormField>

      <!-- Campo E-mail -->
      <FormField label="Email:" label-class="text-gray-400 text-sm">
        <FormControl
          v-model="registerForm.email"
          type="email"
          name="email"
          class="rounded border-slate-600 bg-slate-700 text-teal-400"
          required
        />
      </FormField>

      <!-- Campo Password -->
      <FormField label="Password:" label-class="text-gray-400 text-sm">
        <FormControl
          v-model="registerForm.password"
          type="password"
          name="password"
          class="rounded border-slate-600 bg-slate-700 text-teal-400"
          required
        />
      </FormField>

      <!-- Botão Registo -->
      <div class="mb-4 mt-6 flex flex-col items-center gap-4">
        <button
          type="submit"
          :disabled="isLoading"
          class="w-full rounded bg-teal-600 px-6 py-3 text-white transition-colors hover:bg-teal-700 disabled:opacity-50"
        >
          {{ isLoading ? 'A registar...' : 'Criar Conta' }}
        </button>
        
        <router-link to="/login" class="text-sm text-teal-400 hover:text-teal-300 transition-colors">
          Já tem conta? Faça login aqui.
        </router-link>
      </div>
    </CardBox>
  </div>
</template>

<style scoped>
/* Estilos adicionais se necessário */
input[type='text'],
input[type='email'],
input[type='password'] {
  background-color: rgb(55, 65, 81);
  border-color: rgb(30, 41, 59);
  color: #2dd4bf; /* text-teal-400 */
}
</style>
