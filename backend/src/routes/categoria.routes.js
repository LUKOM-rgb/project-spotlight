import express from 'express';
import {
  createCategoria,
  deleteCategoria,
  getAllCategorias,
  getArtistasByCategoria
} from '../controllers/categoria.controller.js';
import { verifyToken, isAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Rotas de Gestão de Categorias
router.post('/', verifyToken, isAdmin, createCategoria);             // Criar nova categoria (Apenas Admin)
router.get('/', getAllCategorias);                                   // Listar todas as categorias (Público/Todos)
router.delete('/:id', verifyToken, isAdmin, deleteCategoria);        // Apagar categoria (Apenas Admin)
router.get('/:id/artistas', getArtistasByCategoria);                 // Ver os artistas de uma categoria (Público/Todos)

export default router;
