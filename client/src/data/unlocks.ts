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
        featureId?: string;    // Se type = FEATURE
        stageId?: number;      // Se type = STAGE
        difficultyId?: string; // Se type = DIFFICULTY
    };
}

export const unlockData: Unlock[] = [
    // Unlock Skills (2)
    {
        id: 'unlock_skill_bomb',
        type: UnlockType.SKILL,
        name: 'Desbloquear Bomb',
        description: 'Permite usar a skill Bomb nas próximas partidas',
        cost: 5,
        data: { skillId: 3 }
    },
    {
        id: 'unlock_skill_laser',
        type: UnlockType.SKILL,
        name: 'Desbloquear Laser',
        description: 'Nova skill: Laser que atravessa inimigos',
        cost: 10,
        data: { skillId: 4 }
    },
    
    // Unlock Items (2)
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
    
    // Unlock Base Stats (2)
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
    
    // Unlock Features (2)
    {
        id: 'unlock_feature_auto_pickup',
        type: UnlockType.FEATURE,
        name: 'Coleta Automática',
        description: 'Coleta automática de XP e Points',
        cost: 20,
        data: { featureId: 'auto_pickup' }
    },
    {
        id: 'unlock_feature_double_xp',
        type: UnlockType.FEATURE,
        name: 'XP Duplo',
        description: 'Ganha 2x mais XP nas partidas',
        cost: 25,
        data: { featureId: 'double_xp' }
    },
    
    // Unlock Stages (2)
    {
        id: 'unlock_stage_2',
        type: UnlockType.STAGE,
        name: 'Estágio 2',
        description: 'Desbloqueia o segundo estágio',
        cost: 25,
        data: { stageId: 2 }
    },
    {
        id: 'unlock_stage_3',
        type: UnlockType.STAGE,
        name: 'Estágio 3',
        description: 'Desbloqueia o terceiro estágio',
        cost: 50,
        data: { stageId: 3 }
    },
    
    // Unlock Difficulties (2)
    {
        id: 'unlock_difficulty_hard',
        type: UnlockType.DIFFICULTY,
        name: 'Dificuldade: Hard',
        description: 'Desbloqueia modo Hard (mais inimigos, mais recompensas)',
        cost: 30,
        data: { difficultyId: 'hard' }
    },
    {
        id: 'unlock_difficulty_hell',
        type: UnlockType.DIFFICULTY,
        name: 'Dificuldade: Hell',
        description: 'Desbloqueia modo Hell (extremo, maiores recompensas)',
        cost: 60,
        data: { difficultyId: 'hell' }
    },
];
