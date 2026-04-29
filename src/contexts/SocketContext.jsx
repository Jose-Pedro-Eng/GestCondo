import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext({});

export const SocketProvider = ({ children }) => {
  const { signed } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (signed) {
      const token = localStorage.getItem('@UniCondo:token');
      const newSocket = io('/', {
        auth: { token }
      });

      setSocket(newSocket);

      return () => newSocket.close();
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [signed]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
