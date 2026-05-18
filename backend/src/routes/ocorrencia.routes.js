import express from 'express'
import ocorrenciaController from '../controllers/ocorrenciaController.js'

const router = express.Router()

router.post('/', ocorrenciaController.createRelatorio)
router.get('/', ocorrenciaController.getAllRelatorios)
router.get('/:id', ocorrenciaController.getRelatorioById)
router.patch('/:id/estado', ocorrenciaController.updateEstadoRelatorio)
router.delete('/:id', ocorrenciaController.deleteRelatorio)

export default router
