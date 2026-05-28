import sequelize from '../config/database.js'
import { Sequelize } from 'sequelize'

// models/db.js

import Artista from './artista.js'
import Utilizador from './utilizador.js'
import Categoria from './categorias.js'
import Seguidor from './seguidor.js'
import Ocorrencia from './ocorrencia.js'
import Spot from './spot.js'
import Reserva from './reservas.js'
const db = {
  sequelize,
  Sequelize,
  Artista,
  Utilizador,
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
