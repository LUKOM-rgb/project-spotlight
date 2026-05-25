import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'
const Ocorrencia = sequelize.define(
  'Ocorrencia',
  {
    id_ocorrencia: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    data_ocorrencia: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    hora_ocorrencia: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    local_ocorrencia: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    descricao_ocorrencia: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    estado_ocorrencia: {
      type: DataTypes.ENUM('pendente', 'resolvida', 'em progresso'),
      allowNull: false,
    },
    id_conta: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Conta_global',
        key: 'id_conta',
      },
    },
    id_spot: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Spot',
        key: 'id_spot',
      },
    },
  },
  {
    tableName: 'Ocorrencia',
    freezeTableName: true,
    timestamps: false,
  },
)
Ocorrencia.associate = (models) => {
  Ocorrencia.belongsTo(models.Conta_global, {
    foreignKey: 'id_conta',
  })
  Ocorrencia.belongsTo(models.Spot, {
    foreignKey: 'id_spot',
  })
}
export default Ocorrencia
