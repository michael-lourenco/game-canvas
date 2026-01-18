# 🏗️ Proposta de Arquitetura - Game Engine Structure

## 📋 Sumário Executivo

Esta proposta descreve uma arquitetura **Game Engine-like** híbrida que combina:
- **State Machine** para gerenciamento de estados do jogo
- **Event Bus** para comunicação desacoplada
- **Sistema de Managers/Systems** para responsabilidades específicas
- **Component-based** para entidades do jogo

**Justificativa:** Evita a complexidade excessiva do ECS puro (para jogos 2D simples) enquanto mantém escalabilidade profissional.

---

## 🎯 Decisões Arquiteturais

### ✅ Tecnologias Recomendadas

| Tecnologia | Recomendado? | Justificativa |
|------------|--------------|---------------|
| **TypeScript** | ⭐ **SIM** | Type-safety, autocomplete, refactoring seguro, melhor DX |
| **Vite** | ⭐ **SIM** | Dev server rápido, HMR, build otimizado, zero config |
| **Zustand/Redux** | ⚠️ **Opcional** | Para jogos simples, um Store custom é suficiente |
| **Web Workers** | ❌ **Não (agora)** | Canvas precisa do main thread; útil só para cálculos pesados |
| **Next.js** | ❌ **Não** | SSG/SSR desnecessário para jogo client-side |

**Stack Final Recomendada:**
```
TypeScript + Vite + Vanilla JS (ou Zustand se necessário)
```

---

## 🗂️ Nova Estrutura de Diretórios

```
game-canvas/
├── src/
│   ├── engine/              # Core do Game Engine
│   │   ├── GameEngine.ts    # Orquestrador principal
│   │   ├── GameLoop.ts      # Loop de animação desacoplado
│   │   ├── Time.ts          # Delta time, frame rate
│   │   └── EventBus.ts      # Sistema de eventos global
│   │
│   ├── state/               # Gerenciamento de Estado
│   │   ├── GameState.ts     # State Machine
│   │   ├── GameStore.ts     # Estado global reativo
│   │   └── types.ts         # Types/interfaces do estado
│   │
│   ├── entities/            # Entidades do Jogo (Player, Enemy, etc)
│   │   ├── Entity.ts        # Base class
│   │   ├── Player.ts
│   │   ├── Enemy.ts
│   │   ├── Projectile.ts
│   │   └── Particle.ts
│   │
│   ├── components/          # Componentes reutilizáveis (opcional ECS-like)
│   │   ├── Health.ts
│   │   ├── Position.ts
│   │   ├── Velocity.ts
│   │   ├── Render.ts
│   │   └── Collider.ts
│   │
│   ├── systems/             # Sistemas que processam entidades
│   │   ├── RenderSystem.ts
│   │   ├── PhysicsSystem.ts
│   │   ├── CollisionSystem.ts
│   │   ├── SpawnSystem.ts
│   │   ├── CombatSystem.ts
│   │   └── ParticleSystem.ts
│   │
│   ├── managers/            # Managers para recursos/sistemas
│   │   ├── InputManager.ts  # Keyboard, mouse, touch
│   │   ├── ProjectileManager.ts
│   │   ├── CooldownManager.ts
│   │   ├── EconomyManager.ts
│   │   └── UIManager.ts
│   │
│   ├── data/                # Dados de configuração (PURAS, imutáveis)
│   │   ├── enemies.ts
│   │   ├── projectiles.ts
│   │   ├── weapons.ts
│   │   └── config.ts
│   │
│   ├── utils/               # Utilitários puros
│   │   ├── math.ts
│   │   ├── collision.ts
│   │   ├── colors.ts
│   │   └── random.ts
│   │
│   ├── ui/                  # UI/HUD
│   │   ├── HUD.ts
│   │   ├── Menu.ts
│   │   ├── ProjectileSelector.ts
│   │   └── components/      # Componentes UI reutilizáveis
│   │
│   └── main.ts              # Entry point (leve, apenas inicialização)
│
├── public/                  # Assets estáticos
├── dist/                    # Build output (Vite)
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## 🎨 Padrões de Projeto Aplicados

### 1. **State Pattern** - State Machine
**Onde:** `state/GameState.ts`
**Por quê:** Gerencia estados (Menu, Playing, Paused, GameOver) de forma clara e extensível.

```typescript
// Exemplo
interface GameState {
    enter(): void;
    exit(): void;
    update(deltaTime: number): void;
}

