import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

const Artista = sequelize.define(
  'Artista',
  {
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
        model: 'Categoria',
        key: 'categoria_id',
      },
    },
  },
  {
    tableName: 'Artista',
    freezeTableName: true,
    timestamps: false,
  },
)

Artista.associate = (models) => {
  Artista.belongsTo(models.Categoria, {
    foreignKey: 'categoria_id',
  })
  Artista.hasMany(models.Seguidor, {
    foreignKey: 'id_artista',
  })
  Artista.hasMany(models.Reserva, {
    foreignKey: 'id_artista',
  })
  // Associação inversa com Utilizador adicionada para facilitar includes
  Artista.hasOne(models.Utilizador, {
    foreignKey: 'id_artista',
  })
}

export default Artista
