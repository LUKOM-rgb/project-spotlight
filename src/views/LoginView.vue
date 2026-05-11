<script setup>
import { reactive } from 'vue'
import CardBox from '@/components/CardBox.vue'
import FormField from '@/components/FormField.vue'
import FormControl from '@/components/FormControl.vue'

const registerForm = reactive({
  name: '',
  password: '',
  isArtist: null,
  acceptLicense: false,
})

const submitRegister = () => {
  console.log('Register form submitted:', registerForm)
  // Lógica de registo aqui
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
      <h1 class="mb-8 text-center text-3xl font-light tracking-widest text-teal-400">SPOTLIGHT</h1>

      <!-- Campo Name -->
      <FormField label="Name:" label-class="text-gray-400 text-sm">
        <FormControl
          v-model="registerForm.name"
          name="name"
          class="rounded border-slate-600 bg-slate-700 text-white"
          required
        />
      </FormField>

      <!-- Campo E-mail -->

      <!-- Campo Password -->
      <FormField label="Password:" label-class="text-gray-400 text-sm">
        <FormControl
          v-model="registerForm.password"
          type="password"
          name="password"
          class="rounded border-slate-600 bg-slate-700 text-white"
          required
        />
      </FormField>

      <!-- Botão Create Account -->
      <div class="mb-4 flex justify-center">
        <button
          type="submit"
          class="rounded bg-teal-600 px-6 py-3 text-white transition-colors hover:bg-teal-700"
        >
          Create<br />Account
        </button>
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
  color: white;
}
</style>
