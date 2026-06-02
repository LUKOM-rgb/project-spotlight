import axios from 'axios'

const api = axios.create({
  // Devido ao proxy no vite.config.js, todos os pedidos a /api vão para http://localhost:3000/api
  baseURL: '/api', 
  headers: {
    'Content-Type': 'application/json'
  }
})

// Adicionar um intercetor aos pedidos para injetar o Token JWT automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default api
