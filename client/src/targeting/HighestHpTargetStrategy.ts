import { ITargetingStrategy } from './ITargetingStrategy';
import { Enemy } from '../entities/Enemy';

/**
 * Estratégia: Seleciona o inimigo com mais HP atual
 */
export class HighestHpTargetStrategy implements ITargetingStrategy {
    selectTarget(
        enemies: Enemy[],
        playerX: number,
        playerY: number,
        range?: number
    ): Enemy | null {
        if (enemies.length === 0) return null;

        let highestHpEnemy: Enemy | null = null;
        let highestHp = -1;

        for (const enemy of enemies) {
            const distance = Math.hypot(
                enemy.x - playerX,
                enemy.y - playerY
            );

            // Verificar range
            if (range && range > 0 && distance > range) {
                continue;
            }

            if (enemy.currentHp > highestHp) {
                highestHp = enemy.currentHp;
                highestHpEnemy = enemy;
            }
        }

        return highestHpEnemy;
    }
}
