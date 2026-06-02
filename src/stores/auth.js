import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api/axios.js'
import { useRouter } from 'vue-router'
import { useMainStore } from './main.js'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null)
  const user = ref(null) // Para guardar dados do utilizador logado
  const router = useRouter()
  const mainStore = useMainStore()

  // Define o token no estado local e no localStorage
  function setToken(newToken) {
    token.value = newToken
    if (newToken) {
      localStorage.setItem('token', newToken)
    } else {
      localStorage.removeItem('token')
    }
  }

  // Faz login na API Real
  async function login(email, password) {
    try {
      const response = await api.post('/utilizadores/login', { email, password })
      
      if (response.data && response.data.token) {
        setToken(response.data.token)
        
        // Em muitas APIs, o login devolve o user, ou precisas de ir buscar em /me
        // Vamos chamar a função /me para carregar os dados
        await fetchUser()
        return true
      }
    } catch (error) {
      console.error('Erro no login:', error.response?.data?.error || error.message)
      throw error
    }
  }

  // Regista na API Real
  async function register(payload) {
    try {
      const response = await api.post('/utilizadores', payload)
      return response.data
    } catch (error) {
      console.error('Erro no registo:', error.response?.data?.error || error.message)
      throw error
    }
  }

  // Busca dados do perfil do utilizador autenticado
  async function fetchUser() {
    try {
      if (!token.value) return;

      const response = await api.get('/utilizadores/me')
      const userData = response.data

      user.value = userData
      
      // Atualizar no mainStore para o ecrã mostrar o email/nome
      mainStore.setUser({
        name: userData.nome_utilizador || userData.email.split('@')[0],
        email: userData.email,
        avatar: 'https://ui-avatars.com/api/?name=' + (userData.nome_utilizador || userData.email) + '&background=0D8ABC&color=fff'
      })

    } catch (error) {
      console.error('Erro ao ler utilizador:', error)
      logout()
    }
  }

  function logout() {
    setToken(null)
    user.value = null
    // Redirecionar para login
    window.location.href = '/login'
  }

  return {
    token,
    user,
    setToken,
    login,
    register,
    fetchUser,
    logout
  }
})
