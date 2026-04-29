import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Morador from './Morador.js';
import Comunicado from './Comunicado.js';

const ComunicadoLeitura = sequelize.define('ComunicadoLeitura', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  morador_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Morador, key: 'id' }
  },
  comunicado_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Comunicado, key: 'id' }
  },
  data_leitura: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'comunicado_leituras',
  timestamps: true
});

Morador.hasMany(ComunicadoLeitura, { foreignKey: 'morador_id' });
Comunicado.hasMany(ComunicadoLeitura, { foreignKey: 'comunicado_id' });
ComunicadoLeitura.belongsTo(Morador, { foreignKey: 'morador_id' });
ComunicadoLeitura.belongsTo(Comunicado, { foreignKey: 'comunicado_id' });

export default ComunicadoLeitura;
