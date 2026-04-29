import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { Megaphone, MessageSquare, Check, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Comunicados() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [comunicados, setComunicados] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ titulo: '', conteudo: '' });

  useEffect(() => {
    loadComunicados();
    if (socket) {
      socket.on('newComunicado', (c) => {
        setComunicados(prev => [c, ...prev]);
      });
      return () => socket.off('newComunicado');
    }
  }, [socket]);

  async function loadComunicados() {
    const res = await api.get('/comunicados');
    setComunicados(res.data);
  }

  const handleRead = async (id) => {
    if (user.perfil === 'Morador') {
      await api.post(`/comunicados/${id}/read`);
      loadComunicados();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await api.post('/comunicados', formData);
    socket.emit('broadcast', res.data);
    loadComunicados();
    setIsModalOpen(false);
    setFormData({ titulo: '', conteudo: '' });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Mural de Comunicados</h1>
          <p className="text-slate-500">Mantenha-se informado sobre as novidades do campus.</p>
        </div>
        {user.perfil === 'Gestor' && (
          <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Plus size={20} /> Novo Comunicado
          </button>
        )}
      </div>

      <div className="space-y-4">
        {comunicados.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-sm border text-center text-slate-400 italic">Sem comunicados recentes.</div>
        ) : (
          comunicados.map(c => (
            <motion.div 
              key={c.id} 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }}
              onClick={() => handleRead(c.id)}
              className={`bg-white p-6 rounded-xl shadow-sm border-l-4 transition-all cursor-pointer ${c.lido ? 'border-l-slate-200' : 'border-l-blue-600 bg-blue-50/10'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-slate-800">{c.titulo}</h3>
                <span className="text-[10px] text-slate-400 font-mono">{new Date(c.createdAt).toLocaleString()}</span>
              </div>
              <p className="text-slate-600 mb-4 whitespace-pre-wrap">{c.conteudo}</p>
              <div className="flex items-center gap-2">
                {user.perfil === 'Morador' && (
                  c.lido ? (
                    <span className="text-xs text-green-600 flex items-center gap-1"><Check size={14} /> Lido</span>
                  ) : (
                    <span className="text-xs text-blue-600 font-bold flex items-center gap-1 underline underline-offset-4">Marcar como lido</span>
                  )
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
              <div className="flex justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Publicar Comunicado</h2>
                <button onClick={() => setIsModalOpen(false)}><X size={24} /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input required placeholder="Título" className="w-full p-3 border rounded-lg" value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})} />
                <textarea required placeholder="Conteúdo do comunicado..." rows="6" className="w-full p-3 border rounded-lg" value={formData.conteudo} onChange={e => setFormData({...formData, conteudo: e.target.value})} />
                <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg transition-colors hover:bg-blue-700">Disparar para Moradores</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
