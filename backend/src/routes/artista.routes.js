import express from 'express';
import { 
  createArtist,
  getAllArtists,
  getArtistById,
  updateArtist,
  deleteArtist
} from '../controllers/artista.controller.js';
import { verifyToken, isAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Rotas de Gestão de Artistas
router.post('/', createArtist);                                // Criar novo artista
router.get('/', getAllArtists);                                // Listar todos os artistas
router.get('/:id', getArtistById);                             // Info de um artista (Público)
router.put('/:id', updateArtist);                              // Atualizar dados do artista
router.delete('/:id', verifyToken, isAdmin, deleteArtist);     // Apagar artista (Admin)

export default router;
