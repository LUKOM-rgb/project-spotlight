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
  });

  return Artista;
};
