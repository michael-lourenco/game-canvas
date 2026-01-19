import { ITargetingStrategy } from './ITargetingStrategy';
import { NearestTargetStrategy } from './NearestTargetStrategy';
import { FarthestTargetStrategy } from './FarthestTargetStrategy';
import { HighestHpTargetStrategy } from './HighestHpTargetStrategy';
import { LowestHpTargetStrategy } from './LowestHpTargetStrategy';
import { FocusType } from '../data/projectiles';

/**
 * Factory para criar estratégias de targeting
 * Facilita adicionar novos tipos de focus no futuro
 */
export function createTargetingStrategy(focusType: FocusType): ITargetingStrategy {
    switch (focusType) {
        case FocusType.NEAREST:
            return new NearestTargetStrategy();
        case FocusType.FARTHEST:
            return new FarthestTargetStrategy();
        case FocusType.HIGHEST_HP:
            return new HighestHpTargetStrategy();
        case FocusType.LOWEST_HP:
            return new LowestHpTargetStrategy();
        default:
            // Fallback para nearest se tipo não reconhecido
            return new NearestTargetStrategy();
    }
}

export type {
    ITargetingStrategy
} from './ITargetingStrategy';

export { NearestTargetStrategy } from './NearestTargetStrategy';
export { FarthestTargetStrategy } from './FarthestTargetStrategy';
export { HighestHpTargetStrategy } from './HighestHpTargetStrategy';
export { LowestHpTargetStrategy } from './LowestHpTargetStrategy';
