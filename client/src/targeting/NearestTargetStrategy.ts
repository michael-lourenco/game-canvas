import { ITargetingStrategy } from './ITargetingStrategy';
import { Enemy } from '../entities/Enemy';

/**
 * Estratégia: Seleciona o inimigo mais próximo do jogador
 */
export class NearestTargetStrategy implements ITargetingStrategy {
    selectTarget(
        enemies: Enemy[],
        playerX: number,
        playerY: number,
        range?: number
    ): Enemy | null {
        if (enemies.length === 0) return null;

        let nearestEnemy: Enemy | null = null;
        let nearestDistance = Infinity;

        for (const enemy of enemies) {
            const distance = Math.hypot(
                enemy.x - playerX,
                enemy.y - playerY
            );

            // Verificar range
            if (range && range > 0 && distance > range) {
                continue;
            }

            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestEnemy = enemy;
            }
        }

        return nearestEnemy;
    }
}
