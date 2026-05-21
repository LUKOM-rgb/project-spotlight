import express from 'express';
import { 
  getAllUsers, 
  getUserById, 
  updateUser, 
  deleteUser, 
  becomeArtist,
  updateArtistData,
  followArtist,
  unfollowArtist
} from '../controllers/user.controller.js';

const router = express.Router();

// Rotas de Gestão de Utilizadores e Perfis
router.get('/', getAllUsers);                       // Mostrar todos (com filtros na query)
router.get('/:id', getUserById);                    // Mostrar info de um específico
router.put('/:id', updateUser);                     // Mudar dados básicos de utilizador
router.delete('/:id', deleteUser);                  // Apagar utilizador

// Rotas específicas do domínio de Artistas
router.post('/:id/become-artist', becomeArtist);    // Definir que este utilizador passa a ser artista
router.put('/:id/artist-profile', updateArtistData); // Alterar os dados do artista

// Rotas de Seguir Artistas
router.post('/:id/follow/:artistId', followArtist);    // Seguir um artista
router.delete('/:id/follow/:artistId', unfollowArtist); // Deixar de seguir um artista

export default router;