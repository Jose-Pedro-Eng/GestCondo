import Comunicado from '../models/Comunicado.js';
import ComunicadoLeitura from '../models/ComunicadoLeitura.js';
import Morador from '../models/Morador.js';
import sequelize from '../config/database.js';

class ComunicadoController {
  async index(req, res) {
    try {
      const comunicados = await Comunicado.findAll({
        order: [['createdAt', 'DESC']]
      });

      if (req.user.perfil === 'Morador') {
        const morador = await Morador.findOne({ where: { usuario_id: req.user.id } });
        const leituras = await ComunicadoLeitura.findAll({ where: { morador_id: morador.id } });
        const leiturasIds = leituras.map(l => l.comunicado_id);

        return res.json(comunicados.map(c => ({
          ...c.toJSON(),
          lido: leiturasIds.includes(c.id)
        })));
      }

      return res.json(comunicados);
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao listar comunicados' });
    }
  }

  async store(req, res) {
    try {
      const { titulo, conteudo } = req.body;
      const comunicado = await Comunicado.create({
        gestor_id: req.user.id,
        titulo,
        conteudo
      });

      // Emitir via socket seria feito no server.js ou via um service
      return res.status(201).json(comunicado);
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao criar comunicado' });
    }
  }

  async markAsRead(req, res) {
    try {
      const { id } = req.params;
      const morador = await Morador.findOne({ where: { usuario_id: req.user.id } });

      await ComunicadoLeitura.findOrCreate({
        where: { morador_id: morador.id, comunicado_id: id }
      });

      return res.send();
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao marcar como lido' });
    }
  }
}

export default new ComunicadoController();
