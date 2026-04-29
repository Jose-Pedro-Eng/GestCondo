import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, Hotel, ShieldAlert, Calendar } from 'lucide-react';
import { motion } from 'motion/react';

export default function DashboardGestor() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await api.get('/dashboard/gestor');
        setData(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <div className="p-8">Carregando...</div>;

  const stats = [
    { label: 'Moradores Ativos', value: data.totalMoradores, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Unidades Ocupadas', value: data.unidadesOcupadas, icon: Hotel, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Unidades Vagas', value: data.unidadesVagas, icon: ShieldAlert, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Painel do Gestor</h1>
        <p className="text-slate-500">Bem-vindo de volta! Aqui está o resumo do condomínio.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <p className="text-3xl font-bold text-slate-800 mt-1">{stat.value}</p>
            </div>
            <div className={`p-4 rounded-lg ${stat.bg} ${stat.color}`}>
              <stat.icon size={28} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Calendar size={20} className="text-blue-600" />
            Contratos Vencendo (30 dias)
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-sm uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Morador</th>
                <th className="px-6 py-4">Unidade</th>
                <th className="px-6 py-4">Vencimento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.contratosVencendo.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-slate-400 italic">
                    Nenhum contrato vencendo nos próximos 30 dias.
                  </td>
                </tr>
              ) : (
                data.contratosVencendo.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">{m.nome}</td>
                    <td className="px-6 py-4 text-slate-600">
                      Bloco {m.Unidade?.bloco} - {m.Unidade?.numero}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {new Date(m.data_saida).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
