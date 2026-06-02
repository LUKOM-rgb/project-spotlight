<script setup>
import SectionMain from '@/components/SectionMain.vue'
import CardBox from '@/components/CardBox.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseButtons from '@/components/BaseButtons.vue'
import Navbar from '@/components/NavBar.vue'
</script>

<template>
  <SectionMain class="min-h-screen bg-[#f5f0e6] flex flex-col justify-center items-center">
    <Navbar />
    
    <div class="mt-20">
      <CardBox class="w-full max-w-md shadow-xl text-center">
        <div class="space-y-4 py-8">
          <h1 class="text-4xl font-bold text-red-500">404</h1>
          <h2 class="text-xl text-gray-700">Página Não Encontrada</h2>
          <p class="text-gray-500">A página que procuras não existe ou foi movida.</p>
        </div>

        <template #footer>
          <BaseButtons class="justify-center">
            <BaseButton label="Voltar ao Início" to="/" class="bg-[#40798C] hover:bg-[#0B2027] text-white border-none rounded-lg font-semibold px-6" />
          </BaseButtons>
        </template>
      </CardBox>
    </div>
  </SectionMain>
</template>