class PlayingState implements GameState {
    enter() { /* iniciar sistemas */ }
    update(deltaTime) { /* loop principal */ }
}
```

### 2. **Observer Pattern** - Event Bus
**Onde:** `engine/EventBus.ts`
**Por quê:** Desacopla comunicação. Systems/Managers não precisam conhecer uns aos outros.

```typescript
// Exemplo
EventBus.on('enemy:death', (enemy) => {
    EconomyManager.addScore(enemy.value);
});
```

### 3. **Strategy Pattern** - Weapons/Projectiles
**Onde:** `data/projectiles.ts`, `managers/ProjectileManager.ts`
**Por quê:** Cada projétil tem comportamento diferente (pierce, damage, cooldown).

```typescript
// Exemplo
interface WeaponStrategy {
    fire(position: Vector2, target: Vector2): Projectile[];
    getCooldown(): number;
}
```

### 4. **Factory Pattern** - Entity Creation
**Onde:** `systems/SpawnSystem.ts`
**Por quê:** Centraliza criação de entidades com diferentes configurações.

```typescript
// Exemplo
class EntityFactory {
    createEnemy(type: EnemyType, position: Vector2): Enemy {
        const config = EnemyData[type];
        return new Enemy(config, position);
    }
}
```

### 5. **Singleton Pattern** - Managers (cuidado!)
**Onde:** Managers críticos (InputManager, EventBus)
**Por quê:** Acesso global sem passar referências. **Usar com moderação!**

### 6. **Command Pattern** - Input Handling
**Onde:** `managers/InputManager.ts`
**Por quê:** Permite desfazer ações, macros, replay de inputs (útil para debug).

```typescript
// Exemplo
interface Command {
    execute(): void;
    undo?(): void;
}
```

### 7. **Component Pattern** - Entities (opcional, ECS-like)
**Onde:** `components/`
**Por quê:** Flexibilidade para adicionar comportamentos a entidades sem herança.

---

## 🔧 Exemplos de Implementação

### 1. Event Bus (Observer Pattern)

```typescript
// engine/EventBus.ts
type EventCallback = (...args: any[]) => void;

class EventBus {
    private listeners: Map<string, EventCallback[]> = new Map();
    
    on(event: string, callback: EventCallback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event)!.push(callback);
    }
    
    emit(event: string, ...args: any[]) {
        const callbacks = this.listeners.get(event) || [];
        callbacks.forEach(cb => cb(...args));
    }
    
    off(event: string, callback: EventCallback) {
        const callbacks = this.listeners.get(event) || [];
        const index = callbacks.indexOf(callback);
        if (index > -1) callbacks.splice(index, 1);
    }
}

export const eventBus = new EventBus();
```

### 2. State Machine

```typescript
// state/GameState.ts
export enum GameStateType {
    MENU = 'MENU',
    PLAYING = 'PLAYING',
    PAUSED = 'PAUSED',
    GAME_OVER = 'GAME_OVER'
}

export abstract class GameState {
    abstract enter(): void;
    abstract exit(): void;
    abstract update(deltaTime: number): void;
    abstract render(context: CanvasRenderingContext2D): void;
}

export class StateMachine {
    private currentState: GameState | null = null;
    private states: Map<GameStateType, GameState> = new Map();
    
    register(type: GameStateType, state: GameState) {
        this.states.set(type, state);
    }
    
    change(type: GameStateType) {
        if (this.currentState) {
            this.currentState.exit();
        }
        this.currentState = this.states.get(type)!;
        this.currentState.enter();
    }
    
    update(deltaTime: number) {
        this.currentState?.update(deltaTime);
    }
    
