import { ProjectileConfig, FocusType } from './projectiles';

/**
 * Definições de skills adicionais (não iniciais)
 * Essas skills podem ser desbloqueadas via cartas ou unlocks
 */
export const additionalSkills: Record<number, ProjectileConfig> = {
    4: {
        name: 'laser',
        pierce: 999,              // Pierce infinito
        attack: 8,
        color: 'hsla(200,100%,50%,0.5)',
        cooldown: 2,
        currentCoolDown: 0,
        radius: 8,
        velocity_factor: 25,
        range: 1000,              // Longo alcance
        focus: FocusType.NEAREST,
        autoFire: true,
    },
    5: {
        name: 'shield',
        pierce: 0,
        attack: 0,                // Não causa dano, apenas proteção
        color: 'hsla(180,100%,50%,0.3)',
        cooldown: 10,
        currentCoolDown: 0,
        radius: 15,
        velocity_factor: 0,       // Não se move
        range: 0,
        focus: FocusType.NEAREST,
        autoFire: false,          // Shield não dispara automaticamente
    },
};
