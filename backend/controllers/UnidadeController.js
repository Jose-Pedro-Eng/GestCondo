import Unidade from '../models/Unidade.js';

class UnidadeController {
  async index(req, res) {
    try {
      const unidades = await Unidade.findAll();
      return res.json(unidades);
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao listar unidades' });
    }
  }

  async store(req, res) {
    try {
      const { bloco, numero, status } = req.body;
      const unidade = await Unidade.create({ bloco, numero, status });
      return res.status(201).json(unidade);
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao criar unidade' });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { bloco, numero, status } = req.body;
      const unidade = await Unidade.findByPk(id);
      if (!unidade) return res.status(404).json({ error: 'Unidade não encontrada' });

      await unidade.update({ bloco, numero, status });
      return res.json(unidade);
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao atualizar unidade' });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const unidade = await Unidade.findByPk(id);
      if (!unidade) return res.status(404).json({ error: 'Unidade não encontrada' });

      await unidade.destroy();
      return res.send();
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao deletar unidade' });
    }
  }
}

export default new UnidadeController();
