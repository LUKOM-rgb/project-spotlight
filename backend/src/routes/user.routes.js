import express from 'express';
import { 
  getAllUsers, 
  getUserById, 
  updateProfile, 
  deleteUser,
  changeUserRole
} from '../controllers/user.controller.js';
import { verifyToken, isAdmin } from '../middlewares/auth.middleware.js';
import { register, login } from '../controllers/auth.controller.js';

const router = express.Router();

// Rotas de Autenticação e Registo
router.post('/', register);                                           // Registar utilizador (POST /users)
router.post('/login', login);                                         // Login utilizador (POST /users/login)

// Rotas de Gestão de Utilizadores e Perfis
router.get('/', getAllUsers);                                         // Mostrar todos (com filtros na query)
router.get('/:id', verifyToken, isAdmin, getUserById);                // Mostrar info de um específico (Admin)
router.patch('/me', verifyToken, updateProfile);                      // Mudar dados do próprio perfil
router.delete('/:id', verifyToken, isAdmin, deleteUser);              // Apagar utilizador (Admin)

// Rotas de transição de Role (REST API)
router.patch('/:id/role', changeUserRole);                            // Mudar role (tipo) da conta

// (Rotas de artistas foram removidas e movidas para /api/artistas)

export default router;