# 🎮 Arquitetura Single Player Online - Game Server Profissional

## 📋 Sumário Executivo

Esta proposta descreve uma arquitetura **full-stack** para jogo **single player online** onde múltiplos jogadores acessam o servidor simultaneamente, mas cada um joga sua própria partida isolada, combinando:

- **Cliente**: Game Engine modular com sincronização de estado local
- **Servidor**: API REST + WebSocket para validação, persistência e leaderboard
- **Sessões Isoladas**: Cada jogador tem sua própria sessão de jogo independente
- **Escalabilidade**: Arquitetura preparada para centenas de sessões simultâneas

**Objetivo**: Suportar múltiplos jogadores jogando simultaneamente, cada um em sua própria partida single player.

---

## 🎯 Decisões Arquiteturais - Single Player Online

### ✅ Stack Tecnológico Recomendada

| Camada | Tecnologia | Justificativa |
|--------|-----------|---------------|
| **Frontend** | TypeScript + Vite | Type-safety, build rápido, HMR |
| **Game Client** | Vanilla JS + Canvas API | Performance, sem overhead de frameworks |
| **Backend/API Server** | **Node.js + Express** ou **Bun** | API REST para endpoints |
| **Game Server (Opcional)** | **Socket.io** (apenas para validação) | Validação em tempo real (opcional) |
| **Database** | **PostgreSQL** | Dados persistentes (usuários, leaderboards, progresso) |
| **Cache/Redis** | **Redis** (opcional) | Sessões, rate limiting, cache |
| **Deployment** | **Docker + Railway/Render** | Deploy simplificado |
| **CDN** | **Cloudflare** | Assets estáticos, latência baixa |

**Stack Final Recomendada:**
```
Frontend: TypeScript + Vite + Canvas API
Backend: Node.js/Bun + Express + PostgreSQL
Deploy: Docker + Cloudflare
```

**Nota**: WebSocket (Socket.io) é **opcional** - só necessário se quiser validação em tempo real. Para single player, REST API é suficiente.

---

## 🏗️ Arquitetura Full-Stack

### Estrutura de Diretórios Completa

```
game-canvas/
├── client/                    # Cliente (Frontend)
│   ├── src/
│   │   ├── engine/            # Game Engine
│   │   │   ├── GameEngine.ts
│   │   │   ├── GameLoop.ts
│   │   │   ├── EventBus.ts
│   │   │   └── SaveManager.ts  # 🆕 Gerenciamento de salvamento
│   │   │
│   │   ├── api/               # 🆕 API Client
│   │   │   ├── ApiClient.ts   # Cliente REST
│   │   │   ├── AuthService.ts # Autenticação
│   │   │   └── LeaderboardService.ts
│   │   │
│   │   ├── state/
│   │   │   ├── GameState.ts
│   │   │   ├── GameStore.ts
│   │   │   └── SessionState.ts # 🆕 Estado da sessão
│   │   │
│   │   ├── entities/          # Entidades do Jogo
│   │   │   ├── Entity.ts
│   │   │   ├── Player.ts
│   │   │   ├── Enemy.ts
│   │   │   ├── Projectile.ts
│   │   │   └── Particle.ts
│   │   │
│   │   ├── systems/           # Sistemas que processam entidades
│   │   │   ├── RenderSystem.ts
│   │   │   ├── PhysicsSystem.ts
│   │   │   ├── CollisionSystem.ts
│   │   │   ├── SpawnSystem.ts
│   │   │   ├── CombatSystem.ts
│   │   │   └── ParticleSystem.ts
│   │   │
│   │   ├── managers/
│   │   │   ├── InputManager.ts
│   │   │   ├── CooldownManager.ts
│   │   │   ├── EconomyManager.ts
│   │   │   ├── UIManager.ts
│   │   │   └── SaveManager.ts  # 🆕 Salvamento local/remoto
│   │   │
│   │   ├── ui/
│   │   │   ├── HUD.ts
│   │   │   ├── Menu.ts
│   │   │   ├── Login.ts         # 🆕 Tela de login
│   │   │   └── Leaderboard.ts   # 🆕 Leaderboard
│   │   │
│   │   └── main.ts
│   │
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
│
├── server/                     # 🆕 Servidor (Backend)
│   ├── src/
│   │   ├── api/                # API REST
│   │   │   ├── routes/
│   │   │   │   ├── auth.ts     # Autenticação
│   │   │   │   ├── sessions.ts # Sessões de jogo
│   │   │   │   ├── leaderboard.ts
│   │   │   │   └── users.ts
│   │   │   ├── controllers/
│   │   │   │   ├── AuthController.ts
│   │   │   │   ├── SessionController.ts
│   │   │   │   └── LeaderboardController.ts
│   │   │   └── middleware/
│   │   │       ├── auth.ts     # JWT middleware
│   │   │       └── rateLimiter.ts
│   │   │
│   │   ├── validation/         # 🆕 Validação (Anti-Cheat)
│   │   │   ├── ScoreValidator.ts
│   │   │   └── SessionValidator.ts
│   │   │
│   │   ├── database/           # 🆕 Database
│   │   │   ├── models/
│   │   │   │   ├── User.ts
│   │   │   │   ├── GameSession.ts
│   │   │   │   └── Leaderboard.ts
│   │   │   ├── migrations/
│   │   │   └── seeders/
│   │   │
│   │   ├── auth/               # 🆕 Autenticação
│   │   │   ├── AuthService.ts
│   │   │   └── JWT.ts
│   │   │
│   │   └── index.ts            # Entry point do servidor
│   │
│   ├── package.json
│   └── tsconfig.json
│
├── shared/                      # 🆕 Código compartilhado
│   ├── types/                   # Types compartilhados
│   │   ├── entities.ts
│   │   ├── api.ts
│   │   └── game.ts
│   │
│   └── constants/               # Constantes compartilhadas
│       └── game.ts
│
├── docker-compose.yml           # 🆕 Orquestração local
├── Dockerfile.client            # 🆕 Build cliente
├── Dockerfile.server            # 🆕 Build servidor
└── README.md
```

