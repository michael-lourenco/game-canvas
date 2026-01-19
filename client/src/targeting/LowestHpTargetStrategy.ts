import { ITargetingStrategy } from './ITargetingStrategy';
import { Enemy } from '../entities/Enemy';

/**
 * Estratégia: Seleciona o inimigo com menos HP atual
 */
export class LowestHpTargetStrategy implements ITargetingStrategy {
    selectTarget(
        enemies: Enemy[],
        playerX: number,
        playerY: number,
        range?: number
    ): Enemy | null {
        if (enemies.length === 0) return null;

        let lowestHpEnemy: Enemy | null = null;
        let lowestHp = Infinity;

        for (const enemy of enemies) {
            const distance = Math.hypot(
                enemy.x - playerX,
                enemy.y - playerY
            );

            // Verificar range
            if (range && range > 0 && distance > range) {
                continue;
            }

            if (enemy.currentHp < lowestHp) {
                lowestHp = enemy.currentHp;
                lowestHpEnemy = enemy;
            }
        }

        return lowestHpEnemy;
    }
}
