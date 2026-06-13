import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/HomeView.vue'
import { useAuthStore } from '@/stores/auth.js'

const routes = [

  {
    meta: {
      title: 'Dashboard',
      requiresAuth: true
    },
    path: '/',
    name: 'dashboard',
    component: Home,
  },
  {
    meta: {
      title: 'Artistas',
      requiresAuth: true
    },
    path: '/artistas',
    name: 'artistas',
    component: () => import('@/views/ArtistasView.vue'),
  },
  {
    meta: {
      title: 'Registo Ocorrência',
      requiresAuth: true
    },
    path: '/ocorrencias',
    name: 'ocorrencias',
    component: () => import('@/views/RegistoOcorrenciaView.vue'),
  },
  {
    meta: {
      title: 'Profile',
      requiresAuth: true
    },
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/ProfileView.vue'),
  },
  {
    meta: {
      title: 'Spots',
      requiresAuth: true,
      requiresRole: ['artista', 'admin']
    },
    path: '/spots',
    name: 'spots',
    component: () => import('@/views/SpotsView.vue'),
  },
  {
  meta: {
      title: 'My Reservations',
      requiresAuth: true,
      requiresRole: ['artista', 'admin']
    },
    path: '/reservas/:id_artista',
    name: 'reservas',
    component: () => import('@/views/ReservasView.vue'),
  },

  {
    meta: {
      title: 'Login',
      guestOnly: true
    },
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
  },
  {
    meta: {
      title: 'Register',
      guestOnly: true
    },
    path: '/register',
    name: 'register',
    component: () => import('@/views/RegisterView.vue'),
  },
  {
    meta: {
      title: 'Error',
    },
    path: '/error',
    name: 'error',
    component: () => import('@/views/ErrorView.vue'),
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 }
  },
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Se o utilizador tem token mas ainda não tem os dados carregados na store
  if (authStore.token && !authStore.user) {
    await authStore.fetchUser()
  }

  const isAuthenticated = !!authStore.token

  // Rotas que exigem estar autenticado
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  }
  // Verificar roles
  else if (to.meta.requiresRole && isAuthenticated) {
    if (!to.meta.requiresRole.includes(authStore.user?.tipo)) {
      // Se não tiver permissão, volta para a página inicial
      next('/')
    } else {
      next()
    }
  }
  // Rotas exclusivas para não autenticados (ex: Login, Registar)
  else if (to.meta.guestOnly && isAuthenticated) {
    next('/')
  }
  else {
    if (to.meta.guestOnly) {
      const { useDarkModeStore } = await import('@/stores/darkMode.js')
      const darkModeStore = useDarkModeStore()
      darkModeStore.set(false)
    }
    next()
  }
})

export default router
