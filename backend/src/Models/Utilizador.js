import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

const Utilizador = sequelize.define('Utilizador', {
  utilizador_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nif: {
    type: DataTypes.STRING,
    allowNull: false,
  },
})
Utilizador.associate = (models) => {
  Utilizador.hasMany(models.Seguidor, {
    foreignKey: 'utilizador_id',
  })
  Utilizador.belongsTo(models.Conta_global, {
    foreignKey: 'conta_id',
  })
}
export default Utilizador
