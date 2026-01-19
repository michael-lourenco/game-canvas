# 🎮 Plano de Implementação - Tower Defense Roguelike com Meta Progressão

## 📋 Análise do Requisito

### Sistema de Moedas

1. **XP** (dentro da partida) - ✅ Já existe
   - Ganho ao matar inimigos
   - Usado para subir de nível

2. **Points** (dentro da partida) - ✅ Já existe  
   - Ganho ao matar inimigos
   - Usado para habilitar skills durante a partida

3. **Diamonds** (fora da partida) - 🆕 Novo
   - Conquistados ao cumprir requisitos
   - Usado para meta progressão (unlocks permanentes)

---

### Fluxo do Jogo

```
Hub (Meta Progressão)
  ↓
Iniciar Partida
  ↓
Durante Partida
  - Coletar XP → Subir Nível → Escolher Carta de Melhoria
  - Coletar Points → Comprar Skills
  ↓
Morte
  ↓
Voltar ao Hub
  - Usar Diamonds para unlocks permanentes
  ↓
Repetir
```

---

## 🏗️ Arquitetura Proposta

### Estrutura de Sistemas

```
Meta Progressão (Fora da Partida)
├── DiamondManager           # Gerencia diamonds
├── UnlockManager            # Gerencia unlocks (skills, items, etc)
└── ProgressTracker          # Rastreia conquistas

Sistema de Níveis (Dentro da Partida)
├── LevelUpSystem            # Sistema de níveis baseado em XP
├── UpgradeCardSystem        # Sistema de cartas de melhoria
└── SkillShopSystem          # Loja de skills (usando points)

Data & Configurações
├── UpgradeCards             # Cartas de melhoria disponíveis
├── Items                    # Items disponíveis
├── Unlocks                  # Unlocks disponíveis
└── Stages                   # Estágios/dificuldades
```

---

## 📦 Estrutura de Diretórios

```
client/src/
├── systems/
│   ├── AutoSkillSystem.ts        ✅ (já existe)
│   ├── LevelUpSystem.ts          # 🆕 Sistema de níveis
│   └── UpgradeCardSystem.ts      # 🆕 Sistema de cartas
│
├── managers/
│   ├── SaveManager.ts            ✅ (já existe)
│   ├── DiamondManager.ts         # 🆕 Gerencia diamonds
│   ├── UnlockManager.ts          # 🆕 Gerencia unlocks
│   ├── SkillShopManager.ts       # 🆕 Loja de skills (in-game)
│   └── ProgressTracker.ts        # 🆕 Rastreia conquistas
│
├── data/
│   ├── enemies.ts                ✅ (já existe)
│   ├── projectiles.ts            ✅ (já existe)
│   ├── upgradeCards.ts           # 🆕 Cartas de melhoria
│   ├── items.ts                  # 🆕 Items
│   ├── unlocks.ts                # 🆕 Unlocks (meta progressão)
│   └── stages.ts                 # 🆕 Estágios/dificuldades
│
├── ui/
│   ├── Hub.ts                    # 🆕 Tela principal (meta progressão)
│   ├── UpgradeSelection.ts       # 🆕 UI para escolher cartas
│   ├── SkillShop.ts              # 🆕 UI da loja de skills
│   └── UnlockPanel.ts            # 🆕 UI de unlocks
│
└── state/
    ├── GameState.ts              # Estado do jogo (já existe)
    ├── MetaProgressState.ts      # 🆕 Estado de meta progressão
    └── RunState.ts               # 🆕 Estado da partida atual
```

---

## 💎 Sistema de Diamonds

### Como Conquistar Diamonds

```typescript
// Exemplos de conquistas:
- Matar 100 inimigos (1 diamond)
- Sobreviver 2 minutos (1 diamond)
- Chegar no nível 10 (2 diamonds)
- Matar boss (5 diamonds)
- Completar estágio pela primeira vez (10 diamonds)
```

### Gerenciamento

```typescript
// client/src/managers/DiamondManager.ts

export class DiamondManager {
    // Adicionar diamonds
    addDiamonds(amount: number): void
    
    // Gastar diamonds
    spendDiamonds(amount: number): boolean
    
    // Obter total
    getTotal(): number
    
    // Salvar/carregar do storage
    save(): Promise<void>
    load(): Promise<void>
}
```

