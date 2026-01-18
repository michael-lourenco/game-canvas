# 💻 Exemplos Práticos de Implementação

Este documento contém exemplos práticos de código mostrando como implementar a nova arquitetura proposta.

---

## 📦 Exemplo 1: Estrutura Completa do Game Engine

### `src/engine/GameEngine.ts`

```typescript
import { GameLoop } from './GameLoop';
import { StateMachine } from '../state/GameState';
import { eventBus } from './EventBus';

export class GameEngine {
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private gameLoop: GameLoop;
    private stateMachine: StateMachine;
    private isRunning = false;

    constructor(canvasId: string) {
        const canvas = document.getElementById(canvasId);
        if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
            throw new Error(`Canvas with id "${canvasId}" not found`);
        }
        
        this.canvas = canvas;
        this.context = canvas.getContext('2d')!;
        this.gameLoop = new GameLoop(
            this.update.bind(this),
            this.render.bind(this)
        );
        this.stateMachine = new StateMachine();
    }

    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.gameLoop.start();
        eventBus.emit('engine:start');
    }

    stop() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        this.gameLoop.stop();
        eventBus.emit('engine:stop');
    }

    changeState(stateType: GameStateType) {
        this.stateMachine.change(stateType);
    }

    private update(deltaTime: number) {
        if (!this.isRunning) return;
        
        // Atualizar state machine (que atualiza seus sistemas)
        this.stateMachine.update(deltaTime);
        
        // Emitir evento de update para listeners externos
        eventBus.emit('engine:update', deltaTime);
    }

    private render() {
        // Limpar canvas
        this.context.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Renderizar state atual
        this.stateMachine.render(this.context);
    }

    getContext(): CanvasRenderingContext2D {
        return this.context;
    }

    getCanvas(): HTMLCanvasElement {
        return this.canvas;
    }
}
```

### `src/engine/GameLoop.ts`

```typescript
export class GameLoop {
    private animationFrameId: number | null = null;
    private lastTime = 0;
    private updateCallback: (deltaTime: number) => void;
    private renderCallback: () => void;
    private targetFPS = 60;
    private frameTime = 1000 / this.targetFPS;

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

        // Limitar delta time para evitar "spikes" (congelamento)
        const clampedDelta = Math.min(deltaTime, 0.1);

        // Update pode ser chamado múltiplas vezes por frame se FPS > target
        let accumulator = clampedDelta;
        while (accumulator >= this.frameTime / 1000) {
            this.updateCallback(this.frameTime / 1000);
            accumulator -= this.frameTime / 1000;
        }

        // Render sempre uma vez por frame
        this.renderCallback();

        this.animationFrameId = requestAnimationFrame(this.tick);
    }
}
```

### `src/engine/EventBus.ts`

```typescript
type EventCallback = (...args: any[]) => void;

class EventBus {
    private listeners: Map<string, EventCallback[]> = new Map();
    private onceListeners: Map<string, EventCallback[]> = new Map();

    on(event: string, callback: EventCallback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event)!.push(callback);
    }

    once(event: string, callback: EventCallback) {
        if (!this.onceListeners.has(event)) {
            this.onceListeners.set(event, []);
        }
        this.onceListeners.get(event)!.push(callback);
    }

    off(event: string, callback?: EventCallback) {
        if (callback) {
            const callbacks = this.listeners.get(event) || [];
            const index = callbacks.indexOf(callback);
            if (index > -1) callbacks.splice(index, 1);
        } else {
            this.listeners.delete(event);
        }
    }

    emit(event: string, ...args: any[]) {
        // Chamar listeners normais
        const callbacks = this.listeners.get(event) || [];
        callbacks.forEach(cb => {
            try {
                cb(...args);
            } catch (error) {
                console.error(`Error in event listener for "${event}":`, error);
            }
        });

        // Chamar once listeners e remover
        const onceCallbacks = this.onceListeners.get(event) || [];
        onceCallbacks.forEach(cb => {
            try {
                cb(...args);
            } catch (error) {
                console.error(`Error in once listener for "${event}":`, error);
            }
        });
        this.onceListeners.delete(event);
    }

    clear() {
        this.listeners.clear();
        this.onceListeners.clear();
    }
}

export const eventBus = new EventBus();
```

---

## 🎮 Exemplo 2: State Machine

### `src/state/GameState.ts`

