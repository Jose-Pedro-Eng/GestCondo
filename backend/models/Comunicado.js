import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Usuario from './Usuario.js';

const Comunicado = sequelize.define('Comunicado', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  gestor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Usuario, key: 'id' }
  },
  titulo: {
    type: DataTypes.STRING(191),
    allowNull: false
  },
  conteudo: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'comunicados',
  timestamps: true
});

Usuario.hasMany(Comunicado, { foreignKey: 'gestor_id' });
Comunicado.belongsTo(Usuario, { foreignKey: 'gestor_id' });

export default Comunicado;
