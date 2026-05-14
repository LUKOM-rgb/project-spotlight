<script setup>
import { containerMaxW } from '@/config.js'
import BaseLevel from '@/components/BaseLevel.vue'


const year = new Date().getFullYear()
</script>

<template>
  <footer class="px-6 py-2" :class="containerMaxW">
    <BaseLevel>
        <span class="text-sm text-gray-500">Copyright © {{ year }} Project Spotlight. All rights reserved.</span>
    </BaseLevel>
  </footer>
</template>
