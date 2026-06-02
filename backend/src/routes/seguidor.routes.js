import express from 'express';
import {
  seguirArtista,
  deixarSeguirArtista,
  getSeguidores
} from '../controllers/seguidor.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
const router = express.Router();

// Rotas de Seguidores (/api/seguidores)
router.get('/', verifyToken, getSeguidores);       // Mostrar seguidores ou quem segue (usar query params ?id_utilizador= ou ?id_artista=)
router.post('/', verifyToken, seguirArtista);      // Seguir artista (no body envia-se id_utilizador e id_artista)
router.delete('/', verifyToken, deixarSeguirArtista);  // Deixar de seguir artista (no body envia-se id_utilizador e id_artista)

export default router;
