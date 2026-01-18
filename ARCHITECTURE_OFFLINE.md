# 🎮 Arquitetura Offline/Local - Game Engine

## 📋 Visão Geral

Esta arquitetura é **100% offline/local**, usando recursos do browser (localStorage) para persistência. A estrutura foi projetada para **facilmente migrar para servidor/database no futuro** sem grandes refatorações.

---

## 🏗️ Arquitetura Atual

### Sistema de Storage

```
IStorageService (Interface)
    ├── LocalStorageService (Implementação atual) ✅
    └── ApiStorageService (Implementação futura) 📋
```

### Como Funciona

1. **Interface `IStorageService`**: Define contrato para armazenamento
2. **`LocalStorageService`**: Implementação usando localStorage do browser
3. **`ApiStorageService`**: Placeholder para migração futura (usando API)

### Factory Pattern

```typescript
// client/src/storage/index.ts
export function createStorageService(): IStorageService {
    // Atualmente: usa localStorage
    return new LocalStorageService();
    
    // NO FUTURO: apenas trocar por ApiStorageService
    // const apiClient = new ApiClient(API_URL);
    // return new ApiStorageService(apiClient);
}
```

---

## 💾 O Que é Salvo Localmente

### 1. Sessões de Jogo (`game_sessions`)
- Score e XP de cada partida
- Duração do jogo
- Estado do jogo (inimigos mortos, projéteis disparados, etc)
- Histórico de todas as sessões

### 2. Leaderboard Local (`game_leaderboard`)
- Top 100 pontuações
- Ordenado por score (maior primeiro)
- Limitado a 100 entradas para não exceder quota do localStorage

### 3. Progresso do Jogador (`game_progress`)
- Score total acumulado
- XP total acumulado
- Número total de jogos
- Melhor score e melhor XP
- Última data jogada

### 4. Configurações (`game_settings`)
- Volume
- Dificuldade
- Outras preferências

---

## 📁 Estrutura de Arquivos

```
client/src/
├── storage/
│   ├── IStorageService.ts        # Interface (contrato)
│   ├── LocalStorageService.ts    # ✅ Implementação atual (localStorage)
│   ├── ApiStorageService.ts      # 📋 Implementação futura (API)
│   └── index.ts                  # Factory para criar instância
│
├── managers/
│   └── SaveManager.ts            # Gerencia salvamento usando IStorageService
│
└── api/                          # (Opcional) API Client para futuro
    └── ApiClient.ts              # Não usado agora, mas pronto para futuro
```

---

## 🔄 Como Migrar para Servidor (Futuro)

### Passo 1: Implementar ApiStorageService

```typescript
// client/src/storage/ApiStorageService.ts
export class ApiStorageService implements IStorageService {
    constructor(private apiClient: ApiClient) {}
    
    async saveSession(sessionId: string, data: GameSessionData): Promise<void> {
        await this.apiClient.updateSession(sessionId, data);
    }
    
    // ... implementar outros métodos
}
```

### Passo 2: Trocar Factory

```typescript
// client/src/storage/index.ts
export function createStorageService(): IStorageService {
    // Trocar apenas esta linha:
    const apiClient = new ApiClient(import.meta.env.VITE_API_URL);
    return new ApiStorageService(apiClient);
    
    // Ou usar feature flag:
    // if (import.meta.env.VITE_USE_SERVER === 'true') {
    //     return new ApiStorageService(apiClient);
    // }
    // return new LocalStorageService();
}
```

### Passo 3: Pronto!

- ✅ `SaveManager` não precisa mudar (usa `IStorageService`)
- ✅ Resto do código não precisa mudar
- ✅ Migração transparente

---

## 🎯 Benefícios desta Arquitetura

### ✅ Offline First
- Jogo funciona sem internet
- Sem latência de rede
- Sem custos de servidor

### ✅ Facilidade de Migração
- Interface clara (`IStorageService`)
- Implementações isoladas
- Troca simples no futuro

### ✅ Testável
- Fácil mockar `IStorageService` para testes
- Implementações independentes

### ✅ Escalável
- Estrutura pronta para servidor
- API Client já criado (não usado agora)
- Rotas do servidor prontas (não implementadas)

---

## 🔧 Uso no Código

### Criar SaveManager

```typescript
import { SaveManager } from './managers/SaveManager';
import { createStorageService } from './storage';

// Cria automaticamente LocalStorageService (atual)
const saveManager = new SaveManager();

// Ou passar explicitamente:
// const storage = createStorageService();
// const saveManager = new SaveManager(storage);
```

### Usar SaveManager

```typescript
// Iniciar sessão
const sessionId = await saveManager.startSession();

// Atualizar durante jogo
await saveManager.updateSession(score, xp);

// Finalizar e salvar
await saveManager.endSession(finalScore, finalXp);

// Obter leaderboard
const leaderboard = await saveManager.getLeaderboard(10);

// Obter progresso
const progress = await saveManager.getProgress();
```

---

## 📊 Dados Salvos no Browser

### localStorage Keys

```
game_sessions    → { [sessionId]: GameSessionData }
game_leaderboard → LeaderboardEntry[]
game_progress    → PlayerProgress
game_settings    → GameSettings
```

### Tamanho Limite

- localStorage: ~5-10MB (depende do browser)
- Limpeza automática: mantém apenas últimas 50 sessões
- Leaderboard limitado: top 100 entradas

---

## 🚀 Próximos Passos (Quando Quiser Migrar)

1. **Implementar servidor API** (já estruturado em `/server`)
2. **Implementar `ApiStorageService`** (já criado, só implementar métodos)
3. **Trocar factory** em `storage/index.ts`
4. **Testar** - migração transparente!

---

## 📝 Notas

- **Código antigo preservado**: `/core`, `/data`, `/utils` intactos
- **Servidor não usado agora**: Estrutura pronta mas não implementada
- **API Client criado**: Não usado agora, mas pronto para futuro
- **100% local**: Tudo funciona no browser do usuário

---

## ❓ Dúvidas

**P: Posso usar IndexedDB em vez de localStorage?**
R: Sim! Basta criar `IndexedDBStorageService implements IStorageService` e trocar na factory.

**P: Como sincronizar dados quando migrar para servidor?**
R: Implementar método de migração em `ApiStorageService` que leia localStorage e envie para API.

**P: Como fazer backup dos dados locais?**
R: Implementar export/import JSON em `SaveManager` (futuro).
