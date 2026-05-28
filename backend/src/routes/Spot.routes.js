import express from 'express';
import {
  getAllSpots,
  getSpotById,
  updateSpot,
  createSpot,
  deleteSpotById,
  createReserva
} from '../controllers/spot.controller.js';

  const router = express.Router();
router.get('/', getAllSpots)
router.get('/:id', getSpotById)
router.post('/', createSpot)
router.patch('/:id', updateSpot)
router.delete('/:id',deleteSpotById)
router.post('/:id/reservas', createReserva)
export default router;
