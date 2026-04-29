import Morador from '../models/Morador.js';
import Unidade from '../models/Unidade.js';
import { Op } from 'sequelize';

class DashboardController {
  async gestor(req, res) {
    try {
      const totalMoradores = await Morador.count();
      const unidadesOcupadas = await Unidade.count({ where: { status: 'Ocupado' } });
      const unidadesVagas = await Unidade.count({ where: { status: 'Vago' } });

      const hoje = new Date();
      const em30Dias = new Date();
      em30Dias.setDate(hoje.getDate() + 30);

      const contratosVencendo = await Morador.findAll({
        where: {
          data_saida: {
            [Op.between]: [hoje, em30Dias]
          }
        },
        include: [Unidade]
      });

      return res.json({
        totalMoradores,
        unidadesOcupadas,
        unidadesVagas,
        contratosVencendo
      });
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao carregar dashboard' });
    }
  }
}

export default new DashboardController();
