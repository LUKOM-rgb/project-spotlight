<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import CardBox from '@/components/CardBox.vue'
import FormField from '@/components/FormField.vue'
import FormControl from '@/components/FormControl.vue'

const authStore = useAuthStore()
const router = useRouter()

const loginForm = reactive({
  identifier: '',
  password: '',
})

const errorMessage = ref('')
const isLoading = ref(false)

const submitLogin = async () => {
  try {
    errorMessage.value = ''
    isLoading.value = true
    await authStore.login(loginForm.identifier, loginForm.password)
    router.push('/') // Redirect to dashboard after login
  } catch (error) {
    const data = error.response?.data
    if (data?.details) {
      const firstKey = Object.keys(data.details)[0]
      errorMessage.value = data.details[firstKey][0]
    } else {
      errorMessage.value = data?.error || 'Erro ao efetuar login. Verifique as suas credenciais.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-amber-50 dark:bg-slate-900 transition-colors duration-300 p-4">
    <CardBox
      class="w-full max-w-md rounded-lg shadow-xl dark:bg-slate-800"
      is-form
      @submit.prevent="submitLogin"
    >
      <!-- Título -->
      <h1 class="mb-8 text-center text-3xl font-light tracking-widest text-teal-400">SPOTLIGHT LOGIN</h1>

      <!-- Mensagem de Erro -->
      <div v-if="errorMessage" class="mb-4 rounded bg-red-500/10 p-3 text-red-500 text-sm border border-red-500/20 text-center">
        {{ errorMessage }}
      </div>

      <!-- Campo Identificador -->
      <FormField label="Email ou Nome de Utilizador:" label-class="text-teal-400 text-sm font-semibold">
        <FormControl
          v-model="loginForm.identifier"
          type="text"
          name="identifier"
          input-class="rounded border-teal-400 text-teal-600 focus:border-teal-500 focus:ring-teal-500"
          required
        />
      </FormField>

      <!-- Campo Password -->
      <FormField label="Password:" label-class="text-teal-400 text-sm font-semibold">
        <FormControl
          v-model="loginForm.password"
          type="password"
          name="password"
          input-class="rounded border-teal-400 text-teal-600 focus:border-teal-500 focus:ring-teal-500"
          required
        />
      </FormField>

      <!-- Botão Login -->
      <div class="mb-4 mt-6 flex flex-col items-center gap-4">
        <button
          type="submit"
          :disabled="isLoading"
          class="w-full rounded bg-teal-600 px-6 py-3 text-white transition-colors hover:bg-teal-700 disabled:opacity-50"
        >
          {{ isLoading ? 'A carregar...' : 'Entrar' }}
        </button>
        
        <router-link to="/register" class="text-sm text-teal-400 hover:text-teal-300 transition-colors">
          Não tem conta? Registe-se aqui.
        </router-link>
      </div>
    </CardBox>
  </div>
</template>
