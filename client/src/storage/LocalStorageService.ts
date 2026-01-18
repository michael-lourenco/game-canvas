import type {
    IStorageService,
    GameSessionData,
    LeaderboardEntry,
    PlayerProgress,
    GameSettings
} from './IStorageService';

const STORAGE_KEYS = {
    SESSIONS: 'game_sessions',
    LEADERBOARD: 'game_leaderboard',
    PROGRESS: 'game_progress',
    SETTINGS: 'game_settings',
} as const;

export class LocalStorageService implements IStorageService {
    private getItem<T>(key: string): T | null {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error(`Error reading from localStorage key "${key}":`, error);
            return null;
        }
    }

    private setItem<T>(key: string, value: T): void {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(`Error writing to localStorage key "${key}":`, error);
            // Se exceder quota, tenta limpar sessões antigas
            if (error instanceof DOMException && error.name === 'QuotaExceededError') {
                this.cleanupOldSessions();
                try {
                    localStorage.setItem(key, JSON.stringify(value));
                } catch (retryError) {
                    console.error('Failed to save after cleanup:', retryError);
                }
            }
        }
    }

    private cleanupOldSessions(keepLast: number = 50): void {
        const sessions = this.getAllSessionsSync();
        if (sessions.length <= keepLast) return;

        // Ordenar por data (mais recentes primeiro)
        sessions.sort((a, b) => {
            const dateA = new Date(b.startedAt).getTime();
            const dateB = new Date(a.startedAt).getTime();
            return dateA - dateB;
        });

        // Manter apenas os mais recentes
        const toKeep = sessions.slice(0, keepLast);
        const sessionsMap: Record<string, GameSessionData> = {};
        toKeep.forEach(session => {
            sessionsMap[session.id] = session;
        });

        this.setItem(STORAGE_KEYS.SESSIONS, sessionsMap);
    }

    private getAllSessionsSync(): GameSessionData[] {
        const sessionsMap = this.getItem<Record<string, GameSessionData>>(STORAGE_KEYS.SESSIONS);
        return sessionsMap ? Object.values(sessionsMap) : [];
    }

    // ============ SESSÕES ============
    async saveSession(sessionId: string, data: GameSessionData): Promise<void> {
        const sessionsMap = this.getItem<Record<string, GameSessionData>>(STORAGE_KEYS.SESSIONS) || {};
        sessionsMap[sessionId] = data;
        this.setItem(STORAGE_KEYS.SESSIONS, sessionsMap);
    }

    async getSession(sessionId: string): Promise<GameSessionData | null> {
        const sessionsMap = this.getItem<Record<string, GameSessionData>>(STORAGE_KEYS.SESSIONS);
        return sessionsMap?.[sessionId] || null;
    }

    async getAllSessions(): Promise<GameSessionData[]> {
        return this.getAllSessionsSync();
    }

    async deleteSession(sessionId: string): Promise<void> {
        const sessionsMap = this.getItem<Record<string, GameSessionData>>(STORAGE_KEYS.SESSIONS);
        if (sessionsMap && sessionsMap[sessionId]) {
            delete sessionsMap[sessionId];
            this.setItem(STORAGE_KEYS.SESSIONS, sessionsMap);
        }
    }

    // ============ LEADERBOARD ============
    async saveLeaderboardEntry(entry: LeaderboardEntry): Promise<void> {
        const leaderboard = this.getItem<LeaderboardEntry[]>(STORAGE_KEYS.LEADERBOARD) || [];
        
        // Adicionar entrada
        leaderboard.push(entry);
        
        // Ordenar por score (maior primeiro)
        leaderboard.sort((a, b) => b.score - a.score);
        
        // Manter apenas top 100
        const topEntries = leaderboard.slice(0, 100);
        
        this.setItem(STORAGE_KEYS.LEADERBOARD, topEntries);
    }

    async getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
        const leaderboard = this.getItem<LeaderboardEntry[]>(STORAGE_KEYS.LEADERBOARD) || [];
        return leaderboard.slice(0, limit);
    }

    async clearLeaderboard(): Promise<void> {
        localStorage.removeItem(STORAGE_KEYS.LEADERBOARD);
    }

    // ============ PROGRESSO ============
    async saveProgress(progress: PlayerProgress): Promise<void> {
        this.setItem(STORAGE_KEYS.PROGRESS, progress);
    }

    async getProgress(): Promise<PlayerProgress | null> {
        return this.getItem<PlayerProgress>(STORAGE_KEYS.PROGRESS);
    }

    // ============ CONFIGURAÇÕES ============
    async saveSettings(settings: GameSettings): Promise<void> {
        this.setItem(STORAGE_KEYS.SETTINGS, settings);
    }

    async getSettings(): Promise<GameSettings | null> {
        return this.getItem<GameSettings>(STORAGE_KEYS.SETTINGS) || {
            volume: 1.0,
            difficulty: 'normal',
        };
    }
}
