import AreaComum from '../models/AreaComum.js';

class AreaComumController {
  async index(req, res) {
    try {
      const areas = await AreaComum.findAll();
      return res.json(areas);
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao listar áreas' });
    }
  }

  async store(req, res) {
    try {
      const { nome, descricao, regras_uso } = req.body;
      const area = await AreaComum.create({ nome, descricao, regras_uso });
      return res.status(201).json(area);
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao criar área' });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { nome, descricao, regras_uso } = req.body;
      const area = await AreaComum.findByPk(id);
      if (!area) return res.status(404).json({ error: 'Área não encontrada' });
      await area.update({ nome, descricao, regras_uso });
      return res.json(area);
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao atualizar área' });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const area = await AreaComum.findByPk(id);
      if (!area) return res.status(404).json({ error: 'Área não encontrada' });
      await area.destroy();
      return res.send();
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao deletar área' });
    }
  }
}

export default new AreaComumController();