    render(context: CanvasRenderingContext2D) {
        this.currentState?.render(context);
    }
}
```

### 3. Game Store (Reactive State)

```typescript
// state/GameStore.ts
type Listener<T> = (state: T) => void;

class GameStore<T> {
    private state: T;
    private listeners: Set<Listener<T>> = new Set();
    
    constructor(initialState: T) {
        this.state = initialState;
    }
    
    getState(): T {
        return this.state;
    }
    
    setState(updater: Partial<T> | ((prev: T) => T)) {
        const newState = typeof updater === 'function' 
            ? updater(this.state)
            : { ...this.state, ...updater };
        this.state = newState;
        this.listeners.forEach(listener => listener(this.state));
    }
    
    subscribe(listener: Listener<T>) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }
}

// Exemplo de uso
interface GameState {
    score: number;
    xp: number;
    level: number;
    selectedWeapon: string;
}

export const gameStore = new GameStore<GameState>({
    score: 0,
    xp: 0,
    level: 1,
    selectedWeapon: 'gun'
});

// Em qualquer lugar:
gameStore.setState({ score: gameStore.getState().score + 10 });
```

### 4. Cooldown Manager (Genérico)

```typescript
// managers/CooldownManager.ts
class CooldownManager {
    private cooldowns: Map<string, number> = new Map();
    private maxCooldowns: Map<string, number> = new Map();
    
    register(id: string, maxCooldown: number) {
        this.maxCooldowns.set(id, maxCooldown);
        this.cooldowns.set(id, 0);
    }
    
    update(deltaTime: number) {
        this.cooldowns.forEach((current, id) => {
            if (current > 0) {
                const newValue = Math.max(0, current - deltaTime);
                this.cooldowns.set(id, newValue);
            }
        });
    }
    
    canUse(id: string): boolean {
        return (this.cooldowns.get(id) || 0) <= 0;
    }
    
    use(id: string) {
        const max = this.maxCooldowns.get(id) || 0;
        this.cooldowns.set(id, max);
    }
    
    getRemaining(id: string): number {
        return this.cooldowns.get(id) || 0;
    }
    
    getProgress(id: string): number {
        const current = this.cooldowns.get(id) || 0;
        const max = this.maxCooldowns.get(id) || 1;
        return Math.max(0, Math.min(1, current / max));
    }
}
```

### 5. Input Manager (Command Pattern)

```typescript
// managers/InputManager.ts
type KeyCode = string | number;
type InputCallback = () => void;

class InputManager {
    private keys: Set<KeyCode> = new Set();
    private keyBindings: Map<KeyCode, InputCallback> = new Map();
    
    constructor() {
        window.addEventListener('keydown', (e) => {
            this.keys.add(e.key);
            this.keys.add(e.keyCode);
            this.handleKey(e.key, e.keyCode);
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys.delete(e.key);
            this.keys.delete(e.keyCode);
        });
        
        window.addEventListener('click', (e) => {
            this.handleClick(e.clientX, e.clientY);
        });
    }
    
    bind(key: KeyCode, callback: InputCallback) {
        this.keyBindings.set(key, callback);
    }
    
    isPressed(key: KeyCode): boolean {
        return this.keys.has(key);
    }
    
    private handleKey(key: string, keyCode: number) {
        const callback = this.keyBindings.get(key) || this.keyBindings.get(keyCode);
        callback?.();
    }
    
    private handleClick(x: number, y: number) {
        eventBus.emit('input:click', { x, y });
    }
}
```

### 6. Sistema de Colisão (Otimizado)

```typescript
// systems/CollisionSystem.ts
class CollisionSystem {
    private spatialGrid: Map<string, Entity[]> = new Map();
    private cellSize = 100;
    
    checkCollision(a: Entity, b: Entity): boolean {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distance = Math.hypot(dx, dy);
        return distance < (a.radius + b.radius);
    }
    