---

## 🔓 Sistema de Unlocks

### Tipos de Unlocks

```typescript
export enum UnlockType {
    SKILL = 'skill',           // Desbloquear skill/projectile
    ITEM = 'item',             // Desbloquear item
    BASE_STAT = 'base_stat',   // Melhorar status base
    FEATURE = 'feature',       // Desbloquear funcionalidade
    STAGE = 'stage',           // Desbloquear estágio
    DIFFICULTY = 'difficulty', // Desbloquear dificuldade
}

export interface Unlock {
    id: string;
    type: UnlockType;
    name: string;
    description: string;
    cost: number;              // Diamonds necessários
    icon?: string;
    
    // Dados específicos por tipo
    data: {
        skillId?: number;      // Se type = SKILL
        itemId?: string;       // Se type = ITEM
        statName?: string;     // Se type = BASE_STAT
        statValue?: number;
        // ... etc
    };
}
```

### Exemplo de Unlocks Iniciais

```typescript
// client/src/data/unlocks.ts

export const unlockData: Unlock[] = [
    // Unlock Skills
    {
        id: 'unlock_skill_4',
        type: UnlockType.SKILL,
        name: 'Desbloquear Bomb',
        description: 'Permite usar a skill Bomb nas próximas partidas',
        cost: 5,
        data: { skillId: 3 }
    },
    {
        id: 'unlock_skill_5',
        type: UnlockType.SKILL,
        name: 'Desbloquear Laser',
        description: 'Nova skill: Laser que atravessa inimigos',
        cost: 10,
        data: { skillId: 4 }
    },
    
    // Unlock Items
    {
        id: 'unlock_item_healing',
        type: UnlockType.ITEM,
        name: 'Poção de Cura',
        description: 'Item que restaura HP durante a partida',
        cost: 8,
        data: { itemId: 'healing_potion' }
    },
    {
        id: 'unlock_item_damage',
        type: UnlockType.ITEM,
        name: 'Amuleto de Dano',
        description: 'Aumenta dano em 10% permanentemente',
        cost: 15,
        data: { itemId: 'damage_amulet' }
    },
    
    // Unlock Base Stats
    {
        id: 'unlock_stat_hp',
        type: UnlockType.BASE_STAT,
        name: '+10 HP Base',
        description: 'Aumenta HP inicial em 10 pontos',
        cost: 3,
        data: { statName: 'hp', statValue: 10 }
    },
    {
        id: 'unlock_stat_damage',
        type: UnlockType.BASE_STAT,
        name: '+5 Dano Base',
        description: 'Aumenta dano base em 5 pontos',
        cost: 3,
        data: { statName: 'damage', statValue: 5 }
    },
    
    // Unlock Features
    {
        id: 'unlock_feature_auto_pickup',
        type: UnlockType.FEATURE,
        name: 'Coleta Automática',
        description: 'Coleta automática de XP e Points',
        cost: 20,
        data: {}
    },
    
    // Unlock Stages
    {
        id: 'unlock_stage_2',
        type: UnlockType.STAGE,
        name: 'Estágio 2',
        description: 'Desbloqueia o segundo estágio',
        cost: 25,
        data: { stageId: 2 }
    },
];
```

---

## 📈 Sistema de Níveis e Cartas de Melhoria

### Sistema de Níveis

```typescript
// client/src/systems/LevelUpSystem.ts

export class LevelUpSystem {
    private currentLevel: number = 1;
    private currentXp: number = 0;
    private xpRequired: (level: number) => number; // Função de XP necessária
    
    // Adicionar XP
    addXp(amount: number): boolean  // Retorna true se subiu de nível
    
    // Obter nível atual
    getLevel(): number
    
    // Obter XP atual e necessário
    getXpProgress(): { current: number; required: number }
    
    // Callback quando sobe de nível
    onLevelUp(callback: () => void): void
}
```

### Cartas de Melhoria

