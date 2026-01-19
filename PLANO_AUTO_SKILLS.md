# 🎯 Plano de Implementação - Sistema Automático de Skills

## 📋 Análise do Requisito

**Mudança de Gameplay:**
- ❌ **Antes**: Jogador seleciona skill → clica na direção → skill dispara
- ✅ **Agora**: Skills disparam automaticamente quando cooldown = 0, seguindo regras próprias

**Requisitos Identificados:**
1. **Auto-fire**: Skills disparam automaticamente quando cooldown = 0
2. **Range**: Distância máxima que a skill pode alcançar
3. **Focus/Targeting**: Lógica para escolher alvo (mais próximo, mais distante, mais vida, menos vida, etc)
4. **Escalável**: Sistema deve suportar novos tipos de focus/comportamentos no futuro

---

## 🏗️ Arquitetura Proposta

### Sistema de Componentes (Strategy Pattern + Factory Pattern)

```
AutoSkillSystem (Orquestrador)
    ├── TargetingSystem (Strategy Pattern)
    │   ├── NearestTargetStrategy
    │   ├── FarthestTargetStrategy
    │   ├── HighestHpTargetStrategy
    │   ├── LowestHpTargetStrategy
    │   └── ... (fácil adicionar novos)
    │
    └── SkillManager
        ├── Processa todas as skills
        ├── Verifica cooldowns
        └── Dispara skills automaticamente
```

---

## 📦 Estrutura de Arquivos

```
client/src/
├── systems/
│   └── AutoSkillSystem.ts          # 🆕 Sistema principal de auto-fire
│
├── targeting/
│   ├── ITargetingStrategy.ts       # 🆕 Interface para estratégias de targeting
│   ├── NearestTargetStrategy.ts    # 🆕 Alvo mais próximo
│   ├── FarthestTargetStrategy.ts   # 🆕 Alvo mais distante
│   ├── HighestHpTargetStrategy.ts  # 🆕 Alvo com mais HP
│   ├── LowestHpTargetStrategy.ts   # 🆕 Alvo com menos HP
│   ├── RandomTargetStrategy.ts     # 🆕 Alvo aleatório (opcional)
│   └── index.ts                    # 🆕 Factory/Exports
│
├── data/
│   └── projectiles.ts              # ✏️ Atualizar: adicionar range e focus
│
└── managers/
    └── SkillManager.ts             # 🆕 Gerenciador de skills (opcional)
```

---

## 📝 Mudanças Necessárias

### 1. Atualizar `ProjectileConfig` Interface

```typescript
// client/src/data/projectiles.ts

export enum FocusType {
    NEAREST = 'nearest',           // Inimigo mais próximo
    FARTHEST = 'farthest',         // Inimigo mais distante
    HIGHEST_HP = 'highest_hp',     // Inimigo com mais HP
    LOWEST_HP = 'lowest_hp',       // Inimigo com menos HP
    RANDOM = 'random',             // Alvo aleatório
    // Fácil adicionar novos tipos no futuro
}

export interface ProjectileConfig {
    name: string;
    pierce: number;
    attack: number;
    color: string;
    cooldown: number;
    currentCoolDown: number;
    radius: number;
    velocity_factor: number;
    
    // 🆕 Novos atributos
    range?: number;                // Distância máxima (0 = ilimitado)
    focus?: FocusType;             // Tipo de foco/alvo (padrão: NEAREST)
    autoFire?: boolean;            // Se dispara automaticamente (padrão: true)
    minRange?: number;             // Distância mínima (opcional)
}
```

### 2. Atualizar Dados das Skills

