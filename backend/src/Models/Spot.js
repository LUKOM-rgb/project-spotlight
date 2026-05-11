module.exports = (sequelize, DataTypes) => {
  const Spot = sequelize.define('Spot', {
    id_spot: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    localizacao: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    longitude: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    latitude: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    abertura: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    fecho: {
      type: DataTypes.TIME,
      allowNull: false,
    },});

  return Spot;
};
