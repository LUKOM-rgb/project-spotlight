module.exports = (sequelize, DataTypes) => {
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
  });
  return Utilizador;
};

