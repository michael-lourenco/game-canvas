// Exportar interface e implementações de storage
// Facilita migração futura: apenas trocar qual implementação usar

import { LocalStorageService } from './LocalStorageService';
import { ApiStorageService } from './ApiStorageService';
import type { IStorageService } from './IStorageService';

export type {
    IStorageService,
    GameSessionData,
    LeaderboardEntry,
    PlayerProgress,
    GameSettings
} from './IStorageService';

export { LocalStorageService } from './LocalStorageService';
export { ApiStorageService } from './ApiStorageService';

// Factory para criar instância de storage
// No futuro, pode usar feature flags ou env vars para escolher
export function createStorageService(): IStorageService {
    // Por enquanto, sempre usa localStorage
    return new LocalStorageService();
    
    // NO FUTURO, quando tiver servidor:
    // const useServer = import.meta.env.VITE_USE_SERVER === 'true';
    // if (useServer) {
    //     const apiClient = new ApiClient(import.meta.env.VITE_API_URL);
    //     return new ApiStorageService(apiClient);
    // }
    // return new LocalStorageService();
}
