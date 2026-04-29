import LancamentoFinanceiro from '../models/LancamentoFinanceiro.js';
import Morador from '../models/Morador.js';
import Unidade from '../models/Unidade.js';
import sequelize from '../config/database.js';
import { Op } from 'sequelize';

class FinanceiroController {
  async index(req, res) {
    try {
      const { morador_id, status } = req.query;
      const where = {};
      
      if (req.user.perfil === 'Morador') {
        const morador = await Morador.findOne({ where: { usuario_id: req.user.id } });
        where.morador_id = morador.id;
      } else if (morador_id) {
        where.morador_id = morador_id;
      }

      if (status) where.status = status;

      const lancamentos = await LancamentoFinanceiro.findAll({
        where,
        include: [{ 
          model: Morador, 
          attributes: ['nome', 'cpf'],
          include: [{ model: Unidade, attributes: ['bloco', 'numero'] }]
        }],
        order: [['vencimento', 'DESC']]
      });

      return res.json(lancamentos);
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao listar lançamentos' });
    }
  }

  async store(req, res) {
    const t = await sequelize.transaction();
    try {
      const { morador_id, valor, vencimento, descricao, tipo } = req.body;

      // Gerar dados fakes de boleto/pix
      const linha_digitavel = `23793.38128 60007.829313 19000.000334 1 954300000${Math.floor(valor * 100)}`;
      const qr_code_url = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=00020126330014BR.GOV.BCB.PIX0111unicondo1235204000053039865405${valor}5802BR5915UniCondo%20LTDA6009SAO%20PAULO62070503***6304E2CA`;

      const lancamento = await LancamentoFinanceiro.create({
        morador_id,
        valor,
        vencimento,
        descricao,
        tipo,
        status: 'pendente',
        linha_digitavel,
        qr_code_url
      }, { transaction: t });

      await t.commit();
      return res.status(201).json(lancamento);
    } catch (err) {
      await t.rollback();
      return res.status(500).json({ error: 'Erro ao gerar lançamento' });
    }
  }

  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body; // pago ou cancelado

      const lancamento = await LancamentoFinanceiro.findByPk(id);
      if (!lancamento) return res.status(404).json({ error: 'Lançamento não encontrado' });

      const updateData = { status };
      if (status === 'pago') {
        updateData.data_pagamento = new Date();
      } else {
        updateData.data_pagamento = null;
      }

      await lancamento.update(updateData);
      return res.json(lancamento);
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao atualizar status' });
    }
  }

  async dashboard(req, res) {
    try {
      const hoje = new Date();
      const mesAtual = hoje.getMonth();
      const anoAtual = hoje.getFullYear();

      const totalAReceber = await LancamentoFinanceiro.sum('valor', {
        where: {
          status: 'pendente',
          vencimento: {
            [Op.gte]: new Date(anoAtual, mesAtual, 1)
          }
        }
      }) || 0;

      const totalEmAtraso = await LancamentoFinanceiro.sum('valor', {
        where: {
          status: 'pendente',
          vencimento: {
            [Op.lt]: hoje
          }
        }
      }) || 0;

      const inadimplentesCount = await LancamentoFinanceiro.count({
        distinct: true,
        col: 'morador_id',
        where: {
          status: 'pendente',
          vencimento: { [Op.lt]: hoje }
        }
      });

      const pagos = await LancamentoFinanceiro.count({ where: { status: 'pago' } }) || 0;
      const pendentes = await LancamentoFinanceiro.count({ where: { status: 'pendente' } }) || 0;

      return res.json({
        totalAReceber: Number(totalAReceber) || 0,
        totalEmAtraso: Number(totalEmAtraso) || 0,
        inadimplentesCount: inadimplentesCount || 0,
        statsPizza: { pagos, pendentes }
      });
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao carregar dashboard financeiro' });
    }
  }
}

export default new FinanceiroController();
