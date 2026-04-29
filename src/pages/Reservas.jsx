import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Clock, Check, X, MapPin, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Reservas() {
  const { user } = useAuth();
  const [reservas, setReservas] = useState([]);
  const [areas, setAreas] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({ area_id: '', data_reserva: '', hora_inicio: '', hora_fim: '' });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [resR, resA] = await Promise.all([
        api.get('/reservas'),
        api.get('/areas-comuns')
      ]);
      setReservas(resR.data);
      setAreas(resA.data);
    } finally { setLoading(false); }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/reservas', formData);
      loadData();
      setIsModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao solicitar reserva');
    }
  };

  const handleStatus = async (id, status) => {
    let motivo_recusa = '';
    if (status === 'recusada') {
      motivo_recusa = prompt('Qual o motivo da recusa?');
      if (!motivo_recusa) return;
    }
    await api.patch(`/reservas/${id}/status`, { status, motivo_recusa });
    loadData();
  };

  if (loading) return <div className="p-8">Carregando...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Reservas</h1>
          <p className="text-slate-500">Histórico e agendamento de áreas comuns.</p>
        </div>
        {user.perfil === 'Morador' && (
          <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Plus size={20} /> Nova Reserva
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Área / Solicitante</th>
                <th className="px-6 py-4">Data / Horário</th>
                <th className="px-6 py-4">Status</th>
                {user.perfil === 'Gestor' && <th className="px-6 py-4 text-right">Ações</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reservas.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-slate-400">Nenhuma reserva encontrada.</td></tr>
              ) : (
                reservas.map(r => (
                  <tr key={r.id}>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{r.AreaComum?.nome}</div>
                      <div className="text-xs text-slate-500">{r.Morador?.nome} (Bloco {r.Morador?.Unidade?.bloco} - {r.Morador?.Unidade?.numero})</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm"><Calendar size={14} className="text-slate-400"/> {new Date(r.data_reserva).toLocaleDateString()}</div>
                      <div className="flex items-center gap-1 text-xs text-slate-500"><Clock size={14} className="text-slate-400"/> {r.hora_inicio.slice(0,5)} às {r.hora_fim.slice(0,5)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                        r.status === 'aprovada' ? 'bg-green-100 text-green-700' : 
                        r.status === 'pendente' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {r.status}
                      </span>
                      {r.motivo_recusa && <p className="text-[10px] text-red-500 mt-1 max-w-[150px] truncate" title={r.motivo_recusa}>Motivo: {r.motivo_recusa}</p>}
                    </td>
                    {user.perfil === 'Gestor' && (
                      <td className="px-6 py-4 text-right">
                        {r.status === 'pendente' && (
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleStatus(r.id, 'aprovada')} className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200"><Check size={18} /></button>
                            <button onClick={() => handleStatus(r.id, 'recusada')} className="p-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200"><X size={18} /></button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Nova Agendamento</h2>
                <button onClick={() => setIsModalOpen(false)}><X size={24} /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <select required className="w-full p-2 border rounded" value={formData.area_id} onChange={e => setFormData({...formData, area_id: e.target.value})}>
                  <option value="">Selecione o espaço</option>
                  {areas.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
                </select>
                <input required type="date" className="w-full p-2 border rounded" value={formData.data_reserva} onChange={e => setFormData({...formData, data_reserva: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                  <input required type="time" className="w-full p-2 border rounded" value={formData.hora_inicio} onChange={e => setFormData({...formData, hora_inicio: e.target.value})} />
                  <input required type="time" className="w-full p-2 border rounded" value={formData.hora_fim} onChange={e => setFormData({...formData, hora_fim: e.target.value})} />
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg mt-4 transition-colors hover:bg-blue-700">Solicitar Reserva</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