```typescript
import { eventBus } from '../engine/EventBus';

export enum GameStateType {
    MENU = 'MENU',
    PLAYING = 'PLAYING',
    PAUSED = 'PAUSED',
    GAME_OVER = 'GAME_OVER'
}

export abstract class GameState {
    protected stateType: GameStateType;

    constructor(stateType: GameStateType) {
        this.stateType = stateType;
    }

    abstract enter(): void;
    abstract exit(): void;
    abstract update(deltaTime: number): void;
    abstract render(context: CanvasRenderingContext2D): void;

    getType(): GameStateType {
        return this.stateType;
    }
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
            eventBus.emit('state:exit', this.currentState.getType());
        }

        const newState = this.states.get(type);
        if (!newState) {
            throw new Error(`State "${type}" not registered`);
        }

        this.currentState = newState;
        this.currentState.enter();
        eventBus.emit('state:enter', type);
    }

    getCurrentState(): GameState | null {
        return this.currentState;
    }

    update(deltaTime: number) {
        this.currentState?.update(deltaTime);
    }

    render(context: CanvasRenderingContext2D) {
        this.currentState?.render(context);
    }
}
```

### `src/state/states/PlayingState.ts` (Exemplo)

```typescript
import { GameState, GameStateType } from '../GameState';
import { RenderSystem } from '../../systems/RenderSystem';
import { PhysicsSystem } from '../../systems/PhysicsSystem';
import { CollisionSystem } from '../../systems/CollisionSystem';
import { SpawnSystem } from '../../systems/SpawnSystem';
import { CombatSystem } from '../../systems/CombatSystem';
import { eventBus } from '../../engine/EventBus';
import { gameStore } from '../GameStore';

export class PlayingState extends GameState {
    private systems: System[] = [];

    constructor(context: CanvasRenderingContext2D) {
        super(GameStateType.PLAYING);
        
        // Inicializar sistemas
        this.systems = [
            new RenderSystem(context),
            new PhysicsSystem(),
            new CollisionSystem(),
            new SpawnSystem(context),
            new CombatSystem()
        ];
    }

    enter() {
        // Resetar estado do jogo
        gameStore.setState({
            score: 0,
            xp: 0,
            level: 1,
            selectedWeapon: 'gun'
        });

        // Iniciar sistemas
        this.systems.forEach(system => system.start?.());

        // Escutar eventos
        eventBus.on('collision', this.handleCollision);
        eventBus.on('enemy:death', this.handleEnemyDeath);
        eventBus.on('player:death', this.handlePlayerDeath);
    }

    exit() {
        // Parar sistemas
        this.systems.forEach(system => system.stop?.());

        // Remover listeners
        eventBus.off('collision', this.handleCollision);
        eventBus.off('enemy:death', this.handleEnemyDeath);
        eventBus.off('player:death', this.handlePlayerDeath);
    }

    update(deltaTime: number) {
        // Atualizar sistemas
        this.systems.forEach(system => system.update?.(deltaTime));
    }

    render(context: CanvasRenderingContext2D) {
        // Renderizar sistemas
        this.systems.forEach(system => system.render?.(context));
    }

    private handleCollision = (entityA: Entity, entityB: Entity) => {
        // Lógica de colisão delegada ao CombatSystem
    };

    private handleEnemyDeath = (enemy: Enemy) => {
        const current = gameStore.getState();
        gameStore.setState({
            score: current.score + enemy.value,
            xp: current.xp + enemy.xp
        });
    };

    private handlePlayerDeath = () => {
        eventBus.emit('state:change', GameStateType.GAME_OVER);
    };
}
```

---

## 🎯 Exemplo 3: Cooldown Manager (Genérico)

### `src/managers/CooldownManager.ts`

