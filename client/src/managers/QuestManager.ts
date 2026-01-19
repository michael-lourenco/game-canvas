import { Quest, QuestType, dailyQuests, permanentQuests } from '../data/quests';
import { DiamondManager } from './DiamondManager';

const STORAGE_KEY_DAILY_QUESTS = 'quests_daily';
const STORAGE_KEY_PERMANENT_QUESTS = 'quests_permanent';
const STORAGE_KEY_LAST_DAILY_RESET = 'quests_last_daily_reset';

/**
 * Gerencia quests/missões do jogo
 */
export class QuestManager {
    private dailyQuests: Quest[] = [];
    private permanentQuests: Quest[] = [];
    private diamondManager: DiamondManager;
    private lastDailyReset: number = 0;

    constructor(diamondManager: DiamondManager) {
        this.diamondManager = diamondManager;
        this.load();
        this.checkDailyReset();
    }

    /**
     * Verificar e resetar quests diárias se necessário
     */
    private checkDailyReset(): void {
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000; // 24 horas em ms
        
        // Se nunca resetou ou passou 24 horas
        if (this.lastDailyReset === 0 || (now - this.lastDailyReset) >= oneDay) {
            this.resetDailyQuests();
            this.lastDailyReset = now;
            this.save();
        }
    }

    /**
     * Resetar quests diárias
     */
    private resetDailyQuests(): void {
        this.dailyQuests = dailyQuests.map(quest => ({
            ...quest,
            progress: 0,
            completed: false,
            completedAt: undefined,
        }));
    }

    /**
     * Atualizar progresso de quests baseado em evento
     */
    updateProgress(
        type: QuestType,
        value: number,
        runStats?: {
            enemiesKilled: number;
            survivalTime: number;
            levelReached: number;
            scoreReached: number;
            pointsCollected: number;
        }
    ): { completed: Quest[]; diamondsGained: number } {
        const completed: Quest[] = [];
        let diamondsGained = 0;

        // Atualizar quests diárias
        for (const quest of this.dailyQuests) {
            if (quest.completed && !quest.repeatable) continue;

            const updated = this.updateQuestProgress(quest, type, value, runStats);
            if (updated && quest.completed) {
                completed.push(quest);
                diamondsGained += quest.reward;
                this.diamondManager.addDiamonds(quest.reward);
                
                // Se repeatable, resetar progresso
                if (quest.repeatable) {
                    quest.progress = 0;
                    quest.completed = false;
                }
            }
        }

        // Atualizar quests permanentes
        for (const quest of this.permanentQuests) {
            if (quest.completed) continue;

            const updated = this.updateQuestProgress(quest, type, value, runStats);
            if (updated && quest.completed) {
                completed.push(quest);
                diamondsGained += quest.reward;
                this.diamondManager.addDiamonds(quest.reward);
            }
        }

        if (completed.length > 0) {
            this.save();
        }

        return { completed, diamondsGained };
    }

    /**
     * Atualizar progresso de uma quest específica
     */
    private updateQuestProgress(
        quest: Quest,
        type: QuestType,
        value: number,
        runStats?: any
    ): boolean {
        if (quest.type !== type) return false;
        if (quest.completed && !quest.repeatable) return false;

        let newProgress = quest.progress;

        switch (quest.type) {
            case QuestType.KILL_ENEMIES:
                // Para diárias: valor da run atual
                // Para permanentes: acumulado total
                if (quest.repeatable) {
                    // Diária: usar valor da run
                    newProgress = Math.min(quest.progress + value, quest.requirement);
                } else {
                    // Permanente: acumular
                    newProgress = Math.min(quest.progress + value, quest.requirement);
                }
                break;

            case QuestType.SURVIVE_TIME:
                if (runStats?.survivalTime) {
                    newProgress = Math.max(quest.progress, Math.min(runStats.survivalTime, quest.requirement));
                }
                break;

            case QuestType.REACH_LEVEL:
                if (runStats?.levelReached) {
                    newProgress = Math.max(quest.progress, Math.min(runStats.levelReached, quest.requirement));
                }
                break;

            case QuestType.REACH_SCORE:
                if (runStats?.scoreReached) {
                    newProgress = Math.max(quest.progress, Math.min(runStats.scoreReached, quest.requirement));
                }
                break;

            case QuestType.COLLECT_POINTS:
                if (runStats?.pointsCollected) {
                    newProgress = Math.max(quest.progress, Math.min(runStats.pointsCollected, quest.requirement));
                }
                break;

            case QuestType.KILL_BOSS:
                // TODO: Implementar quando tiver bosses
                break;

            case QuestType.USE_SKILL:
                newProgress = Math.min(quest.progress + value, quest.requirement);
                break;

            case QuestType.COMPLETE_STAGE:
                // TODO: Implementar quando tiver stages
                break;

            case QuestType.CHAIN_KILLS:
                // TODO: Implementar tracking de chain kills
                break;

            case QuestType.PERFECT_RUN:
                // TODO: Implementar tracking de perfect run
                break;
        }

        const wasCompleted = quest.completed;
        quest.progress = newProgress;
        quest.completed = quest.progress >= quest.requirement;

        if (quest.completed && !wasCompleted) {
            quest.completedAt = Date.now();
        }

        return quest.completed !== wasCompleted;
    }

