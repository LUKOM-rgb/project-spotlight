import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
// useMainStore apagado

import './css/main.css'

// Init Pinia
const pinia = createPinia()

// Create Vue app
const app = createApp(App)
app.use(pinia)
app.use(router)
app.mount('#app')

// Init main store apagado

// Fetch sample data removido

// Dark mode
// Dark mode
import { useDarkModeStore } from '@/stores/darkMode.js'

const darkModeStore = useDarkModeStore(pinia)

if (localStorage.getItem('darkMode') === '1') {
  darkModeStore.set(true)
} else {
  darkModeStore.set(false)
}



// Set document title from route meta
router.afterEach((to) => {
  document.title = to.meta?.title
    ? `${to.meta.title}`
    : "Spotlight"
})
