import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStorageData() {
      const storageUser = localStorage.getItem('@UniCondo:user');
      const storageToken = localStorage.getItem('@UniCondo:token');

      if (storageUser && storageToken) {
        setUser(JSON.parse(storageUser));
      }
      setLoading(false);
    }

    loadStorageData();
  }, []);

  const login = async (email, senha) => {
    const response = await api.post('/login', { email, senha });
    const { user, token } = response.data;

    setUser(user);
    localStorage.setItem('@UniCondo:user', JSON.stringify(user));
    localStorage.setItem('@UniCondo:token', token);
  };

  const logout = () => {
    localStorage.removeItem('@UniCondo:token');
    localStorage.removeItem('@UniCondo:user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ signed: !!user, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
