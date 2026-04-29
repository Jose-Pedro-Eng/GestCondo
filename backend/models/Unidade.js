import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Unidade = sequelize.define('Unidade', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  bloco: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  numero: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Vago', 'Ocupado', 'Manutenção'),
    allowNull: false,
    defaultValue: 'Vago'
  }
}, {
  tableName: 'unidades',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['bloco', 'numero']
    }
  ]
});

export default Unidade;
