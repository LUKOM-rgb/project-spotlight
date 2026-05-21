import express from 'express'
import cors from 'cors'
import sequelize from './config/database.js'
import 'dotenv/config'
import ContaGlobal from './Models/ContaGlobal.js'
import Utilizador from './Models/Utilizador.js'
import Artista from './Models/Artista.js'
import Spot from './Models/Spot.js'
import Categorias from './Models/Categorias.js'
import Reservas from './Models/Reservas.js'
import Ocorrencia from './Models/Ocorrencia.js'
import Seguidor from './Models/Seguidor.js'
import authRoutes from './routes/auth.routes.js'
import userRoutes from './routes/user.routes.js'
import './Models/db.js'

const app = express()

// Middlewares Globais obligatórios para tratamento de pedidos
app.use(cors())
app.use(express.json()) // Permite ler o Body em formato JSON enviado pelo Postman

// Definição do Prefixo Base das Rotas da API
app.use('/api', authRoutes) // Disponibiliza /api/users e /api/users/login
app.use('/api/users', userRoutes)

// Rota base de teste rápido para verificar no Postman se a API está online
app.get('/', (req, res) => {
  return res.status(200).json({
    message: 'API do Project Spotlight está a correr com sucesso!',
  })
})

// Middleware Global de Tratamento de Erros (Formato padrão ESMAD)
// Captura qualquer erro lançado nos controladores (ex: next(error)) e responde em JSON
app.use((err, req, res, next) => {
  const status = err.status || 500
  const description = err.message || 'Internal Server Error'
  const errors = err.errors || {}

  console.error(`[Error ${status}]: ${description}`, errors)

  return res.status(status).json({
    description: description,
    errors: errors,
  })
})

// Sincronização da Base de Dados com o Sequelize
const PORT = process.env.PORT || 3000

sequelize
  .sync({ alter: true }) // Atualiza as tabelas na BD se houver alterações nos Modelos
  .then(() => {
    console.log('Database sincronizada com sucesso.')
  })
  .catch((error) => {
    console.error('Erro ao sincronizar a Base de Dados:', error)
  })

export default app