```typescript
// client/src/data/upgradeCards.ts

export enum UpgradeCardType {
    STAT_BOOST = 'stat_boost',     // Aumenta status (dano, velocidade, etc)
    SKILL_UPGRADE = 'skill_upgrade', // Melhora skill existente
    NEW_SKILL = 'new_skill',       // Adiciona nova skill
    EFFECT = 'effect',             // Efeito especial
}

export interface UpgradeCard {
    id: string;
    type: UpgradeCardType;
    name: string;
    description: string;
    icon?: string;
    
    // Efeito da carta
    effect: {
        statName?: string;         // Se type = STAT_BOOST
        statValue?: number;
        skillId?: number;          // Se type = SKILL_UPGRADE
        skillUpgrade?: any;        // Melhoria específica da skill
        newSkillId?: number;       // Se type = NEW_SKILL
        effectId?: string;         // Se type = EFFECT
    };
    
    // Raridade (afeta probabilidade de aparecer)
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export const upgradeCards: UpgradeCard[] = [
    // Common
    {
        id: 'card_damage_boost',
        type: UpgradeCardType.STAT_BOOST,
        name: '+10% Dano',
        description: 'Aumenta dano de todas as skills em 10%',
        rarity: 'common',
        effect: {
            statName: 'damage',
            statValue: 1.10  // Multiplicador
        }
    },
    {
        id: 'card_speed_boost',
        type: UpgradeCardType.STAT_BOOST,
        name: '+15% Velocidade',
        description: 'Aumenta velocidade de projéteis em 15%',
        rarity: 'common',
        effect: {
            statName: 'projectileSpeed',
            statValue: 1.15
        }
    },
    
    // Rare
    {
        id: 'card_cooldown_reduction',
        type: UpgradeCardType.STAT_BOOST,
        name: '-20% Cooldown',
        description: 'Reduz cooldown de todas as skills em 20%',
        rarity: 'rare',
        effect: {
            statName: 'cooldown',
            statValue: 0.80  // Multiplicador (reduz)
        }
    },
    {
        id: 'card_gun_upgrade',
        type: UpgradeCardType.SKILL_UPGRADE,
        name: 'Gun Melhorado',
        description: 'Gun agora dispara 2 projéteis ao mesmo tempo',
        rarity: 'rare',
        effect: {
            skillId: 0,
            skillUpgrade: { multiShot: 2 }
        }
    },
    
    // Epic
    {
        id: 'card_critical_chance',
        type: UpgradeCardType.EFFECT,
        name: 'Chance Crítica',
        description: '10% de chance de crítico (2x dano)',
        rarity: 'epic',
        effect: {
            effectId: 'critical_strike',
            statValue: 0.10
        }
    },
    
    // Legendary
    {
        id: 'card_new_skill',
        type: UpgradeCardType.NEW_SKILL,
        name: 'Nova Skill: Laser',
        description: 'Desbloqueia skill Laser para esta partida',
        rarity: 'legendary',
        effect: {
            newSkillId: 4
        }
    },
];
```

### Sistema de Seleção de Cartas

```typescript
// client/src/systems/UpgradeCardSystem.ts

export class UpgradeCardSystem {
    // Gerar opções de cartas (3 aleatórias baseadas em raridade)
    generateCardOptions(level: number): UpgradeCard[]
    
    // Aplicar efeito da carta escolhida
    applyCard(card: UpgradeCard, gameState: GameState): void
    
    // Obter cartas já escolhidas nesta partida
    getSelectedCards(): UpgradeCard[]
}
```

---

## 🛒 Sistema de Loja de Skills (In-Game)

### Skills Disponíveis para Comprar

```typescript
// client/src/data/skillShop.ts

export interface ShopSkill {
    id: number;
    name: string;
    description: string;
    cost: number;              // Points necessários
    unlocked: boolean;         // Se foi desbloqueado com diamonds
    available: boolean;        // Se está disponível nesta partida
}

export const shopSkills: ShopSkill[] = [
    {
        id: 4,
        name: 'Laser',
        description: 'Projétil que atravessa inimigos',
        cost: 50,
        unlocked: false,  // Precisa desbloquear com diamonds
        available: false
    },
    {
        id: 5,
        name: 'Shield',
        description: 'Escudo que bloqueia um ataque',
        cost: 75,
        unlocked: false,
        available: false
    },
];
```

---

## 🎯 Sistema de Items

### Items Disponíveis

