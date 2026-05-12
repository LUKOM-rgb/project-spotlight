import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'
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

    Spot.associate=(models=>{
      Spot.hasMany(models.Reserva,{
        foreignKey:'id_spot',
      })
      Spot.hasMany(models.Ocorrencia,{
        foreignKey:'id_spot',
      })
    })
export default Spot
