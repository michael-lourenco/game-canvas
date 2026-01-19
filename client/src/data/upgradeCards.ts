export enum UpgradeCardType {
    STAT_BOOST = 'stat_boost',     // Aumenta status (dano, velocidade, etc)
    SKILL_UPGRADE = 'skill_upgrade', // Melhora skill existente
    NEW_SKILL = 'new_skill',       // Adiciona nova skill
    EFFECT = 'effect',             // Efeito especial
}

export type CardRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface UpgradeCard {
    id: string;
    type: UpgradeCardType;
    name: string;
    description: string;
    icon?: string;
    rarity: CardRarity;
    
    // Efeito da carta
    effect: {
        statName?: string;         // Se type = STAT_BOOST
        statValue?: number;        // Valor ou multiplicador
        skillId?: number;          // Se type = SKILL_UPGRADE
        skillUpgrade?: any;        // Melhoria específica da skill
        newSkillId?: number;       // Se type = NEW_SKILL
        effectId?: string;         // Se type = EFFECT
    };
}

export const upgradeCards: UpgradeCard[] = [
    // Common (2)
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
    
    // Rare (2)
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
    
    // Epic (2)
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
    {
        id: 'card_pierce_all',
        type: UpgradeCardType.STAT_BOOST,
        name: 'Perfuração Total',
        description: 'Todas as skills têm pierce infinito',
        rarity: 'epic',
        effect: {
            statName: 'pierce',
            statValue: 999  // Pierce muito alto
        }
    },
    
    // Legendary (2)
    {
        id: 'card_new_skill_laser',
        type: UpgradeCardType.NEW_SKILL,
        name: 'Nova Skill: Laser',
        description: 'Desbloqueia skill Laser para esta partida',
        rarity: 'legendary',
        effect: {
            newSkillId: 4
        }
    },
    {
        id: 'card_double_damage',
        type: UpgradeCardType.STAT_BOOST,
        name: 'Dano Duplo',
        description: 'Aumenta dano em 100%',
        rarity: 'legendary',
        effect: {
            statName: 'damage',
            statValue: 2.0  // Dobro de dano
        }
    },
];

// Pesos para geração aleatória baseado em raridade
export const rarityWeights: Record<CardRarity, number> = {
    common: 60,
    rare: 30,
    epic: 8,
    legendary: 2,
};
