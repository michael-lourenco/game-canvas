// Implementação futura: Storage via API
// Este arquivo existe apenas como placeholder para migração futura
// Quando implementar servidor, apenas substitua LocalStorageService por ApiStorageService

import type {
    IStorageService,
    GameSessionData,
    LeaderboardEntry,
    PlayerProgress,
    GameSettings
} from './IStorageService';
import { ApiClient } from '../api/ApiClient';

/**
 * FUTURA IMPLEMENTAÇÃO: Storage via API
 * 
 * Para usar no futuro:
 * 1. Implementar métodos aqui usando ApiClient
 * 2. No código, trocar: new LocalStorageService() por new ApiStorageService(apiClient)
 * 
 * Exemplo:
 * ```typescript
 * const apiClient = new ApiClient('http://api.example.com');
 * const storage = new ApiStorageService(apiClient);
 * ```
 */
export class ApiStorageService implements IStorageService {
    private apiClient: ApiClient;

    constructor(apiClient: ApiClient) {
        this.apiClient = apiClient;
    }

    async saveSession(sessionId: string, data: GameSessionData): Promise<void> {
        // TODO: Implementar quando migrar para servidor
        // await this.apiClient.updateSession(sessionId, { ... });
        throw new Error('Not implemented - will be implemented when migrating to server');
    }

    async getSession(sessionId: string): Promise<GameSessionData | null> {
        // TODO: Implementar quando migrar para servidor
        throw new Error('Not implemented');
    }

    async getAllSessions(): Promise<GameSessionData[]> {
        // TODO: Implementar quando migrar para servidor
        throw new Error('Not implemented');
    }

    async deleteSession(sessionId: string): Promise<void> {
        // TODO: Implementar quando migrar para servidor
        throw new Error('Not implemented');
    }

    async saveLeaderboardEntry(entry: LeaderboardEntry): Promise<void> {
        // TODO: Implementar quando migrar para servidor
        throw new Error('Not implemented');
    }

    async getLeaderboard(limit?: number): Promise<LeaderboardEntry[]> {
        // TODO: Implementar quando migrar para servidor
        // const response = await this.apiClient.getLeaderboard(limit);
        // return response.entries.map(...);
        throw new Error('Not implemented');
    }

    async clearLeaderboard(): Promise<void> {
        // TODO: Implementar quando migrar para servidor
        throw new Error('Not implemented');
    }

    async saveProgress(progress: PlayerProgress): Promise<void> {
        // TODO: Implementar quando migrar para servidor
        throw new Error('Not implemented');
    }

    async getProgress(): Promise<PlayerProgress | null> {
        // TODO: Implementar quando migrar para servidor
        throw new Error('Not implemented');
    }

    async saveSettings(settings: GameSettings): Promise<void> {
        // TODO: Implementar quando migrar para servidor
        throw new Error('Not implemented');
    }

    async getSettings(): Promise<GameSettings | null> {
        // TODO: Implementar quando migrar para servidor
        throw new Error('Not implemented');
    }
}