```typescript
import { eventBus } from '../engine/EventBus';

export class CooldownManager {
    private cooldowns: Map<string, number> = new Map();
    private maxCooldowns: Map<string, number> = new Map();

    constructor() {
        // Escutar eventos de update
        eventBus.on('engine:update', this.update.bind(this));
    }

    register(id: string, maxCooldown: number) {
        this.maxCooldowns.set(id, maxCooldown);
        this.cooldowns.set(id, 0);
    }

    unregister(id: string) {
        this.cooldowns.delete(id);
        this.maxCooldowns.delete(id);
    }

    update(deltaTime: number) {
        this.cooldowns.forEach((current, id) => {
            if (current > 0) {
                const newValue = Math.max(0, current - deltaTime);
                this.cooldowns.set(id, newValue);

                // Emitir evento quando cooldown terminar
                if (newValue === 0 && current > 0) {
                    eventBus.emit('cooldown:ready', id);
                }
            }
        });
    }

    canUse(id: string): boolean {
        return (this.cooldowns.get(id) || 0) <= 0;
    }

    use(id: string): boolean {
        if (!this.canUse(id)) {
            return false;
        }

        const max = this.maxCooldowns.get(id) || 0;
        this.cooldowns.set(id, max);
        eventBus.emit('cooldown:used', id);
        return true;
    }

    getRemaining(id: string): number {
        return this.cooldowns.get(id) || 0;
    }

    getProgress(id: string): number {
        const current = this.cooldowns.get(id) || 0;
        const max = this.maxCooldowns.get(id) || 1;
        return Math.max(0, Math.min(1, 1 - (current / max)));
    }

    reset(id: string) {
        this.cooldowns.set(id, 0);
    }

    resetAll() {
        this.cooldowns.forEach((_, id) => {
            this.cooldowns.set(id, 0);
        });
    }
}
```

---

## 🎮 Exemplo 4: Input Manager

### `src/managers/InputManager.ts`

```typescript
import { eventBus } from '../engine/EventBus';

type KeyCode = string | number;
type InputCallback = () => void;

export class InputManager {
    private keys: Set<KeyCode> = new Set();
    private keyBindings: Map<KeyCode, InputCallback> = new Map();
    private mousePosition = { x: 0, y: 0 };

    constructor() {
        this.setupListeners();
    }

    private setupListeners() {
        window.addEventListener('keydown', (e) => {
            this.keys.add(e.key);
            this.keys.add(e.keyCode);
            this.handleKey(e.key, e.keyCode);
        });

        window.addEventListener('keyup', (e) => {
            this.keys.delete(e.key);
            this.keys.delete(e.keyCode);
        });

        window.addEventListener('mousemove', (e) => {
            this.mousePosition = { x: e.clientX, y: e.clientY };
            eventBus.emit('input:mouseMove', this.mousePosition);
        });

        window.addEventListener('click', (e) => {
            eventBus.emit('input:click', {
                x: e.clientX,
                y: e.clientY,
                button: e.button
            });
        });

        window.addEventListener('contextmenu', (e) => {
            e.preventDefault(); // Prevenir menu de contexto
        });
    }

    bind(key: KeyCode, callback: InputCallback) {
        this.keyBindings.set(key, callback);
    }

    unbind(key: KeyCode) {
        this.keyBindings.delete(key);
    }

    isPressed(key: KeyCode): boolean {
        return this.keys.has(key);
    }

    getMousePosition(): { x: number; y: number } {
        return { ...this.mousePosition };
    }

    private handleKey(key: string, keyCode: number) {
        const callback = this.keyBindings.get(key) || this.keyBindings.get(keyCode);
        if (callback) {
            callback();
        }
    }
}
```

---

## 🎯 Exemplo 5: Game Store (Reactive State)

### `src/state/GameStore.ts`

```typescript
type Listener<T> = (state: T) => void;

export class GameStore<T> {
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
        this.notify();
    }

    subscribe(listener: Listener<T>) {
        this.listeners.add(listener);
        
        // Retornar função para unsubscribe
        return () => {
            this.listeners.delete(listener);
        };
    }

    private notify() {
        this.listeners.forEach(listener => {
            try {
                listener(this.state);
            } catch (error) {
                console.error('Error in store listener:', error);
            }
        });
    }
}

// Estado do jogo
export interface GameState {
    score: number;
    xp: number;
    level: number;
    selectedWeapon: string;
    playerHealth?: number;
}

// Instância global do store
export const gameStore = new GameStore<GameState>({
    score: 0,
    xp: 0,
    level: 1,
    selectedWeapon: 'gun'
});
```

---

## 🎮 Exemplo 6: Sistema de Combate

### `src/systems/CombatSystem.ts`

