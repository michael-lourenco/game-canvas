# 🚀 Guia de Setup - Nova Arquitetura

## ✅ Estrutura Criada

A nova estrutura de arquitetura foi criada seguindo a proposta em `ARCHITECTURE_MULTIPLAYER.md`.

### Estrutura de Pastas

```
game-canvas/
├── client/              # Frontend (TypeScript + Vite)
│   ├── src/
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── server/              # Backend (Node.js + Express)
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
│
└── shared/              # Código compartilhado
    └── types/
```

## 📦 Instalação

### 1. Instalar dependências do Client

```bash
cd client
npm install
```

### 2. Instalar dependências do Server

```bash
cd server
npm install
```

## 🏃 Executar

### Client (Frontend)

```bash
cd client
npm run dev
```

Acesse: `http://localhost:3000`

### Server (Backend)

```bash
cd server
npm run dev
```

Server rodando em: `http://localhost:3001`

## ✅ Progresso Atual

### ✅ Fase 1: Setup Base - COMPLETA
- [x] Estrutura de pastas criada
- [x] TypeScript + Vite configurado (client)
- [x] Node.js + Express configurado (server)
- [x] Código existente migrado para TypeScript:
  - [x] Entities (Player, Enemy, Projectile, Particle, Canvas)
  - [x] Data (enemies, projectiles)
  - [x] Config (game config)
  - [x] Utils (funções utilitárias)
- [x] API Client criado (client/src/api/ApiClient.ts)
- [x] Estrutura inicial do servidor API criada
  - [x] Rotas (auth, sessions, leaderboard)
  - [x] Middleware de autenticação (placeholder)

## 📋 Próximos Passos

### Fase 2: Autenticação
- [ ] Implementar registro/login com JWT
- [ ] Implementar middleware de autenticação real
- [ ] UI de login/registro no client

### Fase 3: Database & Models
- [ ] Configurar PostgreSQL
- [ ] Criar models (User, GameSession, Leaderboard)
- [ ] Criar migrations

### Fase 4: Implementar Endpoints
- [ ] Implementar `/api/sessions` (criar, atualizar, finalizar)
- [ ] Implementar `/api/leaderboard`
- [ ] Validação anti-cheat (ScoreValidator)

### Fase 5: Migrar Game Logic
- [ ] Migrar main.js para client/src/main.ts
- [ ] Criar GameEngine, GameLoop
- [ ] Criar Systems (Render, Physics, Collision, etc)
- [ ] Criar Managers (Input, Cooldown, Economy, etc)

## 🐛 Troubleshooting

### Erro: "Cannot find module"
- Execute `npm install` em ambos client/ e server/

### Erro: TypeScript
- Verifique se `tsconfig.json` está correto
- Execute `npm run build` para verificar erros

## 📚 Documentação

- **Arquitetura**: `ARCHITECTURE_MULTIPLAYER.md`
- **Exemplos**: `EXAMPLES.md`
- **Comparação de Techs**: `TECH_STACK_COMPARISON.md`