---

## 🔌 API REST (Cliente-Servidor)

### Endpoints da API

```typescript
// shared/types/api.ts

// ============ AUTENTICAÇÃO ============
POST   /api/auth/register     // Registrar usuário
POST   /api/auth/login         // Login
POST   /api/auth/refresh       // Refresh token
POST   /api/auth/logout        // Logout

// ============ SESSÕES DE JOGO ============
POST   /api/sessions           // Criar nova sessão
GET    /api/sessions/:id       // Obter sessão
PATCH  /api/sessions/:id       // Atualizar sessão (score, xp, etc)
POST   /api/sessions/:id/end   // Finalizar sessão

// ============ LEADERBOARD ============
GET    /api/leaderboard        // Obter leaderboard
GET    /api/leaderboard/me     // Posição do usuário atual

// ============ USUÁRIOS ============
GET    /api/users/me           // Perfil do usuário atual
PATCH  /api/users/me           // Atualizar perfil
```

### Tipos de Requisições/Respostas

```typescript
// ============ AUTENTICAÇÃO ============
interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}

interface LoginRequest {
    email: string;
    password: string;
}

interface AuthResponse {
    token: string;
    refreshToken: string;
    user: {
        id: string;
        username: string;
        email: string;
    };
}

// ============ SESSÕES ============
interface CreateSessionRequest {
    // Opcional: dados iniciais
}

interface SessionResponse {
    id: string;
    userId: string;
    score: number;
    xp: number;
    startedAt: string;
    isActive: boolean;
}

interface UpdateSessionRequest {
    score?: number;
    xp?: number;
    // Estado atual do jogo (opcional, para validação)
    gameState?: {
        enemiesKilled: number;
        projectilesFired: number;
        timeElapsed: number;
    };
}

interface EndSessionRequest {
    finalScore: number;
    finalXp: number;
    duration: number; // em segundos
    gameState: {
        enemiesKilled: number;
        projectilesFired: number;
        timeElapsed: number;
    };
}

// ============ LEADERBOARD ============
interface LeaderboardEntry {
    rank: number;
    username: string;
    score: number;
    xp: number;
    achievedAt: string;
}

interface LeaderboardResponse {
    entries: LeaderboardEntry[];
    total: number;
    currentUser?: LeaderboardEntry; // Posição do usuário atual
}
```

---

## 🎮 Fluxo de Jogo (Single Player)

### Fluxo Completo

```
1. Login/Registro
   └─> Cliente envia credenciais
   └─> Servidor retorna JWT token

2. Iniciar Sessão
   └─> Cliente cria sessão via POST /api/sessions
   └─> Servidor retorna sessionId
   └─> Cliente inicia jogo local

3. Durante o Jogo (Local)
   └─> Jogo roda 100% local no cliente
   └─> Atualizações periódicas opcionais:
       └─> PATCH /api/sessions/:id (score, xp intermediário)

4. Finalizar Sessão
   └─> POST /api/sessions/:id/end
   └─> Servidor valida score (anti-cheat)
   └─> Servidor salva no leaderboard
   └─> Cliente exibe resultado

5. Leaderboard
   └─> GET /api/leaderboard
   └─> Cliente exibe rankings
```

