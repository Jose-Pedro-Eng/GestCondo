import Mensagem from '../models/Mensagem.js';
import Usuario from '../models/Usuario.js';
import Morador from '../models/Morador.js';
import { Op } from 'sequelize';

class ChatController {
  async getMessages(req, res) {
    try {
      const { partnerId } = req.params; // ID do usuário parceiro na conversa
      const userId = req.user.id;

      const mensagens = await Mensagem.findAll({
        where: {
          [Op.or]: [
            { remetente_id: userId, destinatario_id: partnerId },
            { remetente_id: partnerId, destinatario_id: userId }
          ]
        },
        order: [['createdAt', 'ASC']]
      });

      // Marcar como lidas
      await Mensagem.update({ lida: true }, {
        where: { remetente_id: partnerId, destinatario_id: userId, lida: false }
      });

      return res.json(mensagens);
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao carregar mensagens' });
    }
  }

  async getConversations(req, res) {
    try {
      if (req.user.perfil !== 'Gestor') {
        const gestor = await Usuario.findOne({ where: { perfil: 'Gestor' } });
        return res.json([{ id: gestor.id, email: gestor.email, nome: 'Gestoria' }]);
      }

      // Gestor vê todos os moradores que já enviaram mensagens ou que existem no condomínio
      const moradores = await Morador.findAll({
        include: [{ model: Usuario, attributes: ['id', 'email'] }]
      });

      return res.json(moradores.map(m => ({
        id: m.Usuario.id,
        email: m.Usuario.email,
        nome: m.nome
      })));
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao carregar conversas' });
    }
  }
}

export default new ChatController();