```typescript
// client/src/data/items.ts

export enum ItemType {
    CONSUMABLE = 'consumable',  // Usa e some (poção de cura)
    PASSIVE = 'passive',        // Efeito permanente (amuleto)
}

export interface Item {
    id: string;
    name: string;
    description: string;
    type: ItemType;
    icon?: string;
    
    // Efeito do item
    effect: {
        hpRestore?: number;     // Se consumable
        damageMultiplier?: number;
        speedMultiplier?: number;
        // ... etc
    };
    
    // Se precisa desbloquear
    unlockId?: string;          // ID do unlock necessário
}

export const items: Item[] = [
    {
        id: 'healing_potion',
        name: 'Poção de Cura',
        description: 'Restaura 50 HP',
        type: ItemType.CONSUMABLE,
        effect: {
            hpRestore: 50
        },
        unlockId: 'unlock_item_healing'
    },
    {
        id: 'damage_amulet',
        name: 'Amuleto de Dano',
        description: '+10% dano permanente',
        type: ItemType.PASSIVE,
        effect: {
            damageMultiplier: 1.10
        },
        unlockId: 'unlock_item_damage'
    },
];
```

---

## 🏛️ Hub (Tela Principal)

### Estrutura do Hub

```
Hub
├── Meta Progressão
│   ├── Total de Diamonds
│   ├── Unlocks Disponíveis
│   └── Status Permanentes
│
├── Partida
│   ├── Botão "Iniciar Partida"
│   ├── Estágio Selecionado
│   └── Dificuldade Selecionada
│
└── Progresso
    ├── Melhor Score
    ├── Nível Máximo Alcançado
    └── Estatísticas Gerais
```

---

## 💾 Armazenamento de Dados

### Estrutura de Dados para Salvar

```typescript
// client/src/storage/IStorageService.ts

export interface MetaProgressData {
    diamonds: number;
    unlockedSkills: number[];      // IDs de skills desbloqueadas
    unlockedItems: string[];       // IDs de items desbloqueados
    unlockedStages: number[];      // IDs de estágios desbloqueados
    baseStats: {
        hp: number;
        damage: number;
        speed: number;
        // ... etc
    };
    features: string[];            // Features desbloqueadas
}

export interface RunData {
    // Dados da partida atual
    level: number;
    selectedCards: string[];       // IDs de cartas escolhidas
    purchasedSkills: number[];     // Skills compradas com points
    itemsUsed: string[];           // Items usados na partida
}
```

---

## 📊 Roadmap de Implementação

### **Fase 1: Sistema de Diamonds** (2-3 horas)
- [ ] Criar `DiamondManager`
- [ ] Integrar com `SaveManager`
- [ ] Criar sistema de conquistas (achievements)
- [ ] UI para exibir diamonds no Hub

### **Fase 2: Sistema de Unlocks** (3-4 horas)
- [ ] Criar `UnlockManager`
- [ ] Definir tipos de unlocks (enum)
- [ ] Criar dados de unlocks (2 de cada tipo)
- [ ] UI de Unlock Panel
- [ ] Integrar com `DiamondManager`

### **Fase 3: Sistema de Níveis e Cartas** (4-5 horas)
- [ ] Criar `LevelUpSystem`
- [ ] Criar `UpgradeCardSystem`
- [ ] Criar dados de cartas (2 de cada raridade)
- [ ] UI de seleção de cartas (UpgradeSelection)
- [ ] Integrar no loop principal

### **Fase 4: Sistema de Loja de Skills** (2-3 horas)
- [ ] Criar `SkillShopManager`
- [ ] Criar dados de shop skills (2 skills)
- [ ] UI da loja (SkillShop)
- [ ] Integrar com sistema de points

### **Fase 5: Sistema de Items** (2-3 horas)
- [ ] Criar dados de items (2 items)
- [ ] Sistema de aplicação de items
- [ ] Integrar com unlocks

### **Fase 6: Hub e UI** (3-4 horas)
- [ ] Criar tela Hub
- [ ] Integrar todos os sistemas
- [ ] Fluxo completo: Hub → Partida → Hub

### **Fase 7: Integração e Testes** (2-3 horas)
- [ ] Testar fluxo completo
- [ ] Ajustar balanceamento
- [ ] Polimento de UI

