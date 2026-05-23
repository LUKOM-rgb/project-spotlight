import jwt from 'jsonwebtoken';
import process from 'process';
import { unauthorizedError } from '../utilis/error.utils.js';

const JWT_SECRET = process.env.JWT_SECRET || 'chave_secreta_super_segura_esmad';

// Middleware para verificar se o utilizador está autenticado (tem um token válido)
export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw unauthorizedError('Acesso negado. Token não fornecido.');
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Guarda as informações do token (ex: role, email, id) no req.user

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(unauthorizedError('O token expirou. Faz login novamente.'));
    }
    return next(unauthorizedError('Token inválido.'));
  }
};

// Middleware para verificar se o utilizador tem a role de 'admin'
export const isAdmin = (req, res, next) => {
  if (!req.user) {
    return next(unauthorizedError('Utilizador não autenticado.'));
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Acesso Proibido',
      message: 'Apenas administradores têm permissão para realizar esta ação.'
    });
  }

  next();
};
