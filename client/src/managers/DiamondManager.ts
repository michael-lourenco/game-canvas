import { createStorageService, type IStorageService } from '../storage';
import type { Achievement } from '../data/achievements';

const STORAGE_KEY_DIAMONDS = 'meta_diamonds';
const STORAGE_KEY_ACHIEVEMENTS = 'meta_achievements';

/**
 * Gerencia diamonds e conquistas (meta progressão)
 */
export class DiamondManager {
    private storage: IStorageService;
    private diamonds: number = 0;
    private unlockedAchievements: Set<string> = new Set();

    constructor(storage?: IStorageService) {
        this.storage = storage || createStorageService();
        this.load();
    }

    /**
     * Adicionar diamonds
     */
    addDiamonds(amount: number): void {
        if (amount < 0) return;
        this.diamonds += amount;
        this.save();
    }

    /**
     * Gastar diamonds
     * @returns true se conseguiu gastar, false se não tem o suficiente
     */
    spendDiamonds(amount: number): boolean {
        if (amount < 0) return false;
        if (this.diamonds < amount) return false;
        
        this.diamonds -= amount;
        this.save();
        return true;
    }

    /**
     * Obter total de diamonds
     */
    getTotal(): number {
        return this.diamonds;
    }

    /**
     * Verificar se tem diamonds suficientes
     */
    canAfford(cost: number): boolean {
        return this.diamonds >= cost;
    }

    /**
     * Processar conquistas e adicionar diamonds
     */
    processAchievements(
        achievements: Achievement[],
        stats: {
            enemiesKilled: number;
            survivalTime: number;
            levelReached: number;
            scoreReached: number;
            bossKilled?: boolean;
        }
    ): { unlocked: Achievement[]; diamondsGained: number } {
        const newlyUnlocked: Achievement[] = [];
        let diamondsGained = 0;

        for (const achievement of achievements) {
            // Se já foi desbloqueado, pular
            if (this.unlockedAchievements.has(achievement.id)) continue;

            // Verificar se o requisito foi cumprido
            let requirementMet = false;

            switch (achievement.type) {
                case 'kill_count':
                    requirementMet = stats.enemiesKilled >= achievement.requirement;
                    break;
                case 'survival_time':
                    requirementMet = stats.survivalTime >= achievement.requirement;
                    break;
                case 'level_reached':
                    requirementMet = stats.levelReached >= achievement.requirement;
                    break;
                case 'score_reached':
                    requirementMet = stats.scoreReached >= achievement.requirement;
                    break;
                case 'boss_kill':
                    requirementMet = stats.bossKilled === true;
                    break;
            }

            if (requirementMet) {
                // Desbloquear conquista
                this.unlockedAchievements.add(achievement.id);
                this.addDiamonds(achievement.reward);
                newlyUnlocked.push(achievement);
                diamondsGained += achievement.reward;
            }
        }

        if (newlyUnlocked.length > 0) {
            this.save();
        }

        return { unlocked: newlyUnlocked, diamondsGained };
    }

    /**
     * Verificar se conquista está desbloqueada
     */
    isAchievementUnlocked(achievementId: string): boolean {
        return this.unlockedAchievements.has(achievementId);
    }

    /**
     * Obter lista de conquistas desbloqueadas
     */
    getUnlockedAchievements(): string[] {
        return Array.from(this.unlockedAchievements);
    }

    /**
     * Salvar no storage
     */
    private async save(): Promise<void> {
        // Usar localStorage diretamente por enquanto
        // (futuramente pode usar SaveManager se necessário)
        try {
            localStorage.setItem(STORAGE_KEY_DIAMONDS, this.diamonds.toString());
            localStorage.setItem(STORAGE_KEY_ACHIEVEMENTS, JSON.stringify(Array.from(this.unlockedAchievements)));
        } catch (error) {
            console.error('Error saving diamonds:', error);
        }
    }

    /**
     * Carregar do storage
     */
    private async load(): Promise<void> {
        try {
            const diamondsStr = localStorage.getItem(STORAGE_KEY_DIAMONDS);
            if (diamondsStr) {
                this.diamonds = parseInt(diamondsStr, 10) || 0;
            }

            const achievementsStr = localStorage.getItem(STORAGE_KEY_ACHIEVEMENTS);
            if (achievementsStr) {
                const unlocked = JSON.parse(achievementsStr) as string[];
                this.unlockedAchievements = new Set(unlocked);
            }
        } catch (error) {
            console.error('Error loading diamonds:', error);
        }
    }

    /**
     * Resetar tudo (útil para testes)
     */
    reset(): void {
        this.diamonds = 0;
        this.unlockedAchievements.clear();
        this.save();
    }
}