```typescript
export const dataProjectile: Record<number, ProjectileConfig> = {
    0: {
        name: 'gun',
        pierce: 0,
        attack: 1,
        color: 'hsla(360,100%,50%,0.3)',
        cooldown: 1,
        currentCoolDown: 0,
        radius: 10,
        velocity_factor: 8,
        range: 500,                // 🆕 Alcance de 500px
        focus: FocusType.NEAREST,  // 🆕 Foca no mais próximo
        autoFire: true,            // 🆕 Auto-fire ativado
    },
    1: {
        name: 'riffle',
        pierce: 5,
        attack: 5,
        color: 'hsla(240,100%,50%,0.3)',
        cooldown: 3,
        currentCoolDown: 0,
        radius: 10,
        velocity_factor: 30,
        range: 800,                // 🆕 Longo alcance
        focus: FocusType.HIGHEST_HP, // 🆕 Foca nos mais resistentes
        autoFire: true,
    },
    // ... outras skills
};
```

---

## 🔧 Implementação Detalhada

### Fase 1: Sistema de Targeting (Strategy Pattern)

#### 1.1 Interface `ITargetingStrategy`

```typescript
// client/src/targeting/ITargetingStrategy.ts

import { Enemy } from '../entities/Enemy';

export interface ITargetingStrategy {
    /**
     * Seleciona o melhor alvo dentre os inimigos disponíveis
     * @param enemies Array de inimigos no jogo
     * @param playerX Posição X do jogador
     * @param playerY Posição Y do jogador
     * @param range Range máximo (0 = ilimitado)
     * @returns Enemy selecionado ou null se nenhum válido
     */
    selectTarget(
        enemies: Enemy[],
        playerX: number,
        playerY: number,
        range?: number
    ): Enemy | null;
}
```

#### 1.2 Implementação: NearestTargetStrategy

```typescript
// client/src/targeting/NearestTargetStrategy.ts

import { ITargetingStrategy } from './ITargetingStrategy';
import { Enemy } from '../entities/Enemy';

export class NearestTargetStrategy implements ITargetingStrategy {
    selectTarget(
        enemies: Enemy[],
        playerX: number,
        playerY: number,
        range?: number
    ): Enemy | null {
        if (enemies.length === 0) return null;

        let nearestEnemy: Enemy | null = null;
        let nearestDistance = Infinity;

        for (const enemy of enemies) {
            const distance = Math.hypot(
                enemy.x - playerX,
                enemy.y - playerY
            );

            // Verificar range
            if (range && range > 0 && distance > range) {
                continue;
            }

            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestEnemy = enemy;
            }
        }

        return nearestEnemy;
    }
}
```

#### 1.3 Implementação: Outras Strategies

```typescript
// FarthestTargetStrategy.ts - Alvo mais distante
// HighestHpTargetStrategy.ts - Alvo com mais HP
// LowestHpTargetStrategy.ts - Alvo com menos HP
// RandomTargetStrategy.ts - Alvo aleatório
```

#### 1.4 Factory para criar Strategy

```typescript
// client/src/targeting/index.ts

import { ITargetingStrategy } from './ITargetingStrategy';
import { NearestTargetStrategy } from './NearestTargetStrategy';
import { FarthestTargetStrategy } from './FarthestTargetStrategy';
import { HighestHpTargetStrategy } from './HighestHpTargetStrategy';
import { LowestHpTargetStrategy } from './LowestHpTargetStrategy';
import { FocusType } from '../data/projectiles';

export function createTargetingStrategy(focusType: FocusType): ITargetingStrategy {
    switch (focusType) {
        case FocusType.NEAREST:
            return new NearestTargetStrategy();
        case FocusType.FARTHEST:
            return new FarthestTargetStrategy();
        case FocusType.HIGHEST_HP:
            return new HighestHpTargetStrategy();
        case FocusType.LOWEST_HP:
            return new LowestHpTargetStrategy();
        default:
            return new NearestTargetStrategy(); // Fallback
    }
}
```

---

### Fase 2: Sistema de Auto-Fire

#### 2.1 AutoSkillSystem

