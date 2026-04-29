import { Router } from 'express';
import AuthController from '../controllers/AuthController.js';
import MoradorController from '../controllers/MoradorController.js';
import UnidadeController from '../controllers/UnidadeController.js';
import DashboardController from '../controllers/DashboardController.js';
import FinanceiroController from '../controllers/FinanceiroController.js';
import AreaComumController from '../controllers/AreaComumController.js';
import ReservaController from '../controllers/ReservaController.js';
import ChatController from '../controllers/ChatController.js';
import ComunicadoController from '../controllers/ComunicadoController.js';
import { authMiddleware, isGestor } from '../middlewares/authMiddleware.js';

const routes = new Router();

// Public routes
routes.post('/login', AuthController.login);

// Protected routes
routes.use(authMiddleware);

routes.get('/me', AuthController.me);

// Dashboard
routes.get('/dashboard/gestor', isGestor, DashboardController.gestor);
routes.get('/dashboard/financeiro', isGestor, FinanceiroController.dashboard);

// Moradores
routes.get('/moradores', isGestor, MoradorController.index);
routes.post('/moradores', isGestor, MoradorController.store);
routes.put('/moradores/:id', MoradorController.update); 
routes.delete('/moradores/:id', isGestor, MoradorController.delete);

// Unidades
routes.get('/unidades', isGestor, UnidadeController.index);
routes.post('/unidades', isGestor, UnidadeController.store);
routes.put('/unidades/:id', isGestor, UnidadeController.update);
routes.delete('/unidades/:id', isGestor, UnidadeController.delete);

// Financeiro
routes.get('/financeiro', FinanceiroController.index);
routes.post('/financeiro', isGestor, FinanceiroController.store);
routes.patch('/financeiro/:id/status', isGestor, FinanceiroController.updateStatus);

// Áreas Comuns
routes.get('/areas-comuns', AreaComumController.index);
routes.post('/areas-comuns', isGestor, AreaComumController.store);
routes.put('/areas-comuns/:id', isGestor, AreaComumController.update);
routes.delete('/areas-comuns/:id', isGestor, AreaComumController.delete);

// Reservas
routes.get('/reservas', ReservaController.index);
routes.post('/reservas', ReservaController.store);
routes.patch('/reservas/:id/status', isGestor, ReservaController.updateStatus);

// Chat
routes.get('/chat/conversations', ChatController.getConversations);
routes.get('/chat/messages/:partnerId', ChatController.getMessages);

// Comunicados
routes.get('/comunicados', ComunicadoController.index);
routes.post('/comunicados', isGestor, ComunicadoController.store);
routes.post('/comunicados/:id/read', ComunicadoController.markAsRead);

export default routes;
