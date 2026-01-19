import { Enemy } from '../entities/Enemy';
import { Projectile } from '../entities/Projectile';
import { ProjectileConfig, FocusType } from '../data/projectiles';
import { createTargetingStrategy, ITargetingStrategy } from '../targeting';
import { createVelocity } from '../utils';

/**
 * Sistema de auto-fire para skills
 * Processa todas as skills e dispara automaticamente quando cooldown = 0
 */
export class AutoSkillSystem {
    private strategies: Map<FocusType, ITargetingStrategy> = new Map();

    constructor(
        private playerX: number,
        private playerY: number
    ) {}

    /**
     * Atualiza posição do jogador (caso mude)
     */
    updatePlayerPosition(x: number, y: number) {
        this.playerX = x;
        this.playerY = y;
    }

    /**
     * Processa todas as skills e dispara automaticamente se cooldown = 0
     * @param skills Array de skills para processar
     * @param enemies Array de inimigos no jogo
     * @param context Contexto do canvas
     * @returns Array de projéteis criados
     */
    processSkills(
        skills: ProjectileConfig[],
        enemies: Enemy[],
        context: CanvasRenderingContext2D
    ): Projectile[] {
        const firedProjectiles: Projectile[] = [];

        for (const skill of skills) {
            // Verificar se skill tem auto-fire ativado (padrão: true)
            if (skill.autoFire === false) continue;

            // Verificar se cooldown está pronto
            if (skill.currentCoolDown < skill.cooldown) continue;

            // Tentar disparar skill
            const projectile = this.fireSkill(skill, enemies, context);
            if (projectile) {
                firedProjectiles.push(projectile);
                // Resetar cooldown
                skill.currentCoolDown = 0;
            }
        }

        return firedProjectiles;
    }

    /**
     * Dispara uma skill específica
     * @param skill Configuração da skill
     * @param enemies Array de inimigos
     * @param context Contexto do canvas
     * @returns Projétil criado ou null se não encontrou alvo
     */
    private fireSkill(
        skill: ProjectileConfig,
        enemies: Enemy[],
        context: CanvasRenderingContext2D
    ): Projectile | null {
        // Se não há inimigos, não disparar
        if (enemies.length === 0) return null;

        // Obter estratégia de targeting
        const focusType = skill.focus || FocusType.NEAREST;
        let strategy = this.strategies.get(focusType);
        
        if (!strategy) {
            strategy = createTargetingStrategy(focusType);
            this.strategies.set(focusType, strategy);
        }

        // Selecionar alvo
        const target = strategy.selectTarget(
            enemies,
            this.playerX,
            this.playerY,
            skill.range
        );

        // Se não encontrou alvo válido, não disparar
        if (!target) return null;

        // Calcular ângulo para o alvo
        const angle = Math.atan2(
            target.y - this.playerY,
            target.x - this.playerX
        );

        // Criar velocidade
        const velocity = createVelocity(angle, skill.velocity_factor);

        // Criar projétil (skill já tem modificadores aplicados)
        return new Projectile(
            context,
            this.playerX,
            this.playerY,
            velocity,
            {
                name: skill.name,
                pierce: skill.pierce || 0,
                attack: skill.attack,
                color: skill.color,
                cooldown: skill.cooldown,
                radius: skill.radius,
                velocity_factor: skill.velocity_factor,
            }
        );
    }
}
