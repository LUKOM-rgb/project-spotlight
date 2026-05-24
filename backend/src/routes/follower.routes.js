import express from 'express';
import { 
  followArtist,
  unfollowArtist,
  getFollowers
} from '../controllers/follower.controller.js';

const router = express.Router();

// Rotas de Seguidores (/api/followers)
router.get('/', getFollowers);       // Mostrar seguidores ou quem segue (usar query params ?id_conta= ou ?id_artista=)
router.post('/', followArtist);      // Seguir artista (no body envia-se id_conta e id_artista)
router.delete('/', unfollowArtist);  // Deixar de seguir artista (no body envia-se id_conta e id_artista)

export default router;
