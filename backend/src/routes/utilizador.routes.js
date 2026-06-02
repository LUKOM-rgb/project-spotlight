import express from 'express';
import { 
  getAllUtilizadores, 
  getUtilizadorById, 
  getMyProfile,
  updateProfile, 
  deleteUtilizador,
  changeUtilizadorRole
} from '../controllers/utilizador.controller.js';
import { verifyToken, isAdmin } from '../middlewares/auth.middleware.js';
import { register, login } from '../controllers/auth.controller.js';

const router = express.Router();

// Rotas de Autenticação e Registo
router.post('/', register);                                          
router.post('/login', login);                                       

// Rotas de Gestão de Utilizadores e Perfis
router.get('/', getAllUtilizadores);                                         
router.get('/me', verifyToken, getMyProfile);
router.get('/:id', verifyToken, isAdmin, getUtilizadorById);                
router.patch('/me', verifyToken, updateProfile);                      
router.delete('/:id', verifyToken, isAdmin, deleteUtilizador);              

// Rotas de transição de Role (REST API)
router.patch('/:id/role', changeUtilizadorRole);                          

export default router;