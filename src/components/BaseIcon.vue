<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  path: {
    type: String,
    required: true,
  },
  w: {
    type: String,
    default: 'w-6',
  },
  h: {
    type: String,
    default: 'h-6',
  },
  size: [String, Number],
  to: {
    type: [String, Object],
    default: null,
  },
})

const router = useRouter()

const spanClass = computed(() => `inline-flex justify-center items-center ${props.w} ${props.h}`)

const iconSize = computed(() => props.size ?? 16)

const handleClick = () => {
  if (props.to) {
    router.push(props.to)
  }
}
</script>

<template>
  <span :class="[spanClass, { 'cursor-pointer hover:opacity-80': to }]" @click="handleClick">
    <svg viewBox="0 0 24 24" :width="iconSize" :height="iconSize" class="inline-block">
      <path fill="currentColor" :d="path" />
    </svg>
    <slot />
  </span>
</template>
