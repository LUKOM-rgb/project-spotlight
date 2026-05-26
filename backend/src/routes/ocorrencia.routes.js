import express from 'express'
// Importamos explicitamente cada função usando chaves
import {
  createOcorrencia,
  getAllOcorrencias,
  getOcorrenciaById,
  updateEstadoOcorrencia,
  deleteOcorrencia
} from '../controllers/ocorrencia.controller.js'
import { verifyToken, isAdmin } from '../middlewares/auth.middleware.js'

const router = express.Router()

// Apenas administradores podem ver, alterar, adicionar e eliminar relatórios de ocorrências
router.post('/', verifyToken, isAdmin, createOcorrencia)
router.get('/', verifyToken, isAdmin, getAllOcorrencias)
router.get('/:id', verifyToken, isAdmin, getOcorrenciaById)
router.patch('/:id/', verifyToken, isAdmin, updateEstadoOcorrencia)
router.delete('/:id', verifyToken, isAdmin, deleteOcorrencia)

export default router
