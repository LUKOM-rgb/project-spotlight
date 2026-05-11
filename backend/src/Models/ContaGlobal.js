module.exports = (sequelize, DataTypes) => {
  const Conta_global = sequelize.define('Conta_global', {
    conta_id: {
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
    tipo:{
      enum: ['artista', 'utilizador'],
      type: DataTypes.ENUM,
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
  });

  return Conta_global;
};

