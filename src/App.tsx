import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';

import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import DashboardGestor from './pages/Gestor/Dashboard';
import Moradores from './pages/Gestor/Moradores';
import Unidades from './pages/Gestor/Unidades';
import FinanceiroGestor from './pages/Gestor/Financeiro';
import Perfil from './pages/Morador/Perfil';
import FinanceiroMorador from './pages/Morador/Financeiro';
import Chat from './pages/Chat';
import AreasComuns from './pages/AreasComuns';
import Reservas from './pages/Reservas';
import Comunicados from './pages/Comunicados';

import { Menu } from 'lucide-react';

function PrivateRoute({ children, role }: { children: React.ReactNode, role?: 'Gestor' | 'Morador' }) {
  const { signed, loading, user } = useAuth();

  if (loading) return <div className="h-screen flex items-center justify-center">Carregando...</div>;
  if (!signed) return <Navigate to="/login" />;
  if (role && user.perfil !== role) return <Navigate to="/" />;

  return children;
}

function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <main className="flex-1 lg:ml-64 p-4 lg:p-8">
        <header className="lg:hidden flex items-center gap-4 mb-6">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-white rounded-lg shadow-sm">
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-bold">UniCondo</h1>
        </header>
        <Routes>
          {/* Dashboard */}
          <Route path="/" element={user?.perfil === 'Gestor' ? <PrivateRoute role="Gestor"><DashboardGestor /></PrivateRoute> : <Navigate to="/comunicados" />} />
          
          {/* Gestão */}
          <Route path="/moradores" element={<PrivateRoute role="Gestor"><Moradores /></PrivateRoute>} />
          <Route path="/unidades" element={<PrivateRoute role="Gestor"><Unidades /></PrivateRoute>} />
          
          {/* Financeiro */}
          <Route path="/financeiro" element={
            user?.perfil === 'Gestor' ? <PrivateRoute role="Gestor"><FinanceiroGestor /></PrivateRoute> : <PrivateRoute role="Morador"><FinanceiroMorador /></PrivateRoute>
          } />
          
          {/* Vida no Campus */}
          <Route path="/areas-comuns" element={<PrivateRoute role="Gestor"><AreasComuns /></PrivateRoute>} />
          <Route path="/reservas" element={<PrivateRoute><Reservas /></PrivateRoute>} />
          <Route path="/comunicados" element={<PrivateRoute><Comunicados /></PrivateRoute>} />
          <Route path="/chat" element={<PrivateRoute><Chat /></PrivateRoute>} />

          {/* Perfil */}
          <Route path="/perfil" element={<PrivateRoute role="Morador"><Perfil /></PrivateRoute>} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={<MainLayout />} />
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}