```typescript
// client/src/systems/AutoSkillSystem.ts

import { Enemy } from '../entities/Enemy';
import { Projectile } from '../entities/Projectile';
import { ProjectileConfig, FocusType } from '../data/projectiles';
import { createTargetingStrategy, ITargetingStrategy } from '../targeting';
import { createVelocity } from '../utils';
import { MIDDLE_SCREEN_X, MIDDLE_SCREEN_Y } from '../config/positions';

export class AutoSkillSystem {
    private strategies: Map<FocusType, ITargetingStrategy> = new Map();

    /**
     * Processa todas as skills e dispara automaticamente se cooldown = 0
     */
    processSkills(
        skills: ProjectileConfig[],
        enemies: Enemy[],
        context: CanvasRenderingContext2D
    ): Projectile[] {
        const firedProjectiles: Projectile[] = [];

        for (const skill of skills) {
            // Verificar se skill tem auto-fire ativado
            if (skill.autoFire === false) continue;

            // Verificar se cooldown está pronto
            if (skill.currentCoolDown < skill.cooldown) continue;

            // Tentar disparar skill
            const projectile = this.fireSkill(skill, enemies, context);
            if (projectile) {
                firedProjectiles.push(projectile);
                // Resetar cooldown
                skill.currentCoolDown = 0;
            }
        }

        return firedProjectiles;
    }

    /**
     * Dispara uma skill específica
     */
    private fireSkill(
        skill: ProjectileConfig,
        enemies: Enemy[],
        context: CanvasRenderingContext2D
    ): Projectile | null {
        // Se não há inimigos, não disparar
        if (enemies.length === 0) return null;

        // Obter estratégia de targeting
        const focusType = skill.focus || FocusType.NEAREST;
        let strategy = this.strategies.get(focusType);
        
        if (!strategy) {
            strategy = createTargetingStrategy(focusType);
            this.strategies.set(focusType, strategy);
        }

        // Selecionar alvo
        const target = strategy.selectTarget(
            enemies,
            MIDDLE_SCREEN_X,
            MIDDLE_SCREEN_Y,
            skill.range
        );

        // Se não encontrou alvo válido, não disparar
        if (!target) return null;

        // Calcular ângulo para o alvo
        const angle = Math.atan2(
            target.y - MIDDLE_SCREEN_Y,
            target.x - MIDDLE_SCREEN_X
        );

        // Criar velocidade
        const velocity = createVelocity(angle, skill.velocity_factor);

        // Criar projétil
        return new Projectile(
            context,
            MIDDLE_SCREEN_X,
            MIDDLE_SCREEN_Y,
            velocity,
            skill
        );
    }
}
```

---

### Fase 3: Integração no Loop Principal

#### 3.1 Atualizar `main.ts`

```typescript
// client/src/main.ts

import { AutoSkillSystem } from './systems/AutoSkillSystem';

// ... código existente ...

// Criar instância do sistema
const autoSkillSystem = new AutoSkillSystem();

// No loop de animação (animate function)
function animate() {
    animationId = requestAnimationFrame(animate);

    handleCanvas(canvas);
    handlePlayer(player);
    handleParticles(particles);

    // 🆕 Processar auto-fire de skills
    const autoFiredProjectiles = autoSkillSystem.processSkills(
        Object.values(dataProjectile),
        enemies,
        context
    );
    
    // Adicionar projéteis disparados automaticamente
    projectiles.push(...autoFiredProjectiles);
    projectilesFired += autoFiredProjectiles.length;

    handleProjectiles(projectiles);
    handleEnemies(context, enemies, particles, player, projectiles);
    
    // ... resto do código
}
```

#### 3.2 Remover Sistema Manual (Opcional)

```typescript
// Remover ou comentar:
// - window.addEventListener('click', ...)
// - Funções qHandle, wHandle, etc (ou manter para UI apenas)
// - Variável canFire (não mais necessária)
```

---

## 📊 Roadmap de Implementação

### **Fase 1: Targeting System** (2-3 horas)
- [ ] Criar interface `ITargetingStrategy`
- [ ] Implementar `NearestTargetStrategy`
- [ ] Implementar `FarthestTargetStrategy`
- [ ] Implementar `HighestHpTargetStrategy`
- [ ] Implementar `LowestHpTargetStrategy`
- [ ] Criar factory `createTargetingStrategy`

