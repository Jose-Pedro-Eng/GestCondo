import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import { Send, User } from 'lucide-react';

export default function Chat() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    async function loadConversations() {
      const response = await api.get('/chat/conversations');
      setConversations(response.data);
      if (user.perfil === 'Morador' && response.data.length > 0) {
        setActivePartner(response.data[0]);
      }
    }
    loadConversations();
  }, [user]);

  useEffect(() => {
    if (activePartner) {
      loadMessages(activePartner.id);
    }
  }, [activePartner]);

  useEffect(() => {
    if (socket) {
      socket.on('newMessage', (msg) => {
        if (activePartner && (msg.remetente_id === activePartner.id || msg.remetente_id === user.id)) {
          setMessages(prev => [...prev, msg]);
        }
      });
      return () => socket.off('newMessage');
    }
  }, [socket, activePartner, user]);

  async function loadMessages(partnerId) {
    const response = await api.get(`/chat/messages/${partnerId}`);
    setMessages(response.data);
  }

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || !activePartner) return;

    socket.emit('sendMessage', {
      destinatario_id: activePartner.id,
      conteudo: input
    });
    setInput('');
  };

  return (
    <div className="h-[calc(100vh-120px)] flex bg-white rounded-xl shadow-sm border overflow-hidden">
      {/* Sidebar Conversas (Só Gestor vê lista) */}
      <div className={`w-full md:w-80 border-r flex flex-col ${activePartner && 'hidden md:flex'}`}>
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Mensagens</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map(c => (
            <button 
              key={c.id} 
              onClick={() => setActivePartner(c)}
              className={`w-full p-4 flex items-center gap-3 border-b hover:bg-slate-50 transition-colors ${activePartner?.id === c.id ? 'bg-blue-50 border-r-4 border-r-blue-600' : ''}`}
            >
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                <User size={20} className="text-slate-500" />
              </div>
              <div className="text-left">
                <p className="font-bold text-slate-800">{c.nome}</p>
                <p className="text-xs text-slate-500 truncate">{c.email}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${!activePartner && 'hidden md:flex'}`}>
        {activePartner ? (
          <>
            <div className="p-4 border-b flex items-center gap-3">
              <button onClick={() => setActivePartner(null)} className="md:hidden text-blue-600 font-bold px-2">Voltar</button>
              <h3 className="font-bold">{activePartner.nome}</h3>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.remetente_id === user.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] p-3 rounded-2xl shadow-sm ${m.remetente_id === user.id ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border'}`}>
                    <p className="text-sm">{m.conteudo}</p>
                    <span className="text-[10px] opacity-70 block text-right mt-1">
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSend} className="p-4 border-t flex gap-2 bg-white">
              <input 
                type="text" 
                placeholder="Digite sua mensagem..." 
                className="flex-1 px-4 py-2 bg-slate-100 rounded-full outline-none focus:ring-2 focus:ring-blue-500"
                value={input}
                onChange={e => setInput(e.target.value)}
              />
              <button type="submit" className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
                <Send size={20} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            Selecione uma conversa para começar
          </div>
        )}
      </div>
    </div>
  );
}