---

## 🖥️ Servidor API (Express)

### Estrutura do Servidor

```typescript
// server/src/index.ts

import express from 'express';
import cors from 'cors';
import { authRoutes } from './api/routes/auth';
import { sessionRoutes } from './api/routes/sessions';
import { leaderboardRoutes } from './api/routes/leaderboard';
import { authMiddleware } from './api/middleware/auth';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Rotas públicas
app.use('/api/auth', authRoutes);

// Rotas protegidas (requer autenticação)
app.use('/api/sessions', authMiddleware, sessionRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/users', authMiddleware, userRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

### Controller de Sessões

```typescript
// server/src/api/controllers/SessionController.ts

import { Request, Response } from 'express';
import { GameSession } from '../../database/models/GameSession';
import { ScoreValidator } from '../../validation/ScoreValidator';

export class SessionController {
    // Criar nova sessão
    async create(req: Request, res: Response) {
        const userId = req.user!.id; // Do JWT middleware
        
        const session = await GameSession.create({
            userId,
            score: 0,
            xp: 0,
            isActive: true,
            startedAt: new Date()
        });

        res.json(session);
    }

    // Atualizar sessão (durante o jogo)
    async update(req: Request, res: Response) {
        const { id } = req.params;
        const { score, xp, gameState } = req.body;
        const userId = req.user!.id;

        const session = await GameSession.findOne({
            where: { id, userId, isActive: true }
        });

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        // Atualizar score/xp intermediário
        session.score = score;
        session.xp = xp;
        await session.save();

        res.json(session);
    }

    // Finalizar sessão
    async end(req: Request, res: Response) {
        const { id } = req.params;
        const { finalScore, finalXp, duration, gameState } = req.body;
        const userId = req.user!.id;

        const session = await GameSession.findOne({
            where: { id, userId, isActive: true }
        });

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        // Validar score (anti-cheat)
        const validator = new ScoreValidator();
        const isValid = await validator.validate({
            session,
            finalScore,
            finalXp,
            duration,
            gameState
        });

        if (!isValid) {
            return res.status(400).json({ 
                error: 'Invalid score - potential cheating detected' 
            });
        }

        // Finalizar sessão
        session.score = finalScore;
        session.xp = finalXp;
        session.duration = duration;
        session.isActive = false;
        session.finishedAt = new Date();
        await session.save();

        // Atualizar leaderboard
        await this.updateLeaderboard(userId, finalScore, finalXp);

        res.json({
            success: true,
            session,
            leaderboardPosition: await this.getUserLeaderboardPosition(userId)
        });
    }

    private async updateLeaderboard(userId: string, score: number, xp: number) {
        // Lógica para atualizar leaderboard
        // Verificar se score é maior que o atual do usuário
    }
}
```

---

## 🔒 Validação Anti-Cheat

### Score Validator

```typescript
// server/src/validation/ScoreValidator.ts

export class ScoreValidator {
    // Validar se score é plausível
    async validate(data: {
        session: GameSession;
        finalScore: number;
        finalXp: number;
        duration: number; // em segundos
        gameState: {
            enemiesKilled: number;
            projectilesFired: number;
            timeElapsed: number;
        };
    }): Promise<boolean> {
        const { finalScore, finalXp, duration, gameState } = data;

        // 1. Verificar se score não é negativo
        if (finalScore < 0 || finalXp < 0) return false;

        // 2. Verificar relação score/xp (regra do jogo)
        // Ex: xp deve ser proporcional ao score
        const expectedXpRatio = this.calculateExpectedXpRatio(finalScore);
        if (finalXp > expectedXpRatio * 2) return false; // Muito mais XP que esperado

        // 3. Verificar tempo mínimo/máximo
        if (duration < 1 || duration > 3600) return false; // Entre 1s e 1h

        // 4. Verificar relação enemiesKilled / score
        // Assumindo que cada inimigo vale em média 2 pontos
        const maxPossibleScore = gameState.enemiesKilled * 5; // Margem de erro
        if (finalScore > maxPossibleScore) return false;

        // 5. Verificar se updates intermediários eram consistentes
        // (se houver histórico de updates)

        return true;
    }

