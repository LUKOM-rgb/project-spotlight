import express from 'express'
import {
  getAllReservas,
  getReservaById,
  getReservasBySpotId,
  getReservasByArtistaId,
  deleteReservaById
} from '../Controllers/Reservas.controller.js'
const router = express.Router()

router.get('/', getAllReservas)
router.get('/:id', getReservaById)
router.get('/spot/:spotId', getReservasBySpotId)
router.get('/artista/:artistaId', getReservasByArtistaId)
router.delete('/:id', deleteReservaById)

export default router
