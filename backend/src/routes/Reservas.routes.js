import express from 'express'
import {
  getAllReservas,
  getReservaById,
  getReservasBySpotId,
  getReservasByArtistaId,
  deleteReservaById,
  getreservasBySpotIdAndDate,
  updateReservaById
} from '../controllers/Reservas.controller.js'
const router = express.Router()

router.get('/', getAllReservas)
router.get('/:id', getReservaById)
router.get('/spot/:spotId', getReservasBySpotId)
router.get('/artista/:artistaId', getReservasByArtistaId)
router.delete('/:id', deleteReservaById)
router.patch('/:id', updateReservaById)

export default router
