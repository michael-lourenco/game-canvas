import { UnlockManager } from './UnlockManager';
import { ItemManager } from './ItemManager';
import { UpgradeCardSystem } from '../systems/UpgradeCardSystem';
import { ProjectileConfig } from '../data/projectiles';

/**
 * Gerencia modificadores aplicados durante a partida
 * Combina unlocks permanentes, items e cartas de upgrade
 */
export class RunModifiers {
    private unlockManager: UnlockManager;
    private itemManager: ItemManager;
    private upgradeCardSystem: UpgradeCardSystem;

    // Modificadores acumulados
    private modifiers: {
        damageMultiplier: number;      // Multiplicador de dano total
        damageFlat: number;            // Dano adicional fixo
        speedMultiplier: number;       // Multiplicador de velocidade
        cooldownMultiplier: number;    // Multiplicador de cooldown (< 1 = mais rápido)
        pierceBonus: number;            // Bônus de pierce
        hpBonus: number;                // Bônus de HP inicial
    } = {
        damageMultiplier: 1.0,
        damageFlat: 0,
        speedMultiplier: 1.0,
        cooldownMultiplier: 1.0,
        pierceBonus: 0,
        hpBonus: 0,
    };

    constructor(
        unlockManager: UnlockManager,
        itemManager: ItemManager,
        upgradeCardSystem: UpgradeCardSystem
    ) {
        this.unlockManager = unlockManager;
        this.itemManager = itemManager;
        this.upgradeCardSystem = upgradeCardSystem;
    }

    /**
     * Calcular e aplicar todos os modificadores no início da partida
     */
    calculateModifiers(): void {
        // Resetar
        this.modifiers = {
            damageMultiplier: 1.0,
            damageFlat: 0,
            speedMultiplier: 1.0,
            cooldownMultiplier: 1.0,
            pierceBonus: 0,
            hpBonus: 0,
        };

        // 1. Aplicar base stats desbloqueados (unlocks permanentes)
        const baseStats = this.unlockManager.getBaseStats();
        this.modifiers.damageFlat += baseStats.damage - 1; // -1 porque base é 1
        this.modifiers.hpBonus += baseStats.hp - 100; // -100 porque base é 100

        // 2. Aplicar items passivos desbloqueados
        const activeItems = this.itemManager.getActiveItems();
        activeItems.forEach(item => {
            if (item.effect.damageMultiplier) {
                this.modifiers.damageMultiplier *= item.effect.damageMultiplier;
            }
            if (item.effect.speedMultiplier) {
                this.modifiers.speedMultiplier *= item.effect.speedMultiplier;
            }
            if (item.effect.hpMultiplier) {
                this.modifiers.hpBonus += (100 * (item.effect.hpMultiplier - 1)); // Converter multiplicador em flat
            }
        });

        // 3. Aplicar cartas de upgrade escolhidas
        const activeEffects = this.upgradeCardSystem.getActiveEffects();
        activeEffects.forEach((value, statName) => {
            switch (statName) {
                case 'damage':
                    this.modifiers.damageMultiplier *= value;
                    break;
                case 'projectileSpeed':
                    this.modifiers.speedMultiplier *= value;
                    break;
                case 'cooldown':
                    this.modifiers.cooldownMultiplier *= value;
                    break;
                case 'pierce':
                    // Se pierce for muito alto (999), aplicar como bônus infinito
                    if (value >= 999) {
                        this.modifiers.pierceBonus = 9999; // Pierce "infinito"
                    } else {
                        this.modifiers.pierceBonus += value;
                    }
                    break;
            }
        });

        // 4. Aplicar multiplicador de items (se houver)
        this.modifiers.damageMultiplier *= this.itemManager.getDamageMultiplier();
        this.modifiers.speedMultiplier *= this.itemManager.getSpeedMultiplier();
    }

    /**
     * Aplicar modificadores a uma configuração de projétil
     * Retorna uma cópia modificada
     */
    applyToProjectileConfig(config: ProjectileConfig): ProjectileConfig {
        const modified = { ...config };

        // Aplicar dano (multiplicador + flat)
        modified.attack = Math.floor(
            (config.attack + this.modifiers.damageFlat) * this.modifiers.damageMultiplier
        );

        // Aplicar velocidade
        modified.velocity_factor = config.velocity_factor * this.modifiers.speedMultiplier;

        // Aplicar cooldown (multiplicador < 1 = mais rápido)
        modified.cooldown = Math.max(0.1, config.cooldown * this.modifiers.cooldownMultiplier);

        // Aplicar pierce
        if (this.modifiers.pierceBonus >= 9999) {
            modified.pierce = 9999; // Pierce "infinito"
        } else {
            modified.pierce = config.pierce + this.modifiers.pierceBonus;
        }

        return modified;
    }

    /**
     * Obter HP inicial modificado
     */
    getModifiedHp(baseHp: number): number {
        return Math.floor(baseHp + this.modifiers.hpBonus);
    }

    /**
     * Obter modificadores atuais (para debug)
     */
    getModifiers() {
        return { ...this.modifiers };
    }

    /**
     * Resetar modificadores
     */
    reset(): void {
        this.modifiers = {
            damageMultiplier: 1.0,
            damageFlat: 0,
            speedMultiplier: 1.0,
            cooldownMultiplier: 1.0,
            pierceBonus: 0,
            hpBonus: 0,
        };
    }
}
