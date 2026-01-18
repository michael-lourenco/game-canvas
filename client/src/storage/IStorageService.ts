// Interface para serviços de armazenamento
// Permite trocar facilmente entre localStorage, IndexedDB, ou API no futuro

export interface IStorageService {
    // Sessões de jogo
    saveSession(sessionId: string, data: GameSessionData): Promise<void>;
    getSession(sessionId: string): Promise<GameSessionData | null>;
    getAllSessions(): Promise<GameSessionData[]>;
    deleteSession(sessionId: string): Promise<void>;
    
    // Leaderboard local
    saveLeaderboardEntry(entry: LeaderboardEntry): Promise<void>;
    getLeaderboard(limit?: number): Promise<LeaderboardEntry[]>;
    clearLeaderboard(): Promise<void>;
    
    // Progresso do jogador
    saveProgress(progress: PlayerProgress): Promise<void>;
    getProgress(): Promise<PlayerProgress | null>;
    
    // Configurações
    saveSettings(settings: GameSettings): Promise<void>;
    getSettings(): Promise<GameSettings | null>;
}

export interface GameSessionData {
    id: string;
    score: number;
    xp: number;
    duration: number;
    startedAt: string;
    finishedAt: string | null;
    gameState: {
        enemiesKilled: number;
        projectilesFired: number;
        timeElapsed: number;
    };
}

export interface LeaderboardEntry {
    id: string;
    score: number;
    xp: number;
    date: string;
    sessionId: string;
}

export interface PlayerProgress {
    totalScore: number;
    totalXp: number;
    totalGames: number;
    bestScore: number;
    bestXp: number;
    lastPlayed: string;
}

export interface GameSettings {
    volume: number;
    difficulty: string;
    [key: string]: any;
}