```typescript
import { eventBus } from '../engine/EventBus';
import { Entity } from '../entities/Entity';
import { Enemy } from '../entities/Enemy';
import { Projectile } from '../entities/Projectile';
import { Player } from '../entities/Player';

export class CombatSystem {
    private enemies: Enemy[] = [];
    private projectiles: Projectile[] = [];
    private player: Player | null = null;

    constructor() {
        eventBus.on('entity:register', this.handleEntityRegister);
        eventBus.on('entity:unregister', this.handleEntityUnregister);
        eventBus.on('collision', this.handleCollision);
    }

    update(deltaTime: number) {
        // Combat logic pode ser atualizada aqui se necessário
    }

    private handleEntityRegister = (entity: Entity) => {
        if (entity instanceof Enemy) {
            this.enemies.push(entity);
        } else if (entity instanceof Projectile) {
            this.projectiles.push(entity);
        } else if (entity instanceof Player) {
            this.player = entity;
        }
    };

    private handleEntityUnregister = (entity: Entity) => {
        if (entity instanceof Enemy) {
            const index = this.enemies.indexOf(entity);
            if (index > -1) this.enemies.splice(index, 1);
        } else if (entity instanceof Projectile) {
            const index = this.projectiles.indexOf(entity);
            if (index > -1) this.projectiles.splice(index, 1);
        } else if (entity instanceof Player) {
            this.player = null;
        }
    };

    private handleCollision = (entityA: Entity, entityB: Entity) => {
        // Projétil vs Inimigo
        if (entityA instanceof Projectile && entityB instanceof Enemy) {
            this.handleProjectileEnemyCollision(entityA, entityB);
        } else if (entityA instanceof Enemy && entityB instanceof Projectile) {
            this.handleProjectileEnemyCollision(entityB, entityA);
        }

        // Jogador vs Inimigo
        if (entityA instanceof Player && entityB instanceof Enemy) {
            this.handlePlayerEnemyCollision(entityA, entityB);
        } else if (entityA instanceof Enemy && entityB instanceof Player) {
            this.handlePlayerEnemyCollision(entityB, entityA);
        }
    };

    private handleProjectileEnemyCollision(projectile: Projectile, enemy: Enemy) {
        const damage = projectile.doDamage();
        enemy.takeDamage(damage);

        eventBus.emit('projectile:hit', projectile, enemy);

        // Verificar se inimigo morreu
        if (enemy.isDead()) {
            eventBus.emit('enemy:death', enemy);
        }

        // Remover projétil se não tiver pierce
        if (projectile.pierce <= 0) {
            eventBus.emit('entity:destroy', projectile);
        } else {
            projectile.pierce--;
        }
    }

    private handlePlayerEnemyCollision(player: Player, enemy: Enemy) {
        const damage = enemy.doDamage();
        player.takeDamage(damage);

        eventBus.emit('player:hit', player, enemy);

        if (player.isDead()) {
            eventBus.emit('player:death', player);
        }
    }
}
```

---

## 📝 Exemplo 7: Main.ts (Entry Point Leve)

### `src/main.ts`

```typescript
import { GameEngine } from './engine/GameEngine';
import { StateMachine, GameStateType } from './state/GameState';
import { MenuState } from './state/states/MenuState';
import { PlayingState } from './state/states/PlayingState';
import { GameOverState } from './state/states/GameOverState';
import { InputManager } from './managers/InputManager';
import { CooldownManager } from './managers/CooldownManager';
import { UIManager } from './managers/UIManager';
import { eventBus } from './engine/EventBus';
import { dataProjectile } from './data/projectile';

// Inicializar Canvas
const canvas = document.createElement('canvas');
canvas.id = 'gameCanvas';
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);

// Criar Game Engine
const engine = new GameEngine('gameCanvas');
const context = engine.getContext();

// Criar State Machine
const stateMachine = new StateMachine();

// Registrar estados
stateMachine.register(GameStateType.MENU, new MenuState(context));
stateMachine.register(GameStateType.PLAYING, new PlayingState(context));
stateMachine.register(GameStateType.GAME_OVER, new GameOverState(context));

// Criar Managers
const inputManager = new InputManager();
const cooldownManager = new CooldownManager();
const uiManager = new UIManager();

// Registrar cooldowns das armas
Object.entries(dataProjectile).forEach(([id, weapon]) => {
    cooldownManager.register(id, weapon.cooldown);
});

// Configurar bindings de teclado
inputManager.bind('q', () => {
    eventBus.emit('weapon:select', '0');
});
inputManager.bind('w', () => {
    eventBus.emit('weapon:select', '1');
});
inputManager.bind('e', () => {
    eventBus.emit('weapon:select', '2');
});
inputManager.bind('r', () => {
    eventBus.emit('weapon:select', '3');
});

// Escutar mudanças de estado
eventBus.on('state:change', (stateType: GameStateType) => {
    stateMachine.change(stateType);
});

// Iniciar com estado MENU
stateMachine.change(GameStateType.MENU);

// Iniciar engine
engine.start();

// Expor para debug (opcional)
(window as any).gameEngine = engine;
(window as any).eventBus = eventBus;
```