**Total Estimado**: 18-25 horas

---

## 🎯 Exemplo de Fluxo Completo

### 1. Início (Hub)

```typescript
Hub.ts
├── Exibir: 10 Diamonds disponíveis
├── Unlocks: Mostrar 2 unlocks disponíveis
└── Botão: "Iniciar Partida"
```

### 2. Durante Partida

```typescript
RunState
├── Coletar XP → Subir para nível 2
├── LevelUpSystem detecta level up
├── UpgradeCardSystem gera 3 cartas
├── Player escolhe: "+10% Dano"
└── Efeito aplicado
```

### 3. Loja de Skills (Durante Partida)

```typescript
Player tem 50 Points
├── Abrir SkillShop UI
├── Ver: Laser (50 points, desbloqueado? não)
└── Se desbloqueado: Comprar → Adicionar skill
```

### 4. Fim da Partida

```typescript
Player morreu
├── Calcular conquistas
├── Adicionar diamonds (ex: +2 diamonds)
├── Salvar progresso
└── Voltar ao Hub
```

---

## 📋 Estrutura de Dados Completa

### Meta Progress (Fora da Partida)

```typescript
{
    diamonds: 25,
    unlockedSkills: [0, 1, 2],      // Gun, Rifle, Shotgun (iniciais)
    unlockedItems: [],
    unlockedStages: [1],             // Estágio 1 (inicial)
    baseStats: {
        hp: 100,                     // Base
        damage: 1,                   // Multiplicador base
        speed: 1
    },
    features: [],
    totalGames: 5,
    bestScore: 1250,
    achievements: ['kill_100_enemies', 'survive_2min']
}
```

### Run State (Dentro da Partida)

```typescript
{
    level: 5,
    xp: 150,
    xpRequired: 200,
    points: 85,
    selectedCards: ['card_damage_boost', 'card_cooldown_reduction'],
    purchasedSkills: [4],            // Laser comprado
    activeItems: ['damage_amulet'],
    stats: {
        damage: 1.20,                // Base + cartas
        speed: 1.15,
        cooldown: 0.80
    }
}
```

---

## ✅ Checklist de Implementação

### Fase 1: Fundação
- [ ] DiamondManager criado
- [ ] UnlockManager criado
- [ ] Estrutura de dados definida

### Fase 2: Sistemas de Partida
- [ ] LevelUpSystem criado
- [ ] UpgradeCardSystem criado
- [ ] SkillShopManager criado

### Fase 3: Dados
- [ ] 2 Upgrade Cards criadas
- [ ] 2 Items criados
- [ ] 2 Unlocks de cada tipo criados
- [ ] 2 Shop Skills criadas

### Fase 4: UI
- [ ] Hub criado
- [ ] UpgradeSelection UI criada
- [ ] SkillShop UI criada
- [ ] UnlockPanel UI criada

### Fase 5: Integração
- [ ] Fluxo completo testado
- [ ] Salvamento funcionando
- [ ] Balanceamento ajustado

---

## 🔮 Futuras Expansões

### Novos Tipos de Unlocks
- Unlock novas raridades de cartas
- Unlock novos tipos de inimigos
- Unlock novas mecânicas

### Novos Tipos de Items
- Items que modificam skills
- Items que dão efeitos temporários
- Items que mudam gameplay

### Novos Tipos de Cartas
- Cartas de evolução (evolui skill)
- Cartas de combo (efeito ao ter X cartas)
- Cartas de transformação

---

## 📝 Notas de Design

### Balanceamento Inicial

- **Diamonds**: Valores entre 1-25 (raros até 50)
- **Unlocks**: Skills custam 5-15, Items 8-20, Stats 3-5
- **Cartas**: Common 60%, Rare 30%, Epic 8%, Legendary 2%
- **Points**: Skills custam 50-100 points

### UX

- **Hub**: Claro, mostrando progresso visual
- **Seleção de Cartas**: Pausa o jogo, UI clara
- **Loja**: Acessível durante partida (tecla P)
- **Unlocks**: Categorias bem organizadas

---

**Conclusão**: Arquitetura robusta, escalável e profissional, pronta para implementação e expansão futura!
