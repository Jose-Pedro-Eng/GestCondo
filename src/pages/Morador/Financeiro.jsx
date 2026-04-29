import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { CreditCard, QrCode, Copy, CheckCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function FinanceiroMorador() {
  const [lancamentos, setLancamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const response = await api.get('/financeiro');
        setLancamentos(response.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const copyPix = (text) => {
    navigator.clipboard.writeText(text);
    alert('Código PIX copiado!');
  };

  if (loading) return <div className="p-8 text-center">Carregando seus boletos...</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Financeiro</h1>
        <p className="text-slate-500">Acesse seus boletos, códigos PIX e histórico de pagamentos.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {lancamentos.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-sm text-center border">
            <Info className="mx-auto text-slate-300 mb-2" size={48} />
            <p className="text-slate-500">Nenhum lançamento financeiro encontrado.</p>
          </div>
        ) : (
          lancamentos.map(l => (
            <motion.div 
              key={l.id} 
              layout
              className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    l.status === 'pago' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {l.status}
                  </span>
                  <span className="text-xs text-slate-400 capitalize">{l.tipo}</span>
                </div>
                <h3 className="font-bold text-lg text-slate-800">R$ {Number(l.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                <p className="text-sm text-slate-500">Vencimento: {new Date(l.vencimento).toLocaleDateString()}</p>
                {l.status === 'pago' && (
                  <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                    <CheckCircle size={12} /> Pago em {new Date(l.data_pagamento).toLocaleDateString()}
                  </p>
                )}
              </div>

              {l.status === 'pendente' && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => setSelected(l)}
                    className="flex-1 md:flex-none bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2"
                  >
                    <QrCode size={18} /> Pagar (PIX/Boleto)
                  </button>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
              <div className="bg-blue-600 p-6 text-white text-center">
                <h2 className="text-xl font-bold">Pagamento</h2>
                <p className="text-blue-100 text-sm">Escaneie o QR Code ou copie a linha digitável</p>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="flex justify-center">
                  <img src={selected.qr_code_url} alt="QR Code PIX" className="w-48 h-48 border-4 border-slate-50 rounded-xl" />
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Linha Digitável / PIX</label>
                    <div className="bg-slate-50 p-3 rounded-lg border flex items-center gap-2">
                      <p className="flex-1 text-xs font-mono break-all">{selected.linha_digitavel}</p>
                      <button onClick={() => copyPix(selected.linha_digitavel)} className="text-blue-600 hover:text-blue-700">
                        <Copy size={18} />
                      </button>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setSelected(null)}
                  className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
