import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'
const Conta_global = sequelize.define('Conta_global', {
  conta_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tipo: {
    type: DataTypes.ENUM('artista', 'utilizador'),
    allowNull: false,
  },
  data_registo: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  nome_utilizador: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  numero_telemovel: {
    type: DataTypes.STRING,
    allowNull: true,
  },
})

Conta_global.associate = (models) => {
  Conta_global.belongsTo(models.Artista, {
    foreignKey: 'id_artista',
  })
  Conta_global.belongsTo(models.Utilizador, {
    foreignKey: 'utilizador_id',
  })
  Conta_global.hasMany(models.Ocorrencia, {
    foreignKey: 'conta_id',
  })
}
export default Conta_global
