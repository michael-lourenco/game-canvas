import type { IStorageService, GameSessionData, LeaderboardEntry, PlayerProgress } from '../storage';
import { createStorageService } from '../storage';

/**
 * Gerenciador de salvamento de dados do jogo
 * Usa IStorageService que pode ser facilmente substituído no futuro
 */
export class SaveManager {
    private storage: IStorageService;
    private currentSessionId: string | null = null;
    private startTime: number = 0;
    private gameState = {
        enemiesKilled: 0,
        projectilesFired: 0,
        timeElapsed: 0,
    };

    constructor(storage?: IStorageService) {
        // Se não passar storage, usa factory (cria LocalStorageService por padrão)
        this.storage = storage || createStorageService();
    }

    /**
     * Iniciar nova sessão de jogo
     */
    async startSession(): Promise<string> {
        const sessionId = this.generateSessionId();
        this.currentSessionId = sessionId;
        this.startTime = Date.now();
        this.gameState = {
            enemiesKilled: 0,
            projectilesFired: 0,
            timeElapsed: 0,
        };

        const sessionData: GameSessionData = {
            id: sessionId,
            score: 0,
            xp: 0,
            duration: 0,
            startedAt: new Date().toISOString(),
            finishedAt: null,
            gameState: { ...this.gameState },
        };

        await this.storage.saveSession(sessionId, sessionData);
        return sessionId;
    }

    /**
     * Atualizar sessão durante o jogo
     */
    async updateSession(score: number, xp: number): Promise<void> {
        if (!this.currentSessionId) return;

        const now = Date.now();
        const duration = Math.floor((now - this.startTime) / 1000); // em segundos
        const timeElapsed = duration;

        const sessionData: GameSessionData = {
            id: this.currentSessionId,
            score,
            xp,
            duration,
            startedAt: new Date(this.startTime).toISOString(),
            finishedAt: null,
            gameState: {
                ...this.gameState,
                timeElapsed,
            },
        };

        await this.storage.saveSession(this.currentSessionId, sessionData);
    }

    /**
     * Finalizar sessão e salvar no leaderboard
     */
    async endSession(finalScore: number, finalXp: number): Promise<void> {
        if (!this.currentSessionId) return;

        const now = Date.now();
        const duration = Math.floor((now - this.startTime) / 1000);

        const sessionData: GameSessionData = {
            id: this.currentSessionId,
            score: finalScore,
            xp: finalXp,
            duration,
            startedAt: new Date(this.startTime).toISOString(),
            finishedAt: new Date().toISOString(),
            gameState: {
                ...this.gameState,
                timeElapsed: duration,
            },
        };

        // Salvar sessão finalizada
        await this.storage.saveSession(this.currentSessionId, sessionData);

        // Salvar no leaderboard local
        const leaderboardEntry: LeaderboardEntry = {
            id: this.currentSessionId,
            score: finalScore,
            xp: finalXp,
            date: new Date().toISOString(),
            sessionId: this.currentSessionId,
        };

        await this.storage.saveLeaderboardEntry(leaderboardEntry);

        // Atualizar progresso do jogador
        await this.updateProgress(finalScore, finalXp);

        this.currentSessionId = null;
    }

    /**
     * Obter leaderboard local
     */
    async getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
        return this.storage.getLeaderboard(limit);
    }

    /**
     * Obter progresso do jogador
     */
    async getProgress(): Promise<PlayerProgress | null> {
        return this.storage.getProgress();
    }

    /**
     * Atualizar contadores do jogo
     */
    updateGameState(updates: Partial<typeof this.gameState>) {
        this.gameState = { ...this.gameState, ...updates };
    }

    /**
     * Atualizar progresso do jogador
     */
    private async updateProgress(finalScore: number, finalXp: number): Promise<void> {
        const currentProgress = await this.storage.getProgress();

        const newProgress: PlayerProgress = {
            totalScore: (currentProgress?.totalScore || 0) + finalScore,
            totalXp: (currentProgress?.totalXp || 0) + finalXp,
            totalGames: (currentProgress?.totalGames || 0) + 1,
            bestScore: Math.max(currentProgress?.bestScore || 0, finalScore),
            bestXp: Math.max(currentProgress?.bestXp || 0, finalXp),
            lastPlayed: new Date().toISOString(),
        };

        await this.storage.saveProgress(newProgress);
    }

    /**
     * Gerar ID único para sessão
     */
    private generateSessionId(): string {
        return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }

    /**
     * Limpar todos os dados (útil para testes)
     */
    async clearAllData(): Promise<void> {
        await this.storage.clearLeaderboard();
        // TODO: adicionar método para limpar sessões e progresso se necessário
    }
}
