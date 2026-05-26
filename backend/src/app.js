import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()
import process from 'process'

// Importar ligação do Sequelize para a Base de Dados
import sequelize from './config/database.js'

// Importar as Rotas da API
import ocorrencias from './routes/ocorrencia.routes.js'
import spots from './routes/Spot.routes.js'
import reservas from './routes/Reservas.routes.js'

import userRoutes from './routes/user.routes.js'
import artistaRoutes from './routes/artista.routes.js'
import categoriaRoutes from './routes/categoria.routes.js'
import followerRoutes from './routes/follower.routes.js'

// Inicializar Associações dos Modelos
import './Models/db.js'

const app = express()
const port = process.env.PORT || 3000
const host = process.env.HOST || 'localhost'

// Middlewares Globais
app.use(cors())
app.use(express.json()) // Permite ler o Body em formato JSON enviado pelos clientes/Postman

// Registo de Rotas
app.use('/api/ocorrencias', ocorrencias)
app.use('/api/spots', spots)
app.use('/api/reservas', reservas)
app.use('/api/artistas', artistaRoutes)
app.use('/api/categorias', categoriaRoutes)
app.use('/api/followers', followerRoutes)

app.use('/api/users', userRoutes)

// Rota base de teste rápido para verificar no browser ou Postman se a API está online
app.get('/', (req, res) => {
  return res.status(200).json({
    message: 'API do Project Spotlight está a correr com sucesso!',
  })
})

// Middleware para endpoints não encontrados (404)
app.use((req, res, next) => {
  res.status(404).json({ message: 'Endpoint não encontrado' })
})

// Middleware Global de Tratamento de Erros (Consolidado e Robusto)
app.use((err, req, res, next) => {
  console.error(err)

  // Erro do middleware express.json() se o body não for JSON válido
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: 'Payload JSON inválido! Verifique se os dados estão no formato correto.',
      message: err.message,
    })
  }

  // Erros de Validação do Sequelize (todos os Modelos)
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      error: 'Erro de Validação',
      message: 'Os dados fornecidos não cumprem os requisitos do sistema.',
      details: err.errors.map((e) => ({
        field: e.path,
        message: e.message,
      })),
    })
  }

  // Erros de base de dados do Sequelize/MySQL
  if (err.name === 'SequelizeDatabaseError' && err.original) {
    if (err.original.code === 'ER_CHECK_CONSTRAINT_VIOLATED') {
      return res.status(400).json({
        error: 'Valor inválido para campo enumerado',
        message: err.message,
      })
    }
    if (err.original.code === 'ER_BAD_NULL_ERROR') {
      return res.status(400).json({
        error: 'Campo obrigatório em falta na base de dados',
        message: err.message,
      })
    }
    if (err.original.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        error: 'Registo duplicado',
        message: err.message,
      })
    }
  }

  // Outros erros personalizados ou de sistema
  const status = err.status || err.statusCode || 500
  const description = err.description || err.message || 'Internal Server Error'
  const errors = err.errors || null

  return res.status(status).json({
    error: description,
    message: err.message,
    details: errors,
  })
})

// Sincronização da Base de Dados e Inicialização do Servidor
sequelize
  .sync() // Sincroniza tabelas na BD se houver alterações nos Modelos
  .then(() => {
    console.log('✔ Database sincronizada com sucesso.')
    app.listen(port, host, () => {
      console.log(`✔ Server running on http://${host}:${port}`)
      console.log(`✔ Access: http://${host}:${port}/relatorios`)
    })
  })
  .catch((error) => {
    console.error('✖ Erro ao sincronizar a Base de Dados:', error)
  })

export default app
