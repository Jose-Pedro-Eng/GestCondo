import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Edit2, Trash2, UserPlus, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Moradores() {
  const [moradores, setMoradores] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    nome: '', email: '', senha: '', cpf: '', telefone: '', curso: '', data_entrada: '', unidade_id: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [resMoradores, resUnidades] = await Promise.all([
        api.get('/moradores'),
        api.get('/unidades')
      ]);
      setMoradores(resMoradores.data);
      setUnidades(resUnidades.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/moradores', formData);
      loadData();
      setIsModalOpen(false);
      setFormData({ nome: '', email: '', senha: '', cpf: '', telefone: '', curso: '', data_entrada: '', unidade_id: '' });
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao cadastrar morador');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Deseja realmente remover este morador?')) {
      try {
        await api.delete(`/moradores/${id}`);
        loadData();
      } catch (err) {
        alert('Erro ao excluir morador');
      }
    }
  };

  const filteredMoradores = moradores.filter(m => 
    m.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.cpf.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Gestão de Moradores</h1>
          <p className="text-slate-500">Visualize e gerencie todos os estudantes residentes.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-all"
        >
          <UserPlus size={20} />
          Novo Morador
        </button>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <Search className="text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Buscar por nome ou CPF..."
          className="flex-1 outline-none text-slate-600"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-sm uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Nome / Empresa</th>
                <th className="px-6 py-4">CPF / Curso</th>
                <th className="px-6 py-4">Unidade</th>
                <th className="px-6 py-4">Entrada</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMoradores.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800">{m.nome}</div>
                    <div className="text-xs text-slate-500">{m.Usuario?.email}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    <div>{m.cpf}</div>
                    <div className="text-xs">{m.curso}</div>
                  </td>
                  <td className="px-6 py-4">
                    {m.Unidade ? (
                      <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-semibold uppercase">
                        Bloco {m.Unidade.bloco} - {m.Unidade.numero}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic text-xs">Sem unidade</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {m.data_entrada ? new Date(m.data_entrada).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       {/* Edit button could be implemented here */}
                      <button 
                        onClick={() => handleDelete(m.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Cadastro */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <h2 className="text-2xl font-bold text-slate-800">Cadastrar Novo Morador</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                  <input 
                    required type="text" className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input 
                    required type="email" className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Senha Inicial</label>
                  <input 
                    required type="password" placeholder="••••••••" className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.senha} onChange={e => setFormData({...formData, senha: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">CPF</label>
                  <input 
                    required type="text" placeholder="000.000.000-00" className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.cpf} onChange={e => setFormData({...formData, cpf: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
                  <input 
                    type="text" className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.telefone} onChange={e => setFormData({...formData, telefone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Curso</label>
                  <input 
                    type="text" className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.curso} onChange={e => setFormData({...formData, curso: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Data de Entrada</label>
                  <input 
                    type="date" className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.data_entrada} onChange={e => setFormData({...formData, data_entrada: e.target.value})}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Unidade</label>
                  <select 
                    className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.unidade_id} onChange={e => setFormData({...formData, unidade_id: e.target.value})}
                  >
                    <option value="">Selecione uma unidade (opcional)</option>
                    {unidades.map(u => (
                      <option key={u.id} value={u.id}>
                        Bloco {u.bloco} - {u.numero} ({u.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2 mt-6 flex gap-3">
                  <button 
                    type="button" onClick={() => setIsModalOpen(false)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg"
                  >
                    Salvar Morador
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function X({ size, className }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  );
}
