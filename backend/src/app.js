import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()
import process from 'process'

// Importar ligação do Sequelize para a Base de Dados
import sequelize from './config/database.js'

// Importar as Rotas da API
import authRoutes from './routes/auth.routes.js' // CORREÇÃO 1: Importada a rota de auth
import ocorrencias from './routes/ocorrencia.routes.js'
import spots from './routes/spot.routes.js'
import reservas from './routes/reservas.routes.js'
import utilizadorRoutes from './routes/utilizador.routes.js'
import artistaRoutes from './routes/artista.routes.js'
import categoriaRoutes from './routes/categoria.routes.js'
import seguidorRoutes from './routes/seguidor.routes.js'

// Inicializar Associações dos Modelos
import './Models/db.js'

const app = express()
const port = process.env.PORT || 3000
const host = process.env.HOST || 'localhost'

// Middlewares Globais
app.use(cors())
app.use(express.json())

// Middleware para impedir pedidos PATCH com body vazio
app.use((req, res, next) => {
  if (req.method === 'PATCH') {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message:
          'O corpo do pedido (body) não pode estar vazio num pedido PATCH. Deves enviar pelo menos um campo para atualizar.',
      })
    }
  }
  next()
})

// Middleware para garantir que os parâmetros de ID são sempre numéricos
const validateIdParam = (req, res, next, id) => {
  if (isNaN(id)) {
    return res.status(400).json({
      error: 'Parâmetro Inválido',
      message: `O parâmetro enviado no URL (${id}) tem de ser um número válido.`,
    })
  }
  next()
}
app.param('id', validateIdParam)
app.param('id_artista', validateIdParam)
app.param('spotId', validateIdParam)
app.param('artistaId', validateIdParam)

// Registo de Rotas
app.use('/api/auth', authRoutes) // CORREÇÃO 1: Registada a rota de auth de forma independente
app.use('/api/ocorrencias', ocorrencias)
app.use('/api/spots', spots)
app.use('/api/reservas', reservas)
app.use('/api/artistas', artistaRoutes)
app.use('/api/categorias', categoriaRoutes)
app.use('/api/seguidores', seguidorRoutes)
app.use('/api/utilizadores', utilizadorRoutes)

// Rota base de teste
app.get('/', (req, res) => {
  return res.status(200).json({
    message: 'API do SpotLight está a correr com sucesso!',
  })
})

// Middleware para endpoints não encontrados (404)
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint não encontrado' })
})

// Middleware Global de Tratamento de Erros
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err)

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: 'Payload JSON inválido! Verifique se os dados estão no formato correto.',
      message: err.message,
    })
  }

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
  .sync({})
  .then(() => {
    console.log('- Database sincronizada com sucesso.')
    app.listen(port, host, () => {
      console.log(`- Server running on http://${host}:${port}`)
    })
  })
  .catch((error) => {
    console.error('- Erro ao sincronizar a Base de Dados:', error)
  })

export default app