    private calculateExpectedXpRatio(score: number): number {
        // Lógica baseada nas regras do jogo
        // Exemplo simples: XP = Score * 0.5 em média
        return score * 0.5;
    }
}
```

### Rate Limiting

```typescript
// server/src/api/middleware/rateLimiter.ts

import rateLimit from 'express-rate-limit';

// Limitar criação de sessões
export const sessionCreationLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 10, // 10 sessões por minuto
    message: 'Too many sessions created, please try again later'
});

// Limitar updates de sessão
export const sessionUpdateLimiter = rateLimit({
    windowMs: 1 * 1000, // 1 segundo
    max: 10, // 10 updates por segundo
    message: 'Too many session updates'
});
```

---

## 📊 Database Schema

### PostgreSQL Schema

```sql
-- Tabela de Usuários
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Sessões de Jogo
CREATE TABLE game_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    score INTEGER DEFAULT 0,
    xp INTEGER DEFAULT 0,
    duration_seconds INTEGER,
    is_active BOOLEAN DEFAULT true,
    started_at TIMESTAMP DEFAULT NOW(),
    finished_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Leaderboard (Cache/Histórico)
CREATE TABLE leaderboard (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    username VARCHAR(50) NOT NULL,
    score INTEGER NOT NULL,
    xp INTEGER NOT NULL,
    achieved_at TIMESTAMP DEFAULT NOW(),
    session_id UUID REFERENCES game_sessions(id) ON DELETE SET NULL,
    rank INTEGER,
    UNIQUE(user_id) -- Um registro por usuário (melhor score)
);

-- Tabela de Progresso do Usuário (Opcional)
CREATE TABLE user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    total_score INTEGER DEFAULT 0,
    total_xp INTEGER DEFAULT 0,
    total_games INTEGER DEFAULT 0,
    best_score INTEGER DEFAULT 0,
    best_xp INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_game_sessions_user ON game_sessions(user_id);
CREATE INDEX idx_game_sessions_active ON game_sessions(is_active);
CREATE INDEX idx_leaderboard_score ON leaderboard(score DESC);
CREATE INDEX idx_leaderboard_user ON leaderboard(user_id);
```

---

## 🎯 Cliente: Game Engine + API Client

### API Client

```typescript
// client/src/api/ApiClient.ts

