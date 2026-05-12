import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'
const Seguidor = sequelize.define(
  'Seguidor',
  {
    utilizador_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    id_artista: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    data_inicio: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
)
Seguidor.associate = (models) => {
  Seguidor.belongsTo(models.Utilizador, {
    foreignKey: 'utilizador_id',
  })
  Seguidor.belongsTo(models.Artista, {
    foreignKey: 'id_artista',
  })
}
export default Seguidor
