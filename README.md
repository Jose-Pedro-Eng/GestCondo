# UniCondo - Gestão de Condomínio Universitário

Sistema full-stack para gestão de moradias estudantis, integrando controle de moradores, financeiro, reservas e comunicação em tempo real.

## 🚀 Como Executar

### Pré-requisitos
- Node.js (v18 ou superior)
- MySQL 8.0 (Opcional: O sistema utiliza SQLite por padrão para facilitar o teste imediato)

### Passo a Passo

1. **Instalar Dependências:**
   ```bash
   npm install
   ```

2. **Configuração do Ambiente:**
   - O arquivo `.env` deve ser configurado na raiz (ou o sistema usará os padrões do `backend/config/database.js`).
   - Para rodar com MySQL, altere o `DB_DIALECT` para `mysql` no `.env` e forneça as credenciais.

3. **Rodar o Projeto em Desenvolvimento:**
   > **Nota do erro "tsx não reconhecido":** Se você tentar rodar `tsx server.js` diretamente e não tiver o pacote global, o sistema falhará. Use sempre o comando do NPM que gerencia os binários locais:
   ```bash
   npm run dev
   ```

4. **Build para Produção:**
   ```bash
   npm run build
   npm start
   ```

## 🛠️ Rotas da API

### Autenticação / Públicas
- `POST /api/login`: Iniciar sessão (E-mail e Senha)

### Gestor (Requer Middleware isGestor)
- `GET /api/dashboard/gestor`: Resumo de ocupação e contratos.
- `GET /api/dashboard/financeiro`: Resumo financeiro e inadimplência.
- `GET /api/moradores`: Listar todos os moradores.
- `POST /api/moradores`: Cadastrar novo morador e usuário.
- `GET /api/unidades`: Listar todas as unidades.
- `POST /api/unidades`: Criar nova unidade.
- `PATCH /api/financeiro/:id/status`: Baixa manual de boletos.
- `POST /api/comunicados`: Publicar comunicado via Broadcast.
- `PATCH /api/reservas/:id/status`: Aprovar ou recusar reservas.

### Morador / Comuns
- `GET /api/me`: Dados do usuário logado.
- `PUT /api/moradores/:id`: Atualizar próprios dados.
- `GET /api/financeiro`: Listar boletos (seus próprios se morador).
- `GET /api/reservas`: Ver histórico de reservas.
- `POST /api/reservas`: Solicitar nova reserva.
- `GET /api/comunicados`: Ver mural de avisos.
- `POST /api/comunicados/:id/read`: Marcar aviso como lido.
- `GET /api/chat/messages/:partnerId`: Histórico de mensagens do chat.
