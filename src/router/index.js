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
      title: 'Tables',
      requiresAuth: true
    },
    path: '/tables',
    name: 'tables',
    component: () => import('@/views/TablesView.vue'),
  },
  {
    meta: {
      title: 'Forms',
      requiresAuth: true
    },
    path: '/forms',
    name: 'forms',
    component: () => import('@/views/FormsView.vue'),
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
      requiresAuth: true
    },
    path: '/spots',
    name: 'spots',
    component: () => import('@/views/SpotsView.vue'),
  },
  {
  meta: {
      title: 'My Reservations',
    },
    path: '/reservas',
    name: 'reservas',
    component: () => import('@/views/ReservasView.vue'),
  },
  {
    meta: {
      title: 'Responsive layout',
      requiresAuth: true
    },
    path: '/responsive',
    name: 'responsive',
    component: () => import('@/views/ResponsiveView.vue'),
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
  },
  {
    meta: {
      title: 'Error',
    },
    path: '/error',
    name: 'error',
    component: () => import('@/views/PerfiladminView.vue'),
  },
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

  // Rotas que exigem estar autenticado (placeholder para o futuro, para já protege a dashboard)
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } 
  // Rotas exclusivas para não autenticados (ex: Login, Registar)
  else if (to.meta.guestOnly && isAuthenticated) {
    next('/')
  } 
  else {
    next()
  }
})

export default router