    /**
     * Obter quests diárias
     */
    getDailyQuests(): Quest[] {
        return [...this.dailyQuests];
    }

    /**
     * Obter quests permanentes
     */
    getPermanentQuests(): Quest[] {
        return [...this.permanentQuests];
    }

    /**
     * Obter todas as quests (diárias + permanentes)
     */
    getAllQuests(): { daily: Quest[]; permanent: Quest[] } {
        return {
            daily: this.getDailyQuests(),
            permanent: this.getPermanentQuests(),
        };
    }

    /**
     * Obter quests não completadas
     */
    getIncompleteQuests(): { daily: Quest[]; permanent: Quest[] } {
        return {
            daily: this.dailyQuests.filter(q => !q.completed),
            permanent: this.permanentQuests.filter(q => !q.completed),
        };
    }

    /**
     * Salvar progresso
     */
    private save(): void {
        try {
            localStorage.setItem(STORAGE_KEY_DAILY_QUESTS, JSON.stringify(this.dailyQuests));
            localStorage.setItem(STORAGE_KEY_PERMANENT_QUESTS, JSON.stringify(this.permanentQuests));
            localStorage.setItem(STORAGE_KEY_LAST_DAILY_RESET, this.lastDailyReset.toString());
        } catch (error) {
            console.error('Error saving quests:', error);
        }
    }

    /**
     * Carregar progresso
     */
    private load(): void {
        try {
            // Carregar quests diárias
            const dailyStr = localStorage.getItem(STORAGE_KEY_DAILY_QUESTS);
            if (dailyStr) {
                const saved = JSON.parse(dailyStr) as Quest[];
                // Mesclar com quests padrão (caso adicione novas)
                this.dailyQuests = dailyQuests.map(defaultQuest => {
                    const savedQuest = saved.find(s => s.id === defaultQuest.id);
                    return savedQuest ? { ...defaultQuest, ...savedQuest } : defaultQuest;
                });
            } else {
                this.dailyQuests = dailyQuests.map(q => ({ ...q }));
            }

            // Carregar quests permanentes
            const permanentStr = localStorage.getItem(STORAGE_KEY_PERMANENT_QUESTS);
            if (permanentStr) {
                const saved = JSON.parse(permanentStr) as Quest[];
                this.permanentQuests = permanentQuests.map(defaultQuest => {
                    const savedQuest = saved.find(s => s.id === defaultQuest.id);
                    return savedQuest ? { ...defaultQuest, ...savedQuest } : defaultQuest;
                });
            } else {
                this.permanentQuests = permanentQuests.map(q => ({ ...q }));
            }

            // Carregar último reset
            const resetStr = localStorage.getItem(STORAGE_KEY_LAST_DAILY_RESET);
            if (resetStr) {
                this.lastDailyReset = parseInt(resetStr, 10);
            }
        } catch (error) {
            console.error('Error loading quests:', error);
            // Fallback: usar quests padrão
            this.dailyQuests = dailyQuests.map(q => ({ ...q }));
            this.permanentQuests = permanentQuests.map(q => ({ ...q }));
        }
    }

    /**
     * Resetar tudo (útil para testes)
     */
    reset(): void {
        this.dailyQuests = dailyQuests.map(q => ({ ...q }));
        this.permanentQuests = permanentQuests.map(q => ({ ...q }));
        this.lastDailyReset = 0;
        this.save();
    }
}
