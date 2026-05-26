import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'
const Seguidor = sequelize.define(
  'Seguidor',
  {
    id_conta: {
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
    tableName: 'Seguidor',
    freezeTableName: true,
    timestamps: false,
  },
)
Seguidor.associate = (models) => {
  Seguidor.belongsTo(models.Artista, {
    foreignKey: 'id_artista',
  })
}
export default Seguidor
