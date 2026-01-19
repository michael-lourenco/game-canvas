import { Unlock, UnlockType } from '../data/unlocks';
import { DiamondManager } from './DiamondManager';

/**
 * Gerencia unlocks (meta progressão)
 */
export class UnlockManager {
    private unlockedSkills: Set<number> = new Set([0, 1, 2]); // Gun, Rifle, Shotgun desbloqueados inicialmente
    private unlockedItems: Set<string> = new Set();
    private unlockedStages: Set<number> = new Set([1]); // Estágio 1 desbloqueado inicialmente
    private unlockedDifficulties: Set<string> = new Set(['normal']); // Normal desbloqueado inicialmente
    private unlockedFeatures: Set<string> = new Set();
    private baseStats: {
        hp: number;
        damage: number;
        speed: number;
    } = {
        hp: 100,
        damage: 1,
        speed: 1,
    };

    private diamondManager: DiamondManager;

    constructor(diamondManager: DiamondManager) {
        this.diamondManager = diamondManager;
        this.load();
    }

    /**
     * Desbloquear algo usando diamonds
     * @returns true se desbloqueou com sucesso, false caso contrário
     */
    unlock(unlock: Unlock): boolean {
        // Verificar se já está desbloqueado
        if (this.isUnlocked(unlock)) {
            return false;
        }

        // Verificar se tem diamonds suficientes
        if (!this.diamondManager.canAfford(unlock.cost)) {
            return false;
        }

        // Gastar diamonds
        if (!this.diamondManager.spendDiamonds(unlock.cost)) {
            return false;
        }

        // Aplicar unlock baseado no tipo
        switch (unlock.type) {
            case UnlockType.SKILL:
                if (unlock.data.skillId !== undefined) {
                    this.unlockedSkills.add(unlock.data.skillId);
                }
                break;

            case UnlockType.ITEM:
                if (unlock.data.itemId) {
                    this.unlockedItems.add(unlock.data.itemId);
                }
                break;

            case UnlockType.BASE_STAT:
                if (unlock.data.statName && unlock.data.statValue !== undefined) {
                    this.applyBaseStat(unlock.data.statName, unlock.data.statValue);
                }
                break;

            case UnlockType.FEATURE:
                if (unlock.data.featureId) {
                    this.unlockedFeatures.add(unlock.data.featureId);
                }
                break;

            case UnlockType.STAGE:
                if (unlock.data.stageId !== undefined) {
                    this.unlockedStages.add(unlock.data.stageId);
                }
                break;

            case UnlockType.DIFFICULTY:
                if (unlock.data.difficultyId) {
                    this.unlockedDifficulties.add(unlock.data.difficultyId);
                }
                break;
        }

        this.save();
        return true;
    }

    /**
     * Verificar se algo está desbloqueado
     */
    isUnlocked(unlock: Unlock): boolean {
        switch (unlock.type) {
            case UnlockType.SKILL:
                return unlock.data.skillId !== undefined && this.unlockedSkills.has(unlock.data.skillId);
            case UnlockType.ITEM:
                return unlock.data.itemId ? this.unlockedItems.has(unlock.data.itemId) : false;
            case UnlockType.FEATURE:
                return unlock.data.featureId ? this.unlockedFeatures.has(unlock.data.featureId) : false;
            case UnlockType.STAGE:
                return unlock.data.stageId !== undefined && this.unlockedStages.has(unlock.data.stageId);
            case UnlockType.DIFFICULTY:
                return unlock.data.difficultyId ? this.unlockedDifficulties.has(unlock.data.difficultyId) : false;
            case UnlockType.BASE_STAT:
                // Base stats não são "unlocks" binários, são incrementais
                return false;
            default:
                return false;
        }
    }

    /**
     * Verificar se skill está desbloqueada
     */
    isSkillUnlocked(skillId: number): boolean {
        return this.unlockedSkills.has(skillId);
    }

    /**
     * Verificar se item está desbloqueado
     */
    isItemUnlocked(itemId: string): boolean {
        return this.unlockedItems.has(itemId);
    }

    /**
     * Verificar se estágio está desbloqueado
     */
    isStageUnlocked(stageId: number): boolean {
        return this.unlockedStages.has(stageId);
    }

    /**
     * Verificar se dificuldade está desbloqueada
     */
    isDifficultyUnlocked(difficultyId: string): boolean {
        return this.unlockedDifficulties.has(difficultyId);
    }

    /**
     * Verificar se feature está desbloqueada
     */
    isFeatureUnlocked(featureId: string): boolean {
        return this.unlockedFeatures.has(featureId);
    }

    /**
     * Obter status base
     */
    getBaseStats() {
        return { ...this.baseStats };
    }

    /**
     * Aplicar melhoria de status base
     */
    private applyBaseStat(statName: string, value: number): void {
        switch (statName) {
            case 'hp':
                this.baseStats.hp += value;
                break;
            case 'damage':
                this.baseStats.damage += value;
                break;
            case 'speed':
                this.baseStats.speed += value;
                break;
        }
    }

    /**
     * Obter lista de unlocks disponíveis
     */
    getAvailableUnlocks(): Unlock[] {
        // Retornar todos os unlocks que não estão desbloqueados
        // Esta função será usada pela UI
        return [];
    }

    /**
     * Salvar progresso
     */
    private save(): void {
        try {
            localStorage.setItem('unlocked_skills', JSON.stringify(Array.from(this.unlockedSkills)));
            localStorage.setItem('unlocked_items', JSON.stringify(Array.from(this.unlockedItems)));
            localStorage.setItem('unlocked_stages', JSON.stringify(Array.from(this.unlockedStages)));
            localStorage.setItem('unlocked_difficulties', JSON.stringify(Array.from(this.unlockedDifficulties)));
            localStorage.setItem('unlocked_features', JSON.stringify(Array.from(this.unlockedFeatures)));
            localStorage.setItem('base_stats', JSON.stringify(this.baseStats));
        } catch (error) {
            console.error('Error saving unlocks:', error);
        }
    }

    /**
     * Carregar progresso
     */
    private load(): void {
        try {
            const skillsStr = localStorage.getItem('unlocked_skills');
            if (skillsStr) {
                this.unlockedSkills = new Set(JSON.parse(skillsStr));
            }

            const itemsStr = localStorage.getItem('unlocked_items');
            if (itemsStr) {
                this.unlockedItems = new Set(JSON.parse(itemsStr));
            }

            const stagesStr = localStorage.getItem('unlocked_stages');
            if (stagesStr) {
                this.unlockedStages = new Set(JSON.parse(stagesStr));
            }

            const difficultiesStr = localStorage.getItem('unlocked_difficulties');
            if (difficultiesStr) {
                this.unlockedDifficulties = new Set(JSON.parse(difficultiesStr));
            }

            const featuresStr = localStorage.getItem('unlocked_features');
            if (featuresStr) {
                this.unlockedFeatures = new Set(JSON.parse(featuresStr));
            }

            const statsStr = localStorage.getItem('base_stats');
            if (statsStr) {
                this.baseStats = { ...this.baseStats, ...JSON.parse(statsStr) };
            }
        } catch (error) {
            console.error('Error loading unlocks:', error);
        }
    }
}
