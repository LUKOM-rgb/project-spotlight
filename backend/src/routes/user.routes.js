import express from 'express';
import { 
  getAllUsers, 
  getUserById, 
  updateUser, 
  deleteUser,
  changeUserRole
} from '../controllers/user.controller.js';
import { verifyToken, isAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Rotas de Gestão de Utilizadores e Perfis
router.get('/', getAllUsers);                                         // Mostrar todos (com filtros na query)
router.get('/:id', verifyToken, isAdmin, getUserById);                // Mostrar info de um específico (Admin)
router.put('/:id', updateUser);                                       // Mudar dados básicos de utilizador
router.delete('/:id', verifyToken, isAdmin, deleteUser);              // Apagar utilizador (Admin)

// Rotas de transição de Role (REST API)
router.patch('/:id/role', changeUserRole);                            // Mudar role (tipo) da conta

// (Rotas de artistas foram removidas e movidas para /api/artistas)

export default router;