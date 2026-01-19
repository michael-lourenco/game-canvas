/**
 * Skills disponíveis para comprar na loja durante a partida
 */
export interface ShopSkill {
    id: number;
    name: string;
    description: string;
    cost: number;              // Points necessários
    unlocked: boolean;         // Se foi desbloqueado com diamonds (meta progressão)
    available: boolean;        // Se está disponível nesta partida
}

export const shopSkills: ShopSkill[] = [
    {
        id: 4,
        name: 'Laser',
        description: 'Projétil que atravessa inimigos (pierce infinito)',
        cost: 50,
        unlocked: false,  // Precisa desbloquear com diamonds primeiro
        available: false
    },
    {
        id: 5,
        name: 'Shield',
        description: 'Escudo que bloqueia um ataque (proteção passiva)',
        cost: 75,
        unlocked: false,
        available: false
    },
];
