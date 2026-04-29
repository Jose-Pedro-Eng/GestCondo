import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { DollarSign, AlertCircle, Users, CheckCircle, Plus, X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function FinanceiroGestor() {
  const [stats, setStats] = useState(null);
  const [lancamentos, setLancamentos] = useState([]);
  const [moradores, setMoradores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    morador_id: '', valor: '', vencimento: '', descricao: '', tipo: 'aluguel'
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [resStats, resLancamentos, resMoradores] = await Promise.all([
        api.get('/dashboard/financeiro'),
        api.get('/financeiro'),
        api.get('/moradores')
      ]);
      setStats(resStats.data);
      setLancamentos(resLancamentos.data);
      setMoradores(resMoradores.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/financeiro', formData);
      loadData();
      setIsModalOpen(false);
      setFormData({ morador_id: '', valor: '', vencimento: '', descricao: '', tipo: 'aluguel' });
    } catch (err) {
      alert('Erro ao gerar cobrança');
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await api.patch(`/financeiro/${id}/status`, { status });
      loadData();
    } catch (err) {
      alert('Erro ao atualizar status');
    }
  };

  if (loading) return <div className="p-8">Carregando...</div>;

  const cards = [
    { label: 'A Receber (Mês)', value: stats.totalAReceber, icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total em Atraso', value: stats.totalEmAtraso, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Inadimplentes', value: stats.inadimplentesCount, icon: Users, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Financeiro</h1>
          <p className="text-slate-500">Gestão de cobranças e inadimplência.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={20} /> Nova Cobrança
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">{card.label}</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">R$ {Number(card.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className={`p-4 rounded-lg ${card.bg} ${card.color}`}>
              <card.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b flex items-center gap-4">
          <Search size={20} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Filtrar por morador..." 
            className="flex-1 outline-none"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Morador / Unidade</th>
                <th className="px-6 py-4">Valor</th>
                <th className="px-6 py-4">Vencimento</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lancamentos.filter(l => l.Morador.nome.toLowerCase().includes(searchTerm.toLowerCase())).map((l) => (
                <tr key={l.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-800">{l.Morador.nome}</div>
                    <div className="text-xs text-slate-500">Bloco {l.Morador.Unidade?.bloco} - {l.Morador.Unidade?.numero}</div>
                  </td>
                  <td className="px-6 py-4 font-mono font-bold">R$ {Number(l.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="px-6 py-4">{new Date(l.vencimento).toLocaleDateString()}</td>
                  <td className="px-6 py-4 capitalize">{l.tipo}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                      l.status === 'pago' ? 'bg-green-100 text-green-700' : 
                      l.status === 'pendente' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {l.status === 'pendente' && (
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleStatus(l.id, 'pago')}
                          className="bg-green-600 text-white p-1.5 rounded hover:bg-green-700"
                          title="Confirmar Pagamento"
                        >
                          <CheckCircle size={16} />
                        </button>
                        <button 
                          onClick={() => handleStatus(l.id, 'cancelado')}
                          className="bg-red-600 text-white p-1.5 rounded hover:bg-red-700"
                          title="Cancelar"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-xl shadow-xl max-w-lg w-full">
              <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold">Lançar Nova Cobrança</h2>
                <button onClick={() => setIsModalOpen(false)}><X size={24} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Morador</label>
                  <select 
                    required className="w-full p-2 border rounded"
                    value={formData.morador_id} onChange={e => setFormData({...formData, morador_id: e.target.value})}
                  >
                    <option value="">Selecione o morador</option>
                    {moradores.map(m => (
                      <option key={m.id} value={m.id}>{m.nome} ({m.cpf})</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Valor (R$)</label>
                    <input required type="number" step="0.01" className="w-full p-2 border rounded" value={formData.valor} onChange={e => setFormData({...formData, valor: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Vencimento</label>
                    <input required type="date" className="w-full p-2 border rounded" value={formData.vencimento} onChange={e => setFormData({...formData, vencimento: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Tipo</label>
                  <select className="w-full p-2 border rounded" value={formData.tipo} onChange={e => setFormData({...formData, tipo: e.target.value})}>
                    <option value="aluguel">Aluguel</option>
                    <option value="condominio">Condomínio</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Descrição</label>
                  <textarea className="w-full p-2 border rounded" rows="3" value={formData.descricao} onChange={e => setFormData({...formData, descricao: e.target.value})} />
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg mt-4">Gerar Lançamento</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
