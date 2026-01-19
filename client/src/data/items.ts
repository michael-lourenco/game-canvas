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
        hpMultiplier?: number;
        // ... outros efeitos
    };
    
    // Se precisa desbloquear (meta progressão)
    unlockId?: string;          // ID do unlock necessário
}

export const items: Item[] = [
    // Consumable (1)
    {
        id: 'healing_potion',
        name: 'Poção de Cura',
        description: 'Restaura 50 HP quando usado',
        type: ItemType.CONSUMABLE,
        effect: {
            hpRestore: 50
        },
        unlockId: 'unlock_item_healing'
    },
    
    // Passive (1)
    {
        id: 'damage_amulet',
        name: 'Amuleto de Dano',
        description: '+10% dano permanente durante a partida',
        type: ItemType.PASSIVE,
        effect: {
            damageMultiplier: 1.10
        },
        unlockId: 'unlock_item_damage'
    },
];