### **Fase 2: Atualizar Configuração** (30 min)
- [ ] Atualizar interface `ProjectileConfig`
- [ ] Adicionar `FocusType` enum
- [ ] Atualizar dados das skills (adicionar `range`, `focus`)
- [ ] Configurar valores padrão para skills existentes

### **Fase 3: AutoSkillSystem** (2-3 horas)
- [ ] Criar classe `AutoSkillSystem`
- [ ] Implementar `processSkills()` - processa todas skills
- [ ] Implementar `fireSkill()` - dispara skill específica
- [ ] Integrar com sistema de targeting

### **Fase 4: Integração** (1-2 horas)
- [ ] Integrar `AutoSkillSystem` no loop principal
- [ ] Remover/desabilitar sistema manual (click events)
- [ ] Atualizar cooldowns (deixar funcionar normalmente)
- [ ] Testar todas as skills

### **Fase 5: Testes e Ajustes** (1-2 horas)
- [ ] Testar cada tipo de focus
- [ ] Testar range (com e sem limit)
- [ ] Ajustar balanceamento (ranges, cooldowns)
- [ ] Verificar performance

**Total Estimado**: 7-11 horas

---

## 🎯 Benefícios da Arquitetura

### ✅ Escalável
- Fácil adicionar novos tipos de focus (apenas criar nova Strategy)
- Fácil adicionar novos comportamentos (extender `ProjectileConfig`)

### ✅ Manutenível
- Strategy Pattern: cada tipo de targeting isolado
- Factory Pattern: criação centralizada
- Código testável e reutilizável

### ✅ Flexível
- Skills podem ter `autoFire: false` para controle manual
- Range pode ser `0` (ilimitado) ou valor específico
- Múltiplos tipos de focus facilmente configuráveis

### ✅ Profissional
- Interfaces claras (`ITargetingStrategy`)
- Separação de responsabilidades
- Sistema de componentes extensível

---

## 🔮 Futuras Expansões Fáceis

### Novos Tipos de Focus
```typescript
// Adicionar em FocusType enum:
WEAKEST = 'weakest',           // Menos defesa
STRONGEST = 'strongest',       // Mais defesa
NEAREST_TO_BASE = 'nearest_base', // Mais perto do player
CLUSTER = 'cluster',           // Maior grupo de inimigos
```

### Novos Comportamentos
```typescript
// Adicionar em ProjectileConfig:
homing?: boolean;              // Projétil segue alvo
areaOfEffect?: number;         // Dano em área
chainTargets?: number;         // Saltar entre alvos
```

### Skills Especiais
```typescript
// Exemplo: skill que busca alvo diferente
{
    name: 'smart_missile',
    focus: FocusType.HIGHEST_HP,
    range: 1000,
    homing: true,
    chainTargets: 3
}
```

---

## 📋 Checklist de Implementação

- [ ] Criar estrutura de pastas (`targeting/`, `systems/`)
- [ ] Implementar `ITargetingStrategy` e todas as strategies
- [ ] Atualizar `ProjectileConfig` com novos atributos
- [ ] Criar `AutoSkillSystem`
- [ ] Integrar no loop principal
- [ ] Remover sistema manual (ou manter opcional)
- [ ] Testar todas as skills
- [ ] Ajustar balanceamento

---

## ❓ Considerações Importantes

### Performance
- Targeting roda a cada frame para skills com cooldown = 0
- Considerar cache de estratégias (já implementado com Map)
- Se muitos inimigos, considerar spatial partitioning

### Gameplay
- Range = 0 significa ilimitado?
- O que acontece se não há alvos no range?
- Skills devem esperar até ter alvo válido?

### UI
- Manter botões Q/W/E/R visíveis? (para informação)
- Mostrar range visualmente? (círculo)
- Mostrar alvo selecionado? (opcional)

---

**Conclusão**: Arquitetura escalável e profissional, pronta para implementação e fácil de expandir no futuro!
