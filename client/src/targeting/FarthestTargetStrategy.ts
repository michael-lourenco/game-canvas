import { ITargetingStrategy } from './ITargetingStrategy';
import { Enemy } from '../entities/Enemy';

/**
 * Estratégia: Seleciona o inimigo mais distante do jogador
 */
export class FarthestTargetStrategy implements ITargetingStrategy {
    selectTarget(
        enemies: Enemy[],
        playerX: number,
        playerY: number,
        range?: number
    ): Enemy | null {
        if (enemies.length === 0) return null;

        let farthestEnemy: Enemy | null = null;
        let farthestDistance = -1;

        for (const enemy of enemies) {
            const distance = Math.hypot(
                enemy.x - playerX,
                enemy.y - playerY
            );

            // Verificar range
            if (range && range > 0 && distance > range) {
                continue;
            }

            if (distance > farthestDistance) {
                farthestDistance = distance;
                farthestEnemy = enemy;
            }
        }

        return farthestEnemy;
    }
}
