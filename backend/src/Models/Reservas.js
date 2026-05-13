import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'
const Reserva = sequelize.define(
  'Reserva',
  {
    id_reserva: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_spot: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Spot',
        key: 'id_spot',
      },
    },
    id_artista: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Artista',
        key: 'id_artista',
      },
    },
    data_emissao: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    data_evento: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    hora_inicio: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    hora_fim: {
      type: DataTypes.TIME,
      allowNull: false,
    },
  },
  {
    tableName: 'Reserva',
    freezeTableName: true,
    timestamps: false,
  },
)
Reserva.associate = (models) => {
  Reserva.belongsTo(models.Spot, {
    foreignKey: 'id_spot',
  })
  Reserva.belongsTo(models.Artista, {
    foreignKey: 'id_artista',
  })
}
export default Reserva
