import express from 'express';
import { 
  createArtist,
  getAllArtists,
  getArtistById,
  updateArtist,
  deleteArtist,
  followArtist,
  unfollowArtist
} from '../controllers/artista.controller.js';

const router = express.Router();

// Rotas de Gestão de Artistas
router.post('/', createArtist);             // Criar novo artista
router.get('/', getAllArtists);             // Listar todos os artistas
router.get('/:id', getArtistById);          // Info de um artista
router.put('/:id', updateArtist);           // Atualizar dados do artista
router.delete('/:id', deleteArtist);        // Apagar artista

// Rotas de Seguir Artistas (agora orientadas ao artista alvo)
router.post('/:artistId/follow', followArtist);      // Seguir um artista
router.delete('/:artistId/follow', unfollowArtist);  // Deixar de seguir um artista

export default router;
