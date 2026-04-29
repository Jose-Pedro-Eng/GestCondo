import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import AreaComum from './AreaComum.js';
import Morador from './Morador.js';

const Reserva = sequelize.define('Reserva', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  area_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: AreaComum, key: 'id' }
  },
  morador_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Morador, key: 'id' }
  },
  data_reserva: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  hora_inicio: {
    type: DataTypes.TIME,
    allowNull: false
  },
  hora_fim: {
    type: DataTypes.TIME,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pendente', 'aprovada', 'recusada'),
    allowNull: false,
    defaultValue: 'pendente'
  },
  motivo_recusa: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'reservas',
  timestamps: true
});

AreaComum.hasMany(Reserva, { foreignKey: 'area_id' });
Reserva.belongsTo(AreaComum, { foreignKey: 'area_id' });

Morador.hasMany(Reserva, { foreignKey: 'morador_id' });
Reserva.belongsTo(Morador, { foreignKey: 'morador_id' });

export default Reserva;
