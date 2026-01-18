// shared/types/api.ts

// ============ AUTENTICAÇÃO ============
export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    refreshToken: string;
    user: {
        id: string;
        username: string;
        email: string;
    };
}

// ============ SESSÕES ============
export interface SessionResponse {
    id: string;
    userId: string;
    score: number;
    xp: number;
    startedAt: string;
    isActive: boolean;
}

export interface UpdateSessionRequest {
    score?: number;
    xp?: number;
    gameState?: {
        enemiesKilled: number;
        projectilesFired: number;
        timeElapsed: number;
    };
}

export interface EndSessionRequest {
    finalScore: number;
    finalXp: number;
    duration: number; // em segundos
    gameState: {
        enemiesKilled: number;
        projectilesFired: number;
        timeElapsed: number;
    };
}

// ============ LEADERBOARD ============
export interface LeaderboardEntry {
    rank: number;
    username: string;
    score: number;
    xp: number;
    achievedAt: string;
}

export interface LeaderboardResponse {
    entries: LeaderboardEntry[];
    total: number;
    currentUser?: LeaderboardEntry;
}
