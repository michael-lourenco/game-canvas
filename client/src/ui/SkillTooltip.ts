import { ProjectileConfig } from '../data/projectiles';
import { RunModifiers } from '../managers/RunModifiers';

import { ProjectileConfig } from '../data/projectiles';
import { RunModifiers } from '../managers/RunModifiers';

/**
 * Sistema de tooltip para skills
 */
export class SkillTooltip {
    private tooltip: HTMLElement | null = null;
    private currentSkillId: number | null = null;

    constructor() {
        this.createTooltip();
    }

    /**
     * Criar elemento de tooltip
     */
    private createTooltip(): void {
        const tooltip = document.createElement('div');
        tooltip.id = 'skillTooltip';
        tooltip.style.cssText = `
            position: fixed;
            background: rgba(26, 26, 46, 0.95);
            border: 2px solid #4CAF50;
            border-radius: 8px;
            padding: 12px;
            color: white;
            font-family: Arial, sans-serif;
            font-size: 14px;
            z-index: 10000;
            pointer-events: none;
            display: none;
            max-width: 300px;
            backdrop-filter: blur(10px);
        `;
        document.body.appendChild(tooltip);
        this.tooltip = tooltip;
    }

    /**
     * Mostrar tooltip para uma skill
     */
    show(skillId: number, skill: ProjectileConfig, runModifiers: RunModifiers, event: MouseEvent): void {
        if (!this.tooltip) return;

        // Aplicar modificadores para mostrar valores reais
        const modified = runModifiers.applyToProjectileConfig(skill);

        // Calcular cooldown restante
        const cooldownRemaining = Math.max(0, modified.cooldown - skill.currentCoolDown);
        const cooldownPercent = modified.cooldown > 0 
            ? ((skill.currentCoolDown / modified.cooldown) * 100).toFixed(0)
            : '100';

        // Criar conteúdo do tooltip
        const content = `
            <div style="margin-bottom: 8px;">
                <strong style="color: #4CAF50; font-size: 16px;">${skill.name.toUpperCase()}</strong>
            </div>
            <div style="display: flex; flex-direction: column; gap: 4px; font-size: 12px;">
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: #aaa;">⚔️ Dano:</span>
                    <strong style="color: #ff9800;">${modified.attack}</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: #aaa;">🚀 Velocidade:</span>
                    <strong style="color: #2196F3;">${modified.velocity_factor.toFixed(1)}</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: #aaa;">⏱️ Cooldown:</span>
                    <strong style="color: #9C27B0;">${modified.cooldown.toFixed(1)}s</strong>
                    ${cooldownRemaining > 0 ? `<span style="color: #888;">(${cooldownRemaining.toFixed(1)}s restante)</span>` : ''}
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: #aaa;">📏 Alcance:</span>
                    <strong style="color: #4CAF50;">${skill.range || '∞'}px</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: #aaa;">🔪 Pierce:</span>
                    <strong style="color: #f44336;">${modified.pierce >= 999 ? '∞' : modified.pierce}</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: #aaa;">🎯 Foco:</span>
                    <strong style="color: #ffd700;">${this.getFocusLabel(skill.focus)}</strong>
                </div>
                ${cooldownRemaining > 0 ? `
                <div style="margin-top: 6px;">
                    <div style="background: #333; height: 4px; border-radius: 2px; overflow: hidden;">
                        <div style="background: #4CAF50; height: 100%; width: ${cooldownPercent}%; transition: width 0.1s;"></div>
                    </div>
                </div>
                ` : ''}
            </div>
        `;

        this.tooltip.innerHTML = content;
        this.tooltip.style.display = 'block';
        this.currentSkillId = skillId;

        // Posicionar tooltip próximo ao mouse
        this.updatePosition(event);
    }

    /**
     * Atualizar posição do tooltip
     */
    private updatePosition(event: MouseEvent): void {
        if (!this.tooltip) return;

        const offset = 15;
        let left = event.clientX + offset;
        let top = event.clientY + offset;

        // Ajustar se sair da tela
        if (left + this.tooltip.offsetWidth > window.innerWidth) {
            left = event.clientX - this.tooltip.offsetWidth - offset;
        }
        if (top + this.tooltip.offsetHeight > window.innerHeight) {
            top = event.clientY - this.tooltip.offsetHeight - offset;
        }

        this.tooltip.style.left = `${left}px`;
        this.tooltip.style.top = `${top}px`;
    }

    /**
     * Esconder tooltip
     */
    hide(): void {
        if (this.tooltip) {
            this.tooltip.style.display = 'none';
            this.currentSkillId = null;
        }
    }

    /**
     * Obter label do tipo de foco
     */
    private getFocusLabel(focus?: string): string {
        const labels: Record<string, string> = {
            'nearest': 'Mais Próximo',
            'farthest': 'Mais Distante',
            'highest_hp': 'Mais HP',
            'lowest_hp': 'Menos HP',
        };
        return labels[focus || 'nearest'] || 'Mais Próximo';
    }

    /**
     * Atualizar tooltip se já estiver visível
     */
    update(skillId: number, skill: ProjectileConfig, runModifiers: RunModifiers, event: MouseEvent): void {
        if (this.currentSkillId === skillId && this.tooltip?.style.display === 'block') {
            this.show(skillId, skill, runModifiers, event);
        }
    }
}
