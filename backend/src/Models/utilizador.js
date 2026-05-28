import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'
const Utilizador = sequelize.define(
  'Utilizador',
  {
    id_utilizador: {
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
      type: DataTypes.ENUM('artista', 'utilizador', 'admin'),
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
    id_artista: {
      type: DataTypes.INTEGER,
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
  Utilizador.belongsTo(models.Artista, {
    foreignKey: 'id_artista',
  })
  Utilizador.hasMany(models.Ocorrencia, {
    foreignKey: 'id_utilizador',
  })
}
export default Utilizador
