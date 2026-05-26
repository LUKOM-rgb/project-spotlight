import express from 'express'
// Importamos explicitamente cada função usando chaves
import {
  createOcorrencia,
  getAllOcorrencias,
  getOcorrenciaById,
  updateEstadoOcorrencia,
  deleteOcorrencia,
} from '../controllers/ocorrencia.controller.js'

const router = express.Router()

// Apenas administradores podem ver, alterar, adicionar e eliminar relatórios de ocorrências
router.post('/', createOcorrencia)
router.get('/', getAllOcorrencias)
router.get('/:id', getOcorrenciaById)
router.patch('/:id/', updateEstadoOcorrencia)
router.delete('/:id', deleteOcorrencia)

export default router
