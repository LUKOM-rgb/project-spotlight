import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'
const Conta_global = sequelize.define(
  'Conta_global',
  {
    id_conta: {
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
  },
  {
    tableName: 'Conta_global',
    freezeTableName: true,
    timestamps: false,
  },
)

Conta_global.associate = (models) => {
  Conta_global.belongsTo(models.Artista, {
    foreignKey: 'id_artista',
  })
  Conta_global.belongsTo(models.Utilizador, {
    foreignKey: 'id_conta',
  })
  Conta_global.hasMany(models.Ocorrencia, {
    foreignKey: 'id_conta',
  })
}
export default Conta_global
