module.exports = (sequelize, DataTypes) => {
  const Seguidor = sequelize.define('Seguidor', {
    data_inicio: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    id_utilizador: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Utilizadores',
        key: 'utilizador_id',
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
  })
  Seguidor.associate = (models) => {
    Seguidor.belongsTo(models.Utilizador, {
      foreignKey: 'id_utilizador',
    })
    Seguidor.belongsTo(models.Artista, {
      foreignKey: 'id_artista',
    })
  }
  return Seguidor
}
