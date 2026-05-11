module.exports = (sequelize, DataTypes) => {
  const Reserva = sequelize.define('Reserva', {
    id_reserva: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_spot: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Spots',
        key: 'id_spot',
      },
    },
    id_artista: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Artistas',
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
  })
  Reserva.associate = (models) => {
    Reserva.belongsTo(models.Spot, {
      foreignKey: 'id_spot',
    })
    Reserva.belongsTo(models.Artista, {
      foreignKey: 'id_artista',
    })
  }
  return Reserva
}
