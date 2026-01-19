import { Item, ItemType, items } from '../data/items';
import { UnlockManager } from './UnlockManager';

/**
 * Gerencia items durante a partida
 */
export class ItemManager {
    private activeItems: Item[] = []; // Items ativos (passive)
    private usedItems: string[] = []; // Items usados (consumable)
    private availableItems: Item[] = []; // Items disponíveis para esta partida
    private unlockManager: UnlockManager;

    // Efeitos acumulados
    private effects: {
        damageMultiplier: number;
        speedMultiplier: number;
        hpMultiplier: number;
    } = {
        damageMultiplier: 1.0,
        speedMultiplier: 1.0,
        hpMultiplier: 1.0,
    };

    constructor(unlockManager: UnlockManager) {
        this.unlockManager = unlockManager;
        this.initializeItems();
    }

    /**
     * Inicializar items para nova partida
     */
    initializeItems(): void {
        this.activeItems = [];
        this.usedItems = [];
        this.resetEffects();

        // Filtrar items desbloqueados
        this.availableItems = items.filter(item => {
            if (!item.unlockId) return true; // Sem unlock necessário
            return this.unlockManager.isItemUnlocked(item.id);
        });
    }

    /**
     * Usar item (consumable) ou ativar (passive)
     * @returns true se usou/ativou com sucesso
     */
    useItem(itemId: string): boolean {
        const item = this.availableItems.find(i => i.id === itemId);
        
        if (!item) return false;

        if (item.type === ItemType.CONSUMABLE) {
            // Verificar se já foi usado
            if (this.usedItems.includes(itemId)) {
                return false; // Já foi usado
            }

            // Usar item
            this.usedItems.push(itemId);
            return true;

        } else if (item.type === ItemType.PASSIVE) {
            // Verificar se já está ativo
            if (this.activeItems.find(i => i.id === itemId)) {
                return false; // Já está ativo
            }

            // Ativar item
            this.activeItems.push(item);
            this.applyPassiveEffects(item);
            return true;
        }

        return false;
    }

    /**
     * Aplicar efeitos de item passivo
     */
    private applyPassiveEffects(item: Item): void {
        if (item.effect.damageMultiplier) {
            this.effects.damageMultiplier *= item.effect.damageMultiplier;
        }
        if (item.effect.speedMultiplier) {
            this.effects.speedMultiplier *= item.effect.speedMultiplier;
        }
        if (item.effect.hpMultiplier) {
            this.effects.hpMultiplier *= item.effect.hpMultiplier;
        }
    }

    /**
     * Obter HP restaurado por item consumable
     */
    getConsumableHpRestore(itemId: string): number {
        const item = this.availableItems.find(i => i.id === itemId);
        return item?.effect.hpRestore || 0;
    }

    /**
     * Obter multiplicador de dano (todos os items passivos)
     */
    getDamageMultiplier(): number {
        return this.effects.damageMultiplier;
    }

    /**
     * Obter multiplicador de velocidade
     */
    getSpeedMultiplier(): number {
        return this.effects.speedMultiplier;
    }

    /**
     * Obter multiplicador de HP
     */
    getHpMultiplier(): number {
        return this.effects.hpMultiplier;
    }

    /**
     * Obter items disponíveis
     */
    getAvailableItems(): Item[] {
        return [...this.availableItems];
    }

    /**
     * Obter items ativos (passive)
     */
    getActiveItems(): Item[] {
        return [...this.activeItems];
    }

    /**
     * Obter items usados (consumable)
     */
    getUsedItems(): string[] {
        return [...this.usedItems];
    }

    /**
     * Resetar efeitos
     */
    private resetEffects(): void {
        this.effects = {
            damageMultiplier: 1.0,
            speedMultiplier: 1.0,
            hpMultiplier: 1.0,
        };
    }

    /**
     * Resetar para nova partida
     */
    reset(): void {
        this.activeItems = [];
        this.usedItems = [];
        this.resetEffects();
        this.initializeItems();
    }
}
