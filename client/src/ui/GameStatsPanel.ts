import { UnlockManager } from '../managers/UnlockManager';
import { ItemManager } from '../managers/ItemManager';
import { UpgradeCardSystem } from '../systems/UpgradeCardSystem';
import { RunModifiers } from '../managers/RunModifiers';
import { dataProjectile } from '../data/projectiles';

/**
 * Painel de estatísticas durante a partida (lado direito)
 */
export class GameStatsPanel {
    private container: HTMLElement | null = null;
    private unlockManager: UnlockManager;
    private itemManager: ItemManager;
    private upgradeCardSystem: UpgradeCardSystem;
    private runModifiers: RunModifiers;

    constructor(
        unlockManager: UnlockManager,
        itemManager: ItemManager,
        upgradeCardSystem: UpgradeCardSystem,
        runModifiers: RunModifiers
    ) {
        this.unlockManager = unlockManager;
        this.itemManager = itemManager;
        this.upgradeCardSystem = upgradeCardSystem;
        this.runModifiers = runModifiers;
    }

    /**
     * Criar painel (mas não mostrar ainda - será mostrado no hover)
     */
    show(): void {
        if (this.container) {
            // Container já existe, apenas garantir que está criado
            return;
        }

        const container = document.createElement('div');
        container.id = 'gameStatsPanel';
        container.style.cssText = `
            position: fixed;
            top: 60px;
            left: 0;
            width: 250px;
            background: rgba(26, 26, 46, 0.95);
            border: 2px solid #4CAF50;
            border-radius: 12px;
            padding: 15px;
            color: white;
            font-family: Arial, sans-serif;
            z-index: 1000;
            backdrop-filter: blur(10px);
            display: none;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;

        // Título
        const title = document.createElement('h3');
        title.textContent = '📊 Estatísticas';
        title.style.cssText = `
            margin: 0 0 15px 0;
            font-size: 18px;
            color: #4CAF50;
            text-align: center;
        `;

        // Container de stats
        const statsContainer = document.createElement('div');
        statsContainer.id = 'statsContent';
        statsContainer.style.cssText = 'display: flex; flex-direction: column; gap: 10px;';

        container.appendChild(title);
        container.appendChild(statsContainer);

        document.body.appendChild(container);
        this.container = container;
        
        // Configurar hover no ícone de estatísticas
        this.setupHover();
    }
    
    /**
     * Configurar hover para mostrar/esconder painel
     */
    private setupHover(): void {
        const statsIcon = document.getElementById('containerStatsIcon');
        if (!statsIcon || !this.container) return;
        
        statsIcon.addEventListener('mouseenter', () => {
            if (this.container) {
                this.container.style.display = 'block';
                setTimeout(() => {
                    if (this.container) {
                        this.container.style.opacity = '1';
                    }
                }, 10);
            }
        });
        
        statsIcon.addEventListener('mouseleave', () => {
            if (this.container) {
                this.container.style.opacity = '0';
                setTimeout(() => {
                    if (this.container) {
                        this.container.style.display = 'none';
                    }
                }, 300);
            }
        });
        
        // Também manter visível quando mouse está sobre o painel
        if (this.container) {
            this.container.addEventListener('mouseenter', () => {
                if (this.container) {
                    this.container.style.opacity = '1';
                }
            });
            
            this.container.addEventListener('mouseleave', () => {
                if (this.container) {
                    this.container.style.opacity = '0';
                    setTimeout(() => {
                        if (this.container) {
                            this.container.style.display = 'none';
                        }
                    }, 300);
                }
            });
        }
    }

    /**
     * Esconder painel
     */
    hide(): void {
        if (this.container) {
            this.container.style.display = 'none';
        }
    }

    /**
     * Atualizar estatísticas
     */
    update(): void {
        if (!this.container) return;

        const statsContainer = document.getElementById('statsContent');
        if (!statsContainer) return;

        // Recalcular modificadores
        this.runModifiers.calculateModifiers();
        const modifiers = this.runModifiers.getModifiers();
        const baseStats = this.unlockManager.getBaseStats();

        // Calcular estatísticas médias das skills
        const availableSkills = Object.values(dataProjectile).filter((skill, index) => {
            return this.unlockManager.isSkillUnlocked(index) || index < 3;
        });

        let totalDamage = 0;
        let totalSpeed = 0;
        let totalCooldown = 0;
        let skillCount = 0;

        availableSkills.forEach(skill => {
            const modified = this.runModifiers.applyToProjectileConfig(skill);
            totalDamage += modified.attack;
            totalSpeed += modified.velocity_factor;
            totalCooldown += modified.cooldown;
            skillCount++;
        });

        const avgDamage = skillCount > 0 ? Math.round(totalDamage / skillCount) : 0;
        const avgSpeed = skillCount > 0 ? Math.round(totalSpeed / skillCount) : 0;
        const avgCooldown = skillCount > 0 ? (totalCooldown / skillCount).toFixed(1) : '0';

        // HP atual (base + bônus)
        const currentHp = baseStats.hp + modifiers.hpBonus;

        // Cartas selecionadas
        const selectedCards = this.upgradeCardSystem.getSelectedCards();
        const cardsCount = selectedCards.length;

        // Items ativos
        const activeItems = this.itemManager.getActiveItems();
        const itemsCount = activeItems.length;

        // Criar HTML
        statsContainer.innerHTML = `
            <div style="border-bottom: 1px solid #333; padding-bottom: 8px; margin-bottom: 8px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span style="color: #aaa;">❤️ HP:</span>
                    <strong style="color: #f44336;">${currentHp}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span style="color: #aaa;">⚔️ Dano Médio:</span>
                    <strong style="color: #ff9800;">${avgDamage}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span style="color: #aaa;">🚀 Velocidade:</span>
                    <strong style="color: #2196F3;">${avgSpeed}</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: #aaa;">⏱️ Cooldown:</span>
                    <strong style="color: #9C27B0;">${avgCooldown}s</strong>
                </div>
            </div>
            
            <div style="border-bottom: 1px solid #333; padding-bottom: 8px; margin-bottom: 8px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span style="color: #aaa;">📊 Dano Base:</span>
                    <strong style="color: #4CAF50;">+${modifiers.damageFlat}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span style="color: #aaa;">📈 Multiplicador:</span>
                    <strong style="color: #4CAF50;">x${modifiers.damageMultiplier.toFixed(2)}</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: #aaa;">⚡ Velocidade:</span>
                    <strong style="color: #4CAF50;">x${modifiers.speedMultiplier.toFixed(2)}</strong>
                </div>
            </div>
            
            <div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span style="color: #aaa;">🃏 Cartas:</span>
                    <strong style="color: #ffd700;">${cardsCount}</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: #aaa;">💎 Items:</span>
                    <strong style="color: #ffd700;">${itemsCount}</strong>
                </div>
            </div>
        `;
    }
}
