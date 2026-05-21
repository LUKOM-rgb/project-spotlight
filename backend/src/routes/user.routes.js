import express from 'express';
import { 
  getAllUsers, 
  getUserById, 
  updateUser, 
  deleteUser
} from '../controllers/user.controller.js';

const router = express.Router();

// Rotas de Gestão de Utilizadores e Perfis
router.get('/', getAllUsers);                       // Mostrar todos (com filtros na query)
router.get('/:id', getUserById);                    // Mostrar info de um específico
router.put('/:id', updateUser);                     // Mudar dados básicos de utilizador
router.delete('/:id', deleteUser);                  // Apagar utilizador

// (Rotas de artistas foram removidas e movidas para /api/artistas)

export default router;