    update(entities: Entity[]) {
        // Spatial partitioning para otimização (opcional para muitas entidades)
        this.updateGrid(entities);
        
        // Broad phase: verificar apenas entidades próximas
        // Narrow phase: detecção precisa
        for (let i = 0; i < entities.length; i++) {
            for (let j = i + 1; j < entities.length; j++) {
                if (this.checkCollision(entities[i], entities[j])) {
                    eventBus.emit('collision', entities[i], entities[j]);
                }
            }
        }
    }
    
    private updateGrid(entities: Entity[]) {
        this.spatialGrid.clear();
        entities.forEach(entity => {
            const key = this.getCellKey(entity.x, entity.y);
            if (!this.spatialGrid.has(key)) {
                this.spatialGrid.set(key, []);
            }
            this.spatialGrid.get(key)!.push(entity);
        });
    }
    
    private getCellKey(x: number, y: number): string {
        const cellX = Math.floor(x / this.cellSize);
        const cellY = Math.floor(y / this.cellSize);
        return `${cellX},${cellY}`;
    }
}
```

### 7. Game Engine (Orquestrador)

```typescript
// engine/GameEngine.ts
export class GameEngine {
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private gameLoop: GameLoop;
    private stateMachine: StateMachine;
    private systems: System[] = [];
    private managers: Manager[] = [];
    private isRunning = false;
    
    constructor(canvasId: string) {
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        this.context = this.canvas.getContext('2d')!;
        this.gameLoop = new GameLoop(this.update.bind(this), this.render.bind(this));
        this.stateMachine = new StateMachine();
    }
    
    registerSystem(system: System) {
        this.systems.push(system);
    }
    
    registerManager(manager: Manager) {
        this.managers.push(manager);
    }
    
    start() {
        this.isRunning = true;
        this.gameLoop.start();
    }
    
    stop() {
        this.isRunning = false;
        this.gameLoop.stop();
    }
    
    private update(deltaTime: number) {
        if (!this.isRunning) return;
        
        // Atualizar managers
        this.managers.forEach(m => m.update?.(deltaTime));
        
        // Atualizar state machine (que atualiza sistemas)
        this.stateMachine.update(deltaTime);
    }
    
    private render() {
        // Limpar canvas
        this.context.fillStyle = 'rgba(0,0,0,0.3)';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Renderizar state machine
        this.stateMachine.render(this.context);
    }
}
```

### 8. Game Loop (Delta Time)

```typescript
// engine/GameLoop.ts
export class GameLoop {
    private animationFrameId: number | null = null;
    private lastTime = 0;
    private updateCallback: (deltaTime: number) => void;
    private renderCallback: () => void;
    
    constructor(
        update: (deltaTime: number) => void,
        render: () => void
    ) {
        this.updateCallback = update;
        this.renderCallback = render;
    }
    
    start() {
        this.lastTime = performance.now();
        this.tick();
    }
    
    stop() {
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }
    
