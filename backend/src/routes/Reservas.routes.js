import express from 'express'
import {
  getAllReservas,
  getReservaById,
  getReservasBySpotId,
  getReservasByArtistaId,
  deleteReservaById,
  updateReservaById,
  createReserva,
} from '../controllers/reservas.controller.js'
const router = express.Router()
import { verifyToken, isArtista } from '../middlewares/auth.middleware.js';
router.get('/', getAllReservas)
router.get('/:id', getReservaById)
router.get('/spot/:spotId', getReservasBySpotId,verifyToken)
router.get('/artista/:artistaId', getReservasByArtistaId,verifyToken)
router.delete('/:id', verifyToken, isArtista, deleteReservaById)
router.patch('/:id', verifyToken, isArtista, updateReservaById)
router.post('/:id/', verifyToken,isArtista, createReserva)
export default router
