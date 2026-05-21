import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

const Utilizador = sequelize.define(
  'Utilizador',
  {
    id_conta: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    nif: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: 'Utilizador',
    freezeTableName: true,
    timestamps: false,
  },
)
Utilizador.associate = (models) => {
  Utilizador.hasMany(models.Seguidor, {
    foreignKey: 'id_conta',
  })
}
export default Utilizador