---

## 🎨 Exemplo 8: UIManager (Reativo)

### `src/managers/UIManager.ts`

```typescript
import { gameStore } from '../state/GameStore';
import { eventBus } from '../engine/EventBus';
import { CooldownManager } from './CooldownManager';

export class UIManager {
    private scoreElement: HTMLElement | null;
    private xpElement: HTMLElement | null;
    private weaponButtons: Map<string, HTMLElement> = new Map();
    private cooldownManager: CooldownManager;

    constructor(cooldownManager: CooldownManager) {
        this.cooldownManager = cooldownManager;
        
        // Obter elementos HTML
        this.scoreElement = document.querySelector('#score');
        this.xpElement = document.querySelector('#xp');
        
        // Obter botões de armas
        const qButton = document.querySelector('#qGameButton');
        const wButton = document.querySelector('#wGameButton');
        const eButton = document.querySelector('#eGameButton');
        const rButton = document.querySelector('#rGameButton');
        
        if (qButton) this.weaponButtons.set('0', qButton);
        if (wButton) this.weaponButtons.set('1', wButton);
        if (eButton) this.weaponButtons.set('2', eButton);
        if (rButton) this.weaponButtons.set('3', rButton);

        // Escutar mudanças no store
        gameStore.subscribe(this.updateUI.bind(this));
        
        // Escutar eventos de cooldown
        eventBus.on('cooldown:ready', this.handleCooldownReady.bind(this));
        eventBus.on('cooldown:used', this.handleCooldownUsed.bind(this));
        
        // Atualizar UI periodicamente
        setInterval(() => this.updateCooldowns(), 100);
    }

    private updateUI(state: ReturnType<typeof gameStore.getState>) {
        if (this.scoreElement) {
            this.scoreElement.textContent = state.score.toString();
        }
        
        if (this.xpElement) {
            this.xpElement.textContent = state.xp.toString();
        }

        // Atualizar botão selecionado
        this.weaponButtons.forEach((button, id) => {
            if (id === state.selectedWeapon) {
                button.classList.add('selected');
            } else {
                button.classList.remove('selected');
            }
        });
    }

    private updateCooldowns() {
        this.weaponButtons.forEach((button, id) => {
            const remaining = this.cooldownManager.getRemaining(id);
            const progress = this.cooldownManager.getProgress(id);
            const canUse = this.cooldownManager.canUse(id);

            // Atualizar estilo do botão
            if (canUse) {
                button.classList.add('ready');
                button.classList.remove('cooldown');
            } else {
                button.classList.add('cooldown');
                button.classList.remove('ready');
            }

            // Atualizar barra de progresso (se houver)
            const progressBar = button.querySelector('.progress-bar') as HTMLElement;
            if (progressBar) {
                progressBar.style.width = `${progress * 100}%`;
            }
        });
    }

    private handleCooldownReady(weaponId: string) {
        const button = this.weaponButtons.get(weaponId);
        if (button) {
            button.classList.add('ready');
        }
    }

    private handleCooldownUsed(weaponId: string) {
        const button = this.weaponButtons.get(weaponId);
        if (button) {
            button.classList.remove('ready');
        }
    }
}
```

---

## 📦 Exemplo 9: Configuração TypeScript

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowJs": true,
    "checkJs": false,
    "jsx": "preserve",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### `vite.config.ts`

```typescript
import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        outDir: 'dist',
        sourcemap: true,
        minify: 'terser',
        rollupOptions: {
            input: {
                main: './index.html'
            }
        }
    },
    server: {
        port: 3000,
        open: true
    }
});
```

---

## 🎯 Resumo

Estes exemplos demonstram:

1. **Desacoplamento** - EventBus permite comunicação sem dependências diretas
2. **Responsabilidades claras** - Cada classe tem um propósito específico
3. **Escalabilidade** - Fácil adicionar novos sistemas, estados, managers
4. **Type-safety** - TypeScript previne erros em tempo de desenvolvimento
5. **Reatividade** - GameStore atualiza UI automaticamente
6. **Manutenibilidade** - Código organizado e testável

Estes exemplos podem ser adaptados conforme necessidades específicas do projeto.
