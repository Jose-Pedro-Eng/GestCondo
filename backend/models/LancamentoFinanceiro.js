import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Morador from './Morador.js';

const LancamentoFinanceiro = sequelize.define('LancamentoFinanceiro', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  morador_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Morador,
      key: 'id'
    }
  },
  valor: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  vencimento: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  data_pagamento: {
    type: DataTypes.DATE
  },
  descricao: {
    type: DataTypes.TEXT
  },
  tipo: {
    type: DataTypes.ENUM('aluguel', 'condominio', 'outros'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pendente', 'pago', 'cancelado'),
    allowNull: false,
    defaultValue: 'pendente'
  },
  linha_digitavel: {
    type: DataTypes.STRING(255)
  },
  qr_code_url: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'lancamentos_financeiros',
  timestamps: true,
  indexes: [
    {
      fields: ['morador_id', 'status']
    }
  ]
});

Morador.hasMany(LancamentoFinanceiro, { foreignKey: 'morador_id' });
LancamentoFinanceiro.belongsTo(Morador, { foreignKey: 'morador_id' });

export default LancamentoFinanceiro;
