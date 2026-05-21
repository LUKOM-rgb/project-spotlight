import sequelize from '../config/database.js'
import { Sequelize } from 'sequelize'

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

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Em vez de module.exports = db, use:
export default db;
