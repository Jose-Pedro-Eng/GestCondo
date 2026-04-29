# Arquitetura do Sistema - UniCondo

Este documento descreve a topologia, fluxo de dados e decisões técnicas tomadas no desenvolvimento do projeto.

## 1. Stack Tecnológica
- **Frontend SPA**: React 18 + Vite.
- **Backend API**: Express (Framework Node.js).
- **Banco de Dados**: Sequelize (ORM). Suporta MySQL (Recomendado) e SQLite.
- **Comunicação Real-time**: Socket.IO (WebSockets) para Chat e Comunicados.
- **Autenticação**: JWT (JSON Web Token) via Bearer Token.
- **Estilização**: Tailwind CSS + Lucide Icons + Motion (Animações).

## 2. Estrutura de Pastas
- `/src`: Código-fonte do frontend React.
  - `/components`: Componentes UI reutilizáveis.
  - `/contexts`: Estados globais (Auth, Socket).
  - `/pages`: Telas completas da aplicação.
  - `/services`: Configurações de API (Axios).
- `/backend`: Lógica de servidor.
  - `/config`: Configurações de DB e segurança.
  - `/controllers`: Lógica de negócio e orquestração dos modelos.
  - `/middlewares`: Filtros de autenticação e permissão de acesso.
  - `/models`: Definição de esquemas e relacionamentos do banco de dados (Sequelize).
  - `/routes`: Mapeamento de endpoints.
- `/server.ts`: Ponto de entrada que unifica o servidor Express, o middleware de desenvolvimento do Vite e o servidor Socket.IO.

## 3. Fluxo de Dados Real-time
O sistema utiliza um padrão de "Evento-Resposta":
1. Um Gestor cria um comunicado via REST (`POST /api/comunicados`).
2. O servidor salva no banco e emite um evento via Socket (`io.emit('newComunicado')`).
3. O Morador, com uma conexão ativa, recebe o evento e atualiza o estado local do mural sem refresh.

No Chat:
- Moradores só conversam com a "Gestoria" (IDs específicos de perfil Gestor).
- Mensagens são persistidas no banco e encaminhadas via salas privadas do Socket (`socket.join('user:ID')`).

## 4. Segurança
- **Passwords**: Hasheadas usando `bcryptjs` (8 rounds).
- **Routes**: Protegidas por `authMiddleware`.
- **Privilégios**: `isGestor` valida o campo `perfil` no token JWT para rotas administrativas.
