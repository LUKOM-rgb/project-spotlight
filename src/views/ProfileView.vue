<script setup>
import { reactive } from 'vue'
import CardBox from '@/components/CardBox.vue'
import FormField from '@/components/FormField.vue'
import FormControl from '@/components/FormControl.vue'

const registerForm = reactive({
  name: '',
  email: '',
  password: '',
  isArtist: null,
  acceptLicense: false,
})

const setArtistStatus = (value) => {
  registerForm.isArtist = value
}

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
      <FormField label="E-mail:" label-class="text-gray-400 text-sm">
        <FormControl
          v-model="registerForm.email"
          type="email"
          name="email"
          class="rounded border-slate-600 bg-slate-700 text-white"
          required
        />
      </FormField>

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

      <!-- Are you an artist? -->
      <div class="mb-4">
        <label class="mb-2 block text-sm text-gray-400">Are you an artist?</label>
        <div class="flex gap-4">
          <button
            type="button"
            :class="[
              'rounded px-8 py-2 font-medium transition-colors',
              registerForm.isArtist === true
                ? 'bg-green-600 text-white'
                : 'bg-green-700/50 text-green-300 hover:bg-green-600',
            ]"
            @click="setArtistStatus(true)"
          >
            YES
          </button>
          <button
            type="button"
            :class="[
              'rounded px-8 py-2 font-medium transition-colors',
              registerForm.isArtist === false
                ? 'bg-red-600 text-white'
                : 'bg-red-700/50 text-red-300 hover:bg-red-600',
            ]"
            @click="setArtistStatus(false)"
          >
            NO
          </button>
        </div>
      </div>

      <!-- License checkbox -->
      <div class="mb-6">
        <label class="flex cursor-pointer items-center gap-2 text-sm text-gray-400">
          <span>License:</span>
          <input
            v-model="registerForm.acceptLicense"
            type="checkbox"
            class="h-4 w-4 rounded border-slate-600 bg-slate-700 text-teal-500 focus:ring-teal-500"
          />
        </label>
      </div>

      <!-- Botão Create Account -->
      <div class="mb-4 flex justify-center">
        <button
          type="submit"
          class="rounded bg-teal-600 px-6 py-3 text-white transition-colors hover:bg-teal-700"
        >
          Create<br />Account
        </button>
      </div>

      <!-- Link Login -->
      <p class="text-center text-sm text-gray-400">
        Already have an account?
        <router-link to="/login" class="text-teal-400 hover:text-teal-300"> Login! </router-link>
      </p>
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
