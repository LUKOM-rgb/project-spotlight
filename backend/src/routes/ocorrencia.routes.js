import express from 'express'
// Importamos explicitamente cada função usando chaves
import {
  createRelatorio,
  getAllRelatorios,
  getRelatorioById,
  updateEstadoRelatorio,
  deleteRelatorio
} from '../Controllers/ocorrencia.controller.js'

const router = express.Router()

// Passamos as funções diretamente (sem o prefixo do objeto)
router.post('/', createRelatorio)
router.get('/', getAllRelatorios)
router.get('/:id', getRelatorioById)
router.patch('/:id/estado', updateEstadoRelatorio)
router.delete('/:id', deleteRelatorio)

export default router
