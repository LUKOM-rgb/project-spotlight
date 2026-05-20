import express from 'express'
// Importamos explicitamente cada função usando chaves
import {
  createOcorrencia,
  getAllOcorrencias,
  getOcorrenciaById,
  updateEstadoOcorrencia,
  deleteOcorrencia
} from '../Controllers/ocorrencia.controller.js'

const router = express.Router()

// Passamos as funções diretamente (sem o prefixo do objeto)
router.post('/', createOcorrencia)
router.get('/', getAllOcorrencias)
router.get('/:id', getOcorrenciaById)
router.patch('/:id/estado', updateEstadoOcorrencia)
router.delete('/:id', deleteOcorrencia)

export default router
