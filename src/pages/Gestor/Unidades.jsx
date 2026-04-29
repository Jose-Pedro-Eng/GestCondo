import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Hotel, Trash2, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Unidades() {
  const [unidades, setUnidades] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ bloco: '', numero: '', status: 'Vago' });

  useEffect(() => { loadUnidades(); }, []);

  async function loadUnidades() {
    try {
      const response = await api.get('/unidades');
      setUnidades(response.data);
    } catch (err) { console.error(err); }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/unidades', formData);
      loadUnidades();
      setIsModalOpen(false);
      setFormData({ bloco: '', numero: '', status: 'Vago' });
    } catch (err) { alert('Erro ao cadastrar unidade'); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Excluir esta unidade?')) {
      try {
        await api.delete(`/unidades/${id}`);
        loadUnidades();
      } catch (err) { alert('Erro ao excluir unidade'); }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">Unidades</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus size={20} /> Nova Unidade
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {unidades.map(u => (
          <div key={u.id} className="bg-white p-6 rounded-xl shadow-sm border flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold">Bloco {u.bloco} - {u.numero}</h3>
              <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${u.status === 'Vago' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-700'}`}>
                {u.status}
              </span>
            </div>
            <button onClick={() => handleDelete(u.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={18} /></button>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white p-6 rounded-xl max-w-md w-full">
              <div className="flex justify-between mb-4">
                <h2 className="text-xl font-bold">Nova Unidade</h2>
                <button onClick={() => setIsModalOpen(false)}><X size={24} /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input required placeholder="Bloco" className="w-full p-2 border rounded" value={formData.bloco} onChange={e => setFormData({...formData, bloco: e.target.value})} />
                <input required placeholder="Número" className="w-full p-2 border rounded" value={formData.numero} onChange={e => setFormData({...formData, numero: e.target.value})} />
                <select className="w-full p-2 border rounded" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                  <option value="Vago">Vago</option>
                  <option value="Ocupado">Ocupado</option>
                  <option value="Manutenção">Manutenção</option>
                </select>
                <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg">Salvar</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
