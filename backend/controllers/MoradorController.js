import bcrypt from 'bcryptjs';
import Usuario from '../models/Usuario.js';
import Morador from '../models/Morador.js';
import Unidade from '../models/Unidade.js';
import sequelize from '../config/database.js';

class MoradorController {
  async index(req, res) {
    try {
      const moradores = await Morador.findAll({
        include: [
          { model: Usuario, attributes: ['email', 'perfil'] },
          { model: Unidade }
        ]
      });
      return res.json(moradores);
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao listar moradores' });
    }
  }

  async store(req, res) {
    const t = await sequelize.transaction();
    try {
      const { email, senha, nome, cpf, telefone, curso, data_entrada, unidade_id } = req.body;

      const userExists = await Usuario.findOne({ where: { email } });
      if (userExists) {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }

      const hashSenha = await bcrypt.hash(senha, 8);
      const usuario = await Usuario.create({
        email,
        senha: hashSenha,
        perfil: 'Morador'
      }, { transaction: t });

      const morador = await Morador.create({
        usuario_id: usuario.id,
        unidade_id,
        nome,
        cpf,
        telefone,
        curso,
        data_entrada
      }, { transaction: t });

      if (unidade_id) {
        await Unidade.update({ status: 'Ocupado' }, { where: { id: unidade_id }, transaction: t });
      }

      await t.commit();
      return res.status(201).json(morador);
    } catch (err) {
      await t.rollback();
      return res.status(500).json({ error: 'Erro ao criar morador' });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { nome, telefone, curso, data_entrada, data_saida } = req.body;

      const morador = await Morador.findByPk(id);
      if (!morador) return res.status(404).json({ error: 'Morador não encontrado' });

      // Se for Morador logado, só pode editar o próprio perfil
      if (req.user.perfil === 'Morador' && morador.usuario_id !== req.user.id) {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      await morador.update({ nome, telefone, curso, data_entrada, data_saida });
      return res.json(morador);
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao atualizar morador' });
    }
  }

  async delete(req, res) {
    const t = await sequelize.transaction();
    try {
      const { id } = req.params;
      const morador = await Morador.findByPk(id);
      if (!morador) return res.status(404).json({ error: 'Morador não encontrado' });

      await Usuario.destroy({ where: { id: morador.usuario_id }, transaction: t });
      
      if (morador.unidade_id) {
        const count = await Morador.count({ where: { unidade_id: morador.unidade_id }, transaction: t });
        if (count <= 1) {
          await Unidade.update({ status: 'Vago' }, { where: { id: morador.unidade_id }, transaction: t });
        }
      }

      await t.commit();
      return res.send();
    } catch (err) {
      await t.rollback();
      return res.status(500).json({ error: 'Erro ao deletar morador' });
    }
  }
}

export default new MoradorController();
