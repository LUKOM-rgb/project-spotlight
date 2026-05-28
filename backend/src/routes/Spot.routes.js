import express from 'express';
import {
  getAllSpots,
  getSpotById,
  updateSpot,
  createSpot,
  deleteSpotById,
  createReserva
} from '../controllers/spot.controller.js';
import { verifyToken, isAdmin } from '../middlewares/auth.middleware.js';
  const router = express.Router();
router.get('/', getAllSpots)
router.get('/:id', getSpotById)
router.post('/', verifyToken, createSpot,isAdmin)
router.patch('/:id', verifyToken, updateSpot, isAdmin)
router.delete('/:id', verifyToken, deleteSpotById, isAdmin)
router.post('/:id/reservas', verifyToken, createReserva)
export default router;
