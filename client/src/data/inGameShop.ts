import { ProjectileConfig } from './projectiles';

/**
 * Skills disponíveis para comprar durante a partida (com points)
 */
export interface InGameShopSkill {
    id: number;
    name: string;
    description: string;
    cost: number;              // Points necessários
    config: ProjectileConfig;   // Configuração da skill
}

export const inGameShopSkills: InGameShopSkill[] = [
    {
        id: 1,
        name: 'Rifle',
        description: 'Projétil de longo alcance com pierce',
        cost: 50,
        config: {
            name: 'riffle',
            pierce: 5,
            attack: 5,
            color: 'hsla(240,100%,50%,0.3)',
            cooldown: 3,
            currentCoolDown: 0,
            radius: 10,
            velocity_factor: 30,
            range: 800,
            focus: 'highest_hp' as any,
            autoFire: true,
        }
    },
    {
        id: 2,
        name: 'Shotgun',
        description: 'Projétil de curto alcance com alto dano',
        cost: 75,
        config: {
            name: 'shotgun',
            pierce: 2,
            attack: 8,
            color: 'hsla(120,100%,50%,0.3)',
            cooldown: 5,
            currentCoolDown: 0,
            radius: 20,
            velocity_factor: 7,
            range: 400,
            focus: 'lowest_hp' as any,
            autoFire: true,
        }
    },
    {
        id: 3,
        name: 'Bomb',
        description: 'Projétil explosivo com pierce infinito',
        cost: 100,
        config: {
            name: 'bomb',
            pierce: 100,
            attack: 10,
            color: 'hsla(25,100%,50%,0.3)',
            cooldown: 15,
            currentCoolDown: 0,
            radius: 50,
            velocity_factor: 5,
            range: 600,
            focus: 'farthest' as any,
            autoFire: true,
        }
    },
];
