import { Enemy } from '../entities/Enemy';

/**
 * Interface para estratégias de seleção de alvo
 * Strategy Pattern: permite diferentes algoritmos de targeting
 */
export interface ITargetingStrategy {
    /**
     * Seleciona o melhor alvo dentre os inimigos disponíveis
     * @param enemies Array de inimigos no jogo
     * @param playerX Posição X do jogador
     * @param playerY Posição Y do jogador
     * @param range Range máximo (0 ou undefined = ilimitado)
     * @returns Enemy selecionado ou null se nenhum válido
     */
    selectTarget(
        enemies: Enemy[],
        playerX: number,
        playerY: number,
        range?: number
    ): Enemy | null;
}
