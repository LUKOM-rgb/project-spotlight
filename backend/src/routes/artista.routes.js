import express from 'express';
import {
  createArtist,
  getAllArtists,
  getArtistById,
  updateArtist,
  deleteArtist,
  getTopArtists
} from '../controllers/artista.controller.js';
import { verifyToken, isAdmin, isArtista,isUtilizador } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Rotas de Gestão de Artistas
router.post('/',verifyToken, isUtilizador,createArtist); // Criar novo artista
router.get('/', getAllArtists); // Listar todos os artistas
router.get('/top', getTopArtists); // Obter o top 3 artistas
router.get('/:id_artista', getArtistById); // Info de um artista (Público)
router.patch('/me', verifyToken, isArtista, updateArtist);   // Atualizar dados do artista(Artista)
router.patch('/:id_artista', verifyToken, isAdmin, updateArtist);     // Atualizar dados do artista (Admin)
router.delete('/:id_artista', verifyToken, isAdmin, deleteArtist);   // Apagar artista (Admin)

export default router;
