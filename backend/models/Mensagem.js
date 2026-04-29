import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Usuario from './Usuario.js';

const Mensagem = sequelize.define('Mensagem', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  remetente_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Usuario, key: 'id' }
  },
  destinatario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Usuario, key: 'id' }
  },
  conteudo: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  lida: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'mensagens',
  timestamps: true,
  indexes: [
    { fields: ['destinatario_id', 'lida'] }
  ]
});

Usuario.hasMany(Mensagem, { as: 'MensagensEnviadas', foreignKey: 'remetente_id' });
Usuario.hasMany(Mensagem, { as: 'MensagensRecebidas', foreignKey: 'destinatario_id' });
Mensagem.belongsTo(Usuario, { as: 'Remetente', foreignKey: 'remetente_id' });
Mensagem.belongsTo(Usuario, { as: 'Destinatario', foreignKey: 'destinatario_id' });

export default Mensagem;