    private tick = (currentTime: number = performance.now()) => {
        const deltaTime = (currentTime - this.lastTime) / 1000; // em segundos
        this.lastTime = currentTime;
        
        // Limitar delta time para evitar "spikes"
        const clampedDelta = Math.min(deltaTime, 0.1);
        
        this.updateCallback(clampedDelta);
        this.renderCallback();
        
        this.animationFrameId = requestAnimationFrame(this.tick);
    }
}
```

---

## 🚀 Roadmap de Migração

### **Fase 1: Preparação (Sem quebrar o código atual)**
- ✅ Adicionar TypeScript (migração gradual com `.ts` e `.js`)
- ✅ Configurar Vite
- ✅ Criar estrutura de pastas paralela (em `src/`)
- ✅ Migrar dados para `src/data/` (apenas mover, sem mudar lógica)

**Estimativa:** 1-2 dias

---

### **Fase 2: Event Bus e Store (Desacoplamento)**
- ✅ Criar `EventBus.ts`
- ✅ Criar `GameStore.ts`
- ✅ Substituir variáveis globais por `gameStore`
- ✅ Emitir eventos em pontos-chave (enemy death, projectile fire)

**Resultado:** Código mais desacoplado, mas ainda funciona igual

**Estimativa:** 2-3 dias

---

### **Fase 3: Managers (Extrair lógica de main.js)**
- ✅ Criar `CooldownManager.ts` (eliminar duplicação)
- ✅ Criar `InputManager.ts`
- ✅ Criar `ProjectileManager.ts`
- ✅ Migrar funções de `main.js` para managers

**Resultado:** `main.js` reduzido significativamente

**Estimativa:** 3-4 dias

---

### **Fase 4: State Machine (Estados do jogo)**
- ✅ Criar `GameState.ts` e `StateMachine.ts`
- ✅ Implementar `MenuState`, `PlayingState`, `GameOverState`
- ✅ Migrar lógica de estados para classes

**Resultado:** Estados gerenciados profissionalmente

**Estimativa:** 2-3 dias

---

### **Fase 5: Systems (ECS-like, opcional)**
- ✅ Criar `RenderSystem`, `PhysicsSystem`, `CollisionSystem`
- ✅ Refatorar entidades para usar sistemas

**Resultado:** Entidades mais flexíveis

**Estimativa:** 4-5 dias

---

### **Fase 6: UI/HUD Desacoplada**
- ✅ Criar `UIManager.ts`
- ✅ Criar componentes UI reutilizáveis
- ✅ Conectar UI ao `GameStore` (reativo)

**Resultado:** UI reativa e reutilizável

**Estimativa:** 2-3 dias

---

### **Fase 7: Game Engine (Orquestrador Final)**
- ✅ Criar `GameEngine.ts`
- ✅ Criar `GameLoop.ts` com delta time
- ✅ Integrar tudo no engine

**Resultado:** Arquitetura profissional completa

**Estimativa:** 3-4 dias

---

**Total Estimado:** 17-24 dias (3-4 semanas)

---

## 🎯 Benefícios da Nova Arquitetura

### ✅ Escalabilidade
- Adicionar novos inimigos: apenas adicionar em `data/enemies.ts`
- Novas armas: criar estratégia e adicionar em `data/projectiles.ts`
- Novos sistemas: criar classe e registrar no engine
- Novas fases: criar novo state e adicionar na state machine

### ✅ Manutenibilidade
- Responsabilidades claras (cada arquivo tem um propósito)
- Fácil de testar (sistemas isolados)
- Fácil de debugar (eventos rastreáveis)

### ✅ Performance
- Delta time para frame-rate independente
- Spatial partitioning para colisões (quando necessário)
- Systems otimizados (processar apenas entidades relevantes)

### ✅ Desenvolvimento
- TypeScript previne erros em tempo de desenvolvimento
- Hot Module Replacement (Vite) para iteração rápida
- Estrutura familiar para desenvolvedores experientes

---

## 🔮 Futuras Expansões Facilitadas

### Upgrades/Progression
```typescript
// systems/UpgradeSystem.ts
class UpgradeSystem {
    applyUpgrade(upgrade: Upgrade) {
        // Modificar stats do player/weapons
    }
}
```

### Skills/Habilidades
```typescript
// data/skills.ts
interface Skill {
    id: string;
    type: 'active' | 'passive';
    cooldown?: number;
    effect: () => void;
}
```

### Salvamento de Progresso
```typescript
// managers/SaveManager.ts
class SaveManager {
    save(gameState: GameState) {
        localStorage.setItem('save', JSON.stringify(gameState));
    }
}
```

### Diferentes Personagens
```typescript
// data/characters.ts
interface Character {
    id: string;
    baseStats: Stats;
    abilities: Ability[];
}
```

---

## 📝 Próximos Passos Imediatos

1. **Aprovar esta proposta** - ajustar conforme necessário
2. **Criar branch de desenvolvimento** - `feature/new-architecture`
3. **Iniciar Fase 1** - TypeScript + Vite setup
4. **Implementar EventBus** - primeiro componente desacoplado
5. **Testar incrementalmente** - garantir que o jogo continua funcionando

---

## ❓ Dúvidas ou Ajustes?

Esta arquitetura é **flexível** e pode ser adaptada conforme necessidades específicas. Posso detalhar qualquer parte ou criar código de exemplo para componentes específicos.
