module.exports = (sequelize, DataTypes) => {
  const Artista = sequelize.define('Artista', {
    numero_licenca: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    validade_licenca: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    id_artista: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    categoria_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Categorias',
        key: 'categoria_id',
      },
    },
  })
  Artista.associate = (models) => {
    Artista.hasOne(models.Categoria, {
      foreignKey: 'categoria_id',
    })
  }
  // Acho que não é isso
  Artista.associate = (models) => {
    Artista.hasOne(models.Conta_global, {
      foreignKey: 'conta_id',
    })
    Artista.hasMany(models.Seguidor, {
      foreignKey: 'id_artista',
    })
    Artista.hasMany(models.Reserva, {
      foreignKey: 'id_artista',
    })
  }
  return Artista
}
