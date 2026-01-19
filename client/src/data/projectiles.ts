export enum FocusType {
    NEAREST = 'nearest',           // Inimigo mais próximo
    FARTHEST = 'farthest',         // Inimigo mais distante
    HIGHEST_HP = 'highest_hp',     // Inimigo com mais HP
    LOWEST_HP = 'lowest_hp',       // Inimigo com menos HP
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
    
    // 🆕 Novos atributos para auto-fire
    range?: number;                // Distância máxima (0 ou undefined = ilimitado)
    focus?: FocusType;             // Tipo de foco/alvo (padrão: NEAREST)
    autoFire?: boolean;            // Se dispara automaticamente (padrão: true)
}

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
        range: 500,                    // 🆕 Alcance de 500px
        focus: FocusType.NEAREST,      // 🆕 Foca no mais próximo
        autoFire: true,                // 🆕 Auto-fire ativado
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
        range: 800,                    // 🆕 Longo alcance
        focus: FocusType.HIGHEST_HP,   // 🆕 Foca nos mais resistentes
        autoFire: true,
    },
    2: {
        name: 'shotgun',
        pierce: 2,
        attack: 8,
        color: 'hsla(120,100%,50%,0.3)',
        cooldown: 5,
        currentCoolDown: 0,
        radius: 20,
        velocity_factor: 7,
        range: 400,                    // 🆕 Alcance médio
        focus: FocusType.LOWEST_HP,    // 🆕 Foca nos mais fracos
        autoFire: true,
    },
    3: {
        name: 'bomb',
        pierce: 100,
        attack: 10,
        color: 'hsla(25,100%,50%,0.3)',
        cooldown: 15,
        currentCoolDown: 0,
        radius: 50,
        velocity_factor: 5,
        range: 600,                    // 🆕 Alcance bom
        focus: FocusType.FARTHEST,     // 🆕 Foca nos mais distantes
        autoFire: true,
    }
};
