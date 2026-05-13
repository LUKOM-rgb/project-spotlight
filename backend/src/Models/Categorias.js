import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'
const Categoria = sequelize.define(
  'Categoria',
  {
    categoria_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nome_categoria: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: 'Categoria',
    freezeTableName: true,
    timestamps: false,
  },
)
Categoria.associate = (models) => {
  Categoria.hasMany(models.Artista, {
    foreignKey: 'categoria_id',
  })
}
export default Categoria
