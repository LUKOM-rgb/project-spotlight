import sequelize from './config/database.js'
import Utilizador from './Models/Utilizador.js'
import Artista from './Models/Artista.js'
import Conta_global from './Models/ContaGlobal.js'
import Categoria from './Models/Categorias.js'
import Seguidor from './Models/Seguidor.js'
import Ocorrencia from './Models/Ocorrencia.js'
import Spot from './Models/Spot.js'
import Reserva from './Models/Reservas.js'

const models = {
  Utilizador,
  Artista,
  Conta_global,
  Categoria,
  Seguidor,
  Ocorrencia,
  Spot,
  Reserva,
}


try {
  await sequelize.authenticate()
  console.log('Database connected.')

  // IMPORTANT: run associations
  Object.values(models).forEach((model) => {
    if (model.associate) {
      model.associate(models)
    }
  })

  await sequelize.sync({ force: true })
  console.log('Tables created.')
} catch (error) {
  console.error(error)
}
