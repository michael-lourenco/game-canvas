export enum QuestType {
    KILL_ENEMIES = 'kill_enemies',           // Matar X inimigos
    SURVIVE_TIME = 'survive_time',           // Sobreviver X segundos
    REACH_LEVEL = 'reach_level',             // Alcançar nível X
    REACH_SCORE = 'reach_score',             // Alcançar score X
    KILL_BOSS = 'kill_boss',                 // Matar boss
    USE_SKILL = 'use_skill',                 // Usar skill X vezes
    COLLECT_POINTS = 'collect_points',       // Coletar X points
    COMPLETE_STAGE = 'complete_stage',       // Completar estágio
    CHAIN_KILLS = 'chain_kills',            // Matar X inimigos em sequência
    PERFECT_RUN = 'perfect_run',            // Completar run sem morrer
}

export enum QuestRarity {
    COMMON = 'common',
    RARE = 'rare',
    EPIC = 'epic',
    LEGENDARY = 'legendary',
}

export interface Quest {
    id: string;
    name: string;
    description: string;
    type: QuestType;
    requirement: number;              // Valor necessário
    reward: number;                   // Diamonds ganhos
    rarity: QuestRarity;
    repeatable: boolean;              // Se pode ser repetida
    progress: number;                 // Progresso atual (0 a requirement)
    completed: boolean;               // Se foi completada
    completedAt?: number;            // Timestamp quando completou
}

/**
 * Quests diárias e permanentes
 */
export const dailyQuests: Quest[] = [
    // Common
    {
        id: 'daily_kill_50',
        name: 'Caçador do Dia',
        description: 'Mate 50 inimigos hoje',
        type: QuestType.KILL_ENEMIES,
        requirement: 50,
        reward: 1,
        rarity: QuestRarity.COMMON,
        repeatable: true,
        progress: 0,
        completed: false,
    },
    {
        id: 'daily_survive_60',
        name: 'Sobrevivente',
        description: 'Sobreviva 60 segundos em uma partida',
        type: QuestType.SURVIVE_TIME,
        requirement: 60,
        reward: 1,
        rarity: QuestRarity.COMMON,
        repeatable: true,
        progress: 0,
        completed: false,
    },
    
    // Rare
    {
        id: 'daily_reach_level_5',
        name: 'Ascensão',
        description: 'Alcance o nível 5 em uma partida',
        type: QuestType.REACH_LEVEL,
        requirement: 5,
        reward: 2,
        rarity: QuestRarity.RARE,
        repeatable: true,
        progress: 0,
        completed: false,
    },
    {
        id: 'daily_collect_100_points',
        name: 'Coletor',
        description: 'Colete 100 points em uma partida',
        type: QuestType.COLLECT_POINTS,
        requirement: 100,
        reward: 2,
        rarity: QuestRarity.RARE,
        repeatable: true,
        progress: 0,
        completed: false,
    },
    
    // Epic
    {
        id: 'daily_reach_score_500',
        name: 'Pontuação Alta',
        description: 'Alcance 500 pontos em uma partida',
        type: QuestType.REACH_SCORE,
        requirement: 500,
        reward: 3,
        rarity: QuestRarity.EPIC,
        repeatable: true,
        progress: 0,
        completed: false,
    },
];

/**
 * Quests permanentes (uma vez só)
 */
export const permanentQuests: Quest[] = [
    // Common
    {
        id: 'perm_kill_100',
        name: 'Primeiro Massacre',
        description: 'Mate 100 inimigos no total',
        type: QuestType.KILL_ENEMIES,
        requirement: 100,
        reward: 2,
        rarity: QuestRarity.COMMON,
        repeatable: false,
        progress: 0,
        completed: false,
    },
    {
        id: 'perm_kill_500',
        name: 'Carniceiro',
        description: 'Mate 500 inimigos no total',
        type: QuestType.KILL_ENEMIES,
        requirement: 500,
        reward: 5,
        rarity: QuestRarity.RARE,
        repeatable: false,
        progress: 0,
        completed: false,
    },
    {
        id: 'perm_kill_1000',
        name: 'Exterminador',
        description: 'Mate 1000 inimigos no total',
        type: QuestType.KILL_ENEMIES,
        requirement: 1000,
        reward: 10,
        rarity: QuestRarity.EPIC,
        repeatable: false,
        progress: 0,
        completed: false,
    },
    
    // Survival
    {
        id: 'perm_survive_120',
        name: 'Sobrevivente',
        description: 'Sobreviva 2 minutos em uma partida',
        type: QuestType.SURVIVE_TIME,
        requirement: 120,
        reward: 2,
        rarity: QuestRarity.COMMON,
        repeatable: false,
        progress: 0,
        completed: false,
    },
    {
        id: 'perm_survive_300',
        name: 'Veterano',
        description: 'Sobreviva 5 minutos em uma partida',
        type: QuestType.SURVIVE_TIME,
        requirement: 300,
        reward: 5,
        rarity: QuestRarity.RARE,
        repeatable: false,
        progress: 0,
        completed: false,
    },
    
    // Level
    {
        id: 'perm_level_10',
        name: 'Aprendiz',
        description: 'Alcance o nível 10 em uma partida',
        type: QuestType.REACH_LEVEL,
        requirement: 10,
        reward: 3,
        rarity: QuestRarity.RARE,
        repeatable: false,
        progress: 0,
        completed: false,
    },
    {
        id: 'perm_level_20',
        name: 'Mestre',
        description: 'Alcance o nível 20 em uma partida',
        type: QuestType.REACH_LEVEL,
        requirement: 20,
        reward: 8,
        rarity: QuestRarity.EPIC,
        repeatable: false,
        progress: 0,
        completed: false,
    },
    
    // Score
    {
        id: 'perm_score_1000',
        name: 'Pontuador',
        description: 'Alcance 1000 pontos em uma partida',
        type: QuestType.REACH_SCORE,
        requirement: 1000,
        reward: 5,
        rarity: QuestRarity.RARE,
        repeatable: false,
        progress: 0,
        completed: false,
    },
    {
        id: 'perm_score_5000',
        name: 'Lendário',
        description: 'Alcance 5000 pontos em uma partida',
        type: QuestType.REACH_SCORE,
        requirement: 5000,
        reward: 15,
        rarity: QuestRarity.LEGENDARY,
        repeatable: false,
        progress: 0,
        completed: false,
    },
];
