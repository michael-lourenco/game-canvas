# 🔄 Guia de Migração: Local → Servidor

## Quando Você Quiser Migrar para Servidor

Esta arquitetura foi projetada para facilitar a migração. Siga estes passos:

---

## 📋 Passo 1: Implementar Servidor (Backend)

### 1.1 Database
- [ ] Setup PostgreSQL
- [ ] Criar migrations (Users, Sessions, Leaderboard)
- [ ] Implementar models

### 1.2 API Endpoints
- [ ] Implementar `/api/sessions` (POST, GET, PATCH, POST /end)
- [ ] Implementar `/api/leaderboard` (GET)
- [ ] Implementar `/api/auth` (se necessário)

### 1.3 Validação
- [ ] Score Validator (anti-cheat)
- [ ] Rate Limiting

---

## 📋 Passo 2: Implementar ApiStorageService

### 2.1 Implementar Métodos

```typescript
// client/src/storage/ApiStorageService.ts

export class ApiStorageService implements IStorageService {
    constructor(private apiClient: ApiClient) {}

    async saveSession(sessionId: string, data: GameSessionData): Promise<void> {
        await this.apiClient.updateSession(sessionId, {
            score: data.score,
            xp: data.xp,
            gameState: data.gameState,
        });
    }

    async getSession(sessionId: string): Promise<GameSessionData | null> {
        return await this.apiClient.getSession(sessionId);
    }

    // ... implementar outros métodos
}
```

### 2.2 Testar ApiStorageService

```typescript
const apiClient = new ApiClient('http://localhost:3001');
const storage = new ApiStorageService(apiClient);

// Testar cada método
await storage.saveSession('test', { ... });
```

---

## 📋 Passo 3: Trocar Factory

### 3.1 Opção A: Feature Flag (Recomendado)

```typescript
// client/src/storage/index.ts

export function createStorageService(): IStorageService {
    const useServer = import.meta.env.VITE_USE_SERVER === 'true';
    
    if (useServer) {
        const apiClient = new ApiClient(import.meta.env.VITE_API_URL);
        return new ApiStorageService(apiClient);
    }
    
    return new LocalStorageService();
}
```

**Configurar**:
```env
# .env
VITE_USE_SERVER=true
VITE_API_URL=http://localhost:3001
```

### 3.2 Opção B: Troca Direta

```typescript
// client/src/storage/index.ts

export function createStorageService(): IStorageService {
    // Trocar diretamente
    const apiClient = new ApiClient('http://your-api.com');
    return new ApiStorageService(apiClient);
}
```

---

## 📋 Passo 4: Migrar Dados Existentes (Opcional)

### 4.1 Exportar dados do localStorage

```typescript
// Criar utilitário para exportar
const exportData = async () => {
    const localStorage = new LocalStorageService();
    const sessions = await localStorage.getAllSessions();
    const leaderboard = await localStorage.getLeaderboard();
    const progress = await localStorage.getProgress();
    
    return {
        sessions,
        leaderboard,
        progress,
    };
};
```

### 4.2 Importar para servidor

```typescript
// Criar endpoint de importação no servidor
// POST /api/migrate/import
// Recebe dados e salva no database
```

---

## 📋 Passo 5: Testar

### 5.1 Testar localmente

```bash
# Terminal 1: Servidor
cd server
npm run dev

# Terminal 2: Client com VITE_USE_SERVER=true
cd client
VITE_USE_SERVER=true npm run dev
```

### 5.2 Verificar dados

- [ ] Criar sessão funciona
- [ ] Atualizar sessão funciona
- [ ] Finalizar sessão funciona
- [ ] Leaderboard funciona
- [ ] Dados salvos no servidor (verificar database)

---

## 📋 Passo 6: Deploy

### 6.1 Deploy Servidor

- [ ] Deploy API (Railway, Render, etc)
- [ ] Configurar variáveis de ambiente
- [ ] Testar endpoints

### 6.2 Deploy Client

- [ ] Build: `npm run build`
- [ ] Configurar `VITE_API_URL` para produção
- [ ] Deploy (Vercel, Netlify, etc)

---

## ✅ Checklist Final

- [ ] Servidor rodando e acessível
- [ ] `ApiStorageService` implementado e testado
- [ ] Factory trocado
- [ ] Testes passando
- [ ] Dados migrados (opcional)
- [ ] Deploy funcionando

---

## 🎯 Resultado

Depois da migração:

- ✅ Código do jogo **não mudou** (usando `SaveManager` igual)
- ✅ Apenas trocou implementação de storage
- ✅ Transparente para o resto do código
- ✅ Pode manter ambas implementações (feature flag)

---

## 📝 Notas

- **Gradual**: Pode migrar gradualmente usando feature flag
- **Reversível**: Pode voltar para localStorage facilmente
- **Testável**: Teste ambas implementações
- **Documentado**: Código auto-documentado via interfaces
