import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()
import process from 'process'

import ocorrenciaRoutes from './routes/ocorrenciaRoutes.js' // Nota: a extensão .js é obrigatória aqui!

const app = express()

// Middlewares
app.use(cors())
app.use(express.json())

// Registar as Rotas
app.use('/api/relatorios', ocorrenciaRoutes)

// Rota de Teste
app.get('/', (req, res) => {
  res.send('A API do Spotlight está a correr com ES Modules!')
})

// Start server
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Access: http://localhost:${PORT}/api/relatorios`)
})
