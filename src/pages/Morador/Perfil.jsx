import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { UserCircle, Save } from 'lucide-react';

export default function Perfil() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ nome: '', telefone: '', curso: '' });

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await api.get('/me');
        setProfile(response.data);
        const m = response.data.Morador;
        if (m) setFormData({ nome: m.nome, telefone: m.telefone || '', curso: m.curso || '' });
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    loadProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/moradores/${profile.Morador.id}`, formData);
      alert('Perfil atualizado com sucesso!');
    } catch (err) { alert('Erro ao atualizar perfil'); }
  };

  if (loading) return <div className="p-8">Carregando...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <div className="bg-blue-600 p-4 rounded-full text-white"><UserCircle size={48} /></div>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Meu Perfil</h1>
          <p className="text-slate-500">Mantenha seus dados sempre atualizados.</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
              <input disabled value={profile.email} className="w-full px-4 py-2 bg-slate-50 border rounded-lg text-slate-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">CPF</label>
              <input disabled value={profile.Morador?.cpf} className="w-full px-4 py-2 bg-slate-50 border rounded-lg text-slate-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Unidade</label>
              <input disabled value={profile.Morador?.Unidade ? `Bloco ${profile.Morador.Unidade.bloco} - ${profile.Morador.Unidade.numero}` : 'Nenhuma'} className="w-full px-4 py-2 bg-slate-50 border rounded-lg text-slate-500" />
            </div>
          </div>

          <div className="border-t pt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
              <input required value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
              <input value={formData.telefone} onChange={e => setFormData({...formData, telefone: e.target.value})} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Curso</label>
              <input value={formData.curso} onChange={e => setFormData({...formData, curso: e.target.value})} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
            <Save size={20} /> Salvar Alterações
          </button>
        </form>
      </div>
    </div>
  );
}
