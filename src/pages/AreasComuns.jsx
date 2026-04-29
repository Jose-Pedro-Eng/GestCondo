import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { MapPin, Info, Save, Trash2, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AreasComuns() {
  const [areas, setAreas] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ nome: '', descricao: '', regras_uso: '' });

  useEffect(() => { loadAreas(); }, []);

  async function loadAreas() {
    const res = await api.get('/areas-comuns');
    setAreas(res.data);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/areas-comuns', formData);
    loadAreas();
    setIsModalOpen(false);
    setFormData({ nome: '', descricao: '', regras_uso: '' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Excluir esta área?')) {
      await api.delete(`/areas-comuns/${id}`);
      loadAreas();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Áreas Comuns</h1>
          <p className="text-slate-500">Espaços disponíveis para reserva pelos moradores.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus size={20} /> Nova Área
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {areas.map(a => (
          <div key={a.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <MapPin className="text-blue-600" />
                <h3 className="text-xl font-bold text-slate-800">{a.nome}</h3>
              </div>
              <p className="text-sm text-slate-600">{a.descricao}</p>
              <div className="bg-slate-50 p-4 rounded-lg flex items-start gap-2">
                <Info size={16} className="text-blue-500 mt-1" />
                <p className="text-xs text-slate-500 italic">Regras: {a.regras_uso}</p>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t flex justify-end gap-2">
              <button onClick={() => handleDelete(a.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
              <div className="flex justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Nova Área Comum</h2>
                <button onClick={() => setIsModalOpen(false)}><X size={24} /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input required placeholder="Nome da Área (Ex: Salão de Festas)" className="w-full p-2 border rounded" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} />
                <textarea placeholder="Descrição" className="w-full p-2 border rounded" value={formData.descricao} onChange={e => setFormData({...formData, descricao: e.target.value})} />
                <textarea placeholder="Regras de Uso" className="w-full p-2 border rounded" value={formData.regras_uso} onChange={e => setFormData({...formData, regras_uso: e.target.value})} />
                <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg">Criar Área</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
