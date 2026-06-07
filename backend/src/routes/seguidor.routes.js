import express from 'express';
import {
  seguirArtista,
  deixarSeguirArtista,
  getSeguidores
} from '../controllers/seguidor.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Rotas de Seguidores (/api/seguidores)
router.get('/', verifyToken, getSeguidores);       // Mostrar seguidores ou quem segue
router.post('/', verifyToken, seguirArtista);      // Seguir artista
router.delete('/:id_artista', verifyToken, deixarSeguirArtista);     //Apagar artista

export default router;