export class ApiClient {
    private baseUrl: string;
    private token: string | null = null;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
        this.token = localStorage.getItem('auth_token');
    }

    setToken(token: string) {
        this.token = token;
        localStorage.setItem('auth_token', token);
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        return response.json();
    }

    // Sessões
    async createSession(): Promise<SessionResponse> {
        return this.request<SessionResponse>('/api/sessions', {
            method: 'POST',
        });
    }

    async updateSession(
        sessionId: string,
        data: UpdateSessionRequest
    ): Promise<SessionResponse> {
        return this.request<SessionResponse>(`/api/sessions/${sessionId}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    async endSession(
        sessionId: string,
        data: EndSessionRequest
    ): Promise<SessionResponse> {
        return this.request<SessionResponse>(`/api/sessions/${sessionId}/end`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // Leaderboard
    async getLeaderboard(): Promise<LeaderboardResponse> {
        return this.request<LeaderboardResponse>('/api/leaderboard');
    }
}
```

### Save Manager (Integração com API)

```typescript
// client/src/managers/SaveManager.ts

import { ApiClient } from '../api/ApiClient';
import { eventBus } from '../engine/EventBus';

export class SaveManager {
    private apiClient: ApiClient;
    private currentSessionId: string | null = null;
    private updateInterval: number | null = null;

    constructor(apiClient: ApiClient) {
        this.apiClient = apiClient;
        
        // Escutar eventos do jogo
        eventBus.on('game:score:changed', this.handleScoreChange.bind(this));
        eventBus.on('game:xp:changed', this.handleXpChange.bind(this));
    }

    async startSession(): Promise<void> {
        const session = await this.apiClient.createSession();
        this.currentSessionId = session.id;

        // Atualizar periódicamente (opcional)
        this.updateInterval = setInterval(() => {
            this.updateSession();
        }, 5000); // A cada 5 segundos
    }

    async updateSession(): Promise<void> {
        if (!this.currentSessionId) return;

        const gameState = this.getCurrentGameState();

        try {
            await this.apiClient.updateSession(this.currentSessionId, {
                score: gameState.score,
                xp: gameState.xp,
                gameState: {
                    enemiesKilled: gameState.enemiesKilled,
                    projectilesFired: gameState.projectilesFired,
                    timeElapsed: gameState.timeElapsed,
                },
            });
        } catch (error) {
            console.error('Failed to update session:', error);
        }
    }

    async endSession(): Promise<void> {
        if (!this.currentSessionId) return;

        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }

        const gameState = this.getCurrentGameState();

        try {
            await this.apiClient.endSession(this.currentSessionId, {
                finalScore: gameState.score,
                finalXp: gameState.xp,
                duration: gameState.timeElapsed,
                gameState: {
                    enemiesKilled: gameState.enemiesKilled,
                    projectilesFired: gameState.projectilesFired,
                    timeElapsed: gameState.timeElapsed,
                },
            });

            // Atualizar leaderboard local
            eventBus.emit('leaderboard:updated');
        } catch (error) {
            console.error('Failed to end session:', error);
        }

        this.currentSessionId = null;
    }

    private getCurrentGameState() {
        // Obter estado atual do jogo (do GameStore ou similar)
        // ...
        return {
            score: 0,
            xp: 0,
            enemiesKilled: 0,
            projectilesFired: 0,
            timeElapsed: 0,
        };
    }

    private handleScoreChange(score: number) {
        // Atualizar sessão quando score muda
        this.updateSession();
    }

    private handleXpChange(xp: number) {
        // Atualizar sessão quando XP muda
        this.updateSession();
    }
}
```

---

## 🚀 Deploy e Escalabilidade

### Docker Compose (Desenvolvimento)

```yaml
# docker-compose.yml

version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: game_db
      POSTGRES_USER: game_user
      POSTGRES_PASSWORD: game_pass
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  game-server:
    build:
      context: ./server
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://game_user:game_pass@postgres:5432/game_db
      JWT_SECRET: your-secret-key
      NODE_ENV: development
    depends_on:
      - postgres

  game-client:
    build:
      context: ./client
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      VITE_API_URL: http://localhost:3001

volumes:
  postgres_data:
```

---

## 📈 Roadmap de Implementação

### Fase 1: Setup Base (Semana 1)
- ✅ Setup TypeScript + Vite (cliente)
- ✅ Setup Node.js + Express (servidor)
- ✅ Estrutura de pastas
- ✅ Database PostgreSQL

### Fase 2: Autenticação (Semana 1-2)
- ✅ Sistema de registro/login
- ✅ JWT tokens
- ✅ Middleware de autenticação
- ✅ UI de login/registro

### Fase 3: API REST (Semana 2)
- ✅ Endpoints de sessões
- ✅ API Client no frontend
- ✅ Integração básica

### Fase 4: Sessões de Jogo (Semana 2-3)
- ✅ Criar/finalizar sessões
- ✅ Salvamento periódico (opcional)
- ✅ Validação de scores

### Fase 5: Leaderboard (Semana 3)
- ✅ Tabela de leaderboard
- ✅ Endpoint GET /leaderboard
- ✅ UI de leaderboard

### Fase 6: Anti-Cheat (Semana 3-4)
- ✅ Score Validator
- ✅ Rate limiting
- ✅ Validação de sessões

### Fase 7: Polimento (Semana 4)
- ✅ Tratamento de erros
- ✅ Loading states
- ✅ Performance tuning
- ✅ Testes

---

## 🎯 Considerações Finais

### Escalabilidade

- **Stateless API**: Cada requisição é independente
- **Horizontal Scaling**: Múltiplas instâncias do servidor (load balancer)
- **Database**: PostgreSQL pode escalar verticalmente/horizontalmente
- **CDN**: Assets estáticos via Cloudflare

### Performance

- **Jogo 100% Local**: Lógica do jogo roda no cliente (zero latência)
- **API Assíncrona**: Updates periódicos não bloqueiam gameplay
- **Cache**: Leaderboard pode ser cacheado (Redis opcional)

### Segurança

- **Validação de Score**: Anti-cheat no servidor
- **Rate Limiting**: Prevenir spam de requisições
- **JWT**: Tokens seguros para autenticação

### Custos Estimados

- **Desenvolvimento**: ~1 mês (1 desenvolvedor)
- **Infraestrutura**:
  - Servidor: $10-30/mês (Railway/Render)
  - Database: $10-25/mês (PostgreSQL managed)
  - CDN: $0/mês (Cloudflare free tier)

---

## ❓ Dúvidas ou Ajustes?

Esta arquitetura é otimizada para single player online. Posso detalhar qualquer parte específica ou criar código de exemplo adicional.
