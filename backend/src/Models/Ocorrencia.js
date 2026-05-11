module.export = (sequelize, DataTypes) => {
  const Ocorrencia = sequelize.define('Ocorrencia', {
    id_ocorrencia: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    data_ocorrencia: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    hora_ocorrencia: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    local_ocorrencia: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    descricao_ocorrencia: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    estado_ocorrencia: {
      enum: ['pendente', 'resolvida', 'em progresso'],
      type: DataTypes.ENUM,
      allowNull: false,
    },
    id_conta: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Conta_global',
        key: 'conta_id',
      },
    },
    id_spot: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Spots',
        key: 'id_spot',
      },
    },
  })
  Ocorrencia.associate = (models) => {
    Ocorrencia.belongsTo(models.Conta_global, {
      foreignKey: 'id_conta',
    })
    Ocorrencia.belongsTo(models.Spot, {
      foreignKey: 'id_spot',
    })
  }
  return Ocorrencia
}
