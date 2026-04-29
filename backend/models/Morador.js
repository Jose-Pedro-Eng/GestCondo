import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Usuario from './Usuario.js';
import Unidade from './Unidade.js';

const Morador = sequelize.define('Morador', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Usuario,
      key: 'id'
    }
  },
  unidade_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Unidade,
      key: 'id'
    }
  },
  nome: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  cpf: {
    type: DataTypes.STRING(14),
    allowNull: false,
    unique: true
  },
  telefone: {
    type: DataTypes.STRING(20)
  },
  curso: {
    type: DataTypes.STRING(100)
  },
  data_entrada: {
    type: DataTypes.DATEONLY
  },
  data_saida: {
    type: DataTypes.DATEONLY
  }
}, {
  tableName: 'moradores',
  timestamps: true
});

Usuario.hasOne(Morador, { foreignKey: 'usuario_id' });
Morador.belongsTo(Usuario, { foreignKey: 'usuario_id' });

Unidade.hasMany(Morador, { foreignKey: 'unidade_id' });
Morador.belongsTo(Unidade, { foreignKey: 'unidade_id' });

export default Morador;
