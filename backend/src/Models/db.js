// models/db.js

import { Sequelize } from 'sequelize'
import dotenv from 'dotenv'
dotenv.config()
// Inicialização da conexão
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    logging: false
  });

// models/db.js

import Utilizador from './Utilizador.js'
import Artista from './Artista.js'
import Conta_global from './ContaGlobal.js'
import Categoria from './Categorias.js'
import Seguidor from './Seguidor.js'
import Ocorrencia from './Ocorrencia.js'
import Spot from './Spot.js'
import Reserva from './Reservas.js'
const db = {
  sequelize,
  Sequelize,
  Utilizador,
  Artista,
  Conta_global,
  Categoria,
  Seguidor,
  Ocorrencia,
  Spot,
  Reserva,
}

// Verifica e aplica associações se existirem


if (process.env.NODE_ENV !== 'test') {
  sequelize.sync({ alter: true });
}

// Em vez de module.exports = db, use:
export default db;
