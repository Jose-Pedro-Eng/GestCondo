import Reserva from '../models/Reserva.js';
import AreaComum from '../models/AreaComum.js';
import Morador from '../models/Morador.js';
import Unidade from '../models/Unidade.js';
import { Op } from 'sequelize';

class ReservaController {
  async index(req, res) {
    try {
      const where = {};
      if (req.user.perfil === 'Morador') {
        const morador = await Morador.findOne({ where: { usuario_id: req.user.id } });
        where.morador_id = morador.id;
      }

      const reservas = await Reserva.findAll({
        where,
        include: [
          { model: AreaComum },
          { 
            model: Morador, 
            attributes: ['nome'],
            include: [{ model: Unidade, attributes: ['bloco', 'numero'] }]
          }
        ],
        order: [['data_reserva', 'DESC'], ['hora_inicio', 'DESC']]
      });
      return res.json(reservas);
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao listar reservas' });
    }
  }

  async store(req, res) {
    try {
      const { area_id, data_reserva, hora_inicio, hora_fim } = req.body;
      const morador = await Morador.findOne({ where: { usuario_id: req.user.id } });

      // Validar conflito de horário
      const conflito = await Reserva.findOne({
        where: {
          area_id,
          data_reserva,
          status: 'aprovada',
          [Op.or]: [
            {
              hora_inicio: { [Op.between]: [hora_inicio, hora_fim] }
            },
            {
              hora_fim: { [Op.between]: [hora_inicio, hora_fim] }
            }
          ]
        }
      });

      if (conflito) {
        return res.status(400).json({ error: 'Já existe uma reserva aprovada para este horário.' });
      }

      const reserva = await Reserva.create({
        area_id,
        morador_id: morador.id,
        data_reserva,
        hora_inicio,
        hora_fim,
        status: 'pendente'
      });

      return res.status(201).json(reserva);
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao criar reserva' });
    }
  }

  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, motivo_recusa } = req.body;

      const reserva = await Reserva.findByPk(id);
      if (!reserva) return res.status(404).json({ error: 'Reserva não encontrada' });

      await reserva.update({ status, motivo_recusa });
      return res.json(reserva);
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao atualizar reserva' });
    }
  }
}

export default new ReservaController();
