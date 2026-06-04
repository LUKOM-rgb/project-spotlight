import express from 'express'
import {
  getAllSpots,
  getSpotById,
  updateSpot,
  createSpot,
  deleteSpotById,

} from '../controllers/spot.controller.js'
import { verifyToken, isAdmin} from '../middlewares/auth.middleware.js'
const router = express.Router()
router.get('/', verifyToken, getAllSpots)
router.get('/:id', verifyToken, getSpotById)
router.post('/', verifyToken, isAdmin, createSpot)
router.patch('/:id', verifyToken, isAdmin, updateSpot)
router.delete('/:id', verifyToken, isAdmin, deleteSpotById)


export default router
