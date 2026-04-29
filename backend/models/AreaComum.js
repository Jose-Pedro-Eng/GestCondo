import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const AreaComum = sequelize.define('AreaComum', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nome: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  descricao: {
    type: DataTypes.TEXT
  },
  regras_uso: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'areas_comuns',
  timestamps: true
});

export default AreaComum;
