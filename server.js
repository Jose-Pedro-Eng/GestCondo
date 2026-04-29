import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import bcrypt from 'bcryptjs';
import routes from './backend/routes/index.js';
import sequelize from './backend/config/database.js';
import Usuario from './backend/models/Usuario.js';
import Mensagem from './backend/models/Mensagem.js';
import jwt from 'jsonwebtoken';

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  app.use(cors());
  app.use(express.json());

  // API Routes
  app.use('/api', routes);

  // Sync DB and create default Gestor if not exists
  await sequelize.sync();
  const adminEmail = 'admin@unicondo.com';
  const adminExists = await Usuario.findOne({ where: { email: adminEmail } });
  
  const hashSenha = await bcrypt.hash('admin123', 8);
  if (!adminExists) {
    await Usuario.create({
      email: adminEmail,
      senha: hashSenha,
      perfil: 'Gestor'
    });
    console.log(`[DB] Administrador padrão criado: ${adminEmail} / admin123`);
  } else {
    // Forçar reset da senha para garantir que seja admin123
    await adminExists.update({ senha: hashSenha });
    console.log(`[DB] Administrador validado/resetado: ${adminEmail} / admin123`);
  }

  // Socket.IO
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));
    try {
      const secret = process.env.JWT_SECRET || 'fallback_secret';
      const decoded = jwt.verify(token, secret);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.user.email);
    
    // User joins their own room for notifications/direct messages
    socket.join(`user:${socket.user.id}`);

    // Join condominium broadcast room
    socket.join('condominio:1');

    // Chat Logic
    socket.on('sendMessage', async (data) => {
      const { destinatario_id, conteudo } = data;
      const remetente_id = socket.user.id;

      try {
        const msg = await Mensagem.create({
          remetente_id,
          destinatario_id,
          conteudo
        });

        // Determine room name
        // Morador only talks with Gestor
        // Gestor is always 'gestorId'
        const roomName = socket.user.perfil === 'Gestor' 
          ? `chat:${socket.user.id}:${destinatario_id}`
          : `chat:${destinatario_id}:${socket.user.id}`;

        io.to(`user:${destinatario_id}`).emit('newMessage', msg);
        io.to(`user:${remetente_id}`).emit('newMessage', msg);
      } catch (err) {
        console.error('Error sending message:', err);
      }
    });

    // Broadcast logic (simplified)
    socket.on('broadcast', (data) => {
      if (socket.user.perfil === 'Gestor') {
        io.to('condominio:1').emit('newComunicado', data);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.user.email);
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = 3000;
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
