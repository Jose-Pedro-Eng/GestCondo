import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Hotel, 
  DollarSign,
  MapPin,
  CalendarCheck,
  MessageSquare,
  Megaphone,
  UserCircle, 
  LogOut,
  X
} from 'lucide-react';

export default function Sidebar({ isOpen, setIsOpen }) {
  const { user, logout } = useAuth();

  const menuItems = user?.perfil === 'Gestor' ? [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Moradores', path: '/moradores', icon: Users },
    { name: 'Unidades', path: '/unidades', icon: Hotel },
    { name: 'Financeiro', path: '/financeiro', icon: DollarSign },
    { name: 'Áreas Comuns', path: '/areas-comuns', icon: MapPin },
    { name: 'Reservas', path: '/reservas', icon: CalendarCheck },
    { name: 'Comunicados', path: '/comunicados', icon: Megaphone },
    { name: 'Chat', path: '/chat', icon: MessageSquare },
  ] : [
    { name: 'Mural', path: '/comunicados', icon: Megaphone },
    { name: 'Reservas', path: '/reservas', icon: CalendarCheck },
    { name: 'Financeiro', path: '/financeiro', icon: DollarSign },
    { name: 'Chat', path: '/chat', icon: MessageSquare },
    { name: 'Meu Perfil', path: '/perfil', icon: UserCircle },
  ];

  return (
    <>
      {/* Overlay Mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`
        fixed top-0 left-0 bottom-0 w-64 bg-slate-900 text-white z-50 transition-transform duration-300 lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">UniCondo</h1>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-slate-400">
            <X size={24} />
          </button>
        </div>

        <nav className="mt-6 flex-1 px-4 space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                ${isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
              `}
              onClick={() => setIsOpen(false)}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-xl font-bold">
              {user?.email[0].toUpperCase()}
            </div>
            <div className="truncate">
              <p className="text-sm font-semibold truncate">{user?.email}</p>
              <p className="text-xs text-slate-400 uppercase tracking-tighter">{user?.perfil}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
          >
            <LogOut size={20} />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
}
