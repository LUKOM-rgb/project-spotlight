module.exports = (sequelize, DataTypes) => {
  const Categoria = sequelize.define('Categoria', {
    categoria_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nome_categoria: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });
  
  return Categoria;
};

