import { UnlockManager } from '../managers/UnlockManager';
import { unlockData, Unlock, UnlockType } from '../data/unlocks';

/**
 * UI para exibir unlocks já desbloqueados
 */
export class UnlockedPanel {
    private container: HTMLElement | null = null;
    private unlockManager: UnlockManager;

    constructor(unlockManager: UnlockManager) {
        this.unlockManager = unlockManager;
    }

    /**
     * Mostrar painel de unlocks desbloqueados
     */
    show(): void {
        this.createContainer();
        this.updateDisplay();
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
     * Criar container HTML
     */
    private createContainer(): void {
        if (document.getElementById('unlockedPanelContainer')) {
            this.container = document.getElementById('unlockedPanelContainer');
            if (this.container) {
                this.container.style.display = 'flex';
            }
            return;
        }

        const container = document.createElement('div');
        container.id = 'unlockedPanelContainer';
        container.style.cssText = `
            display: flex;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #2a2a3e;
            padding: 30px;
            border-radius: 12px;
            max-width: 900px;
            max-height: 80vh;
            overflow-y: auto;
            z-index: 10000;
            color: white;
            flex-direction: column;
            gap: 20px;
        `;

        // Título
        const title = document.createElement('h2');
        title.textContent = '✅ Unlocks Desbloqueados';
        title.style.cssText = 'margin: 0; font-size: 28px;';

        // Botão fechar
        const closeButton = document.createElement('button');
        closeButton.textContent = '✕ Fechar';
        closeButton.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: #f44336;
            color: white;
            border: none;
            padding: 8px 15px;
            border-radius: 4px;
            cursor: pointer;
        `;
        closeButton.onclick = () => this.hide();

        // Container de categorias
        const categoriesContainer = document.createElement('div');
        categoriesContainer.id = 'unlockedCategoriesContainer';
        categoriesContainer.style.cssText = 'display: flex; flex-direction: column; gap: 20px;';

        container.appendChild(title);
        container.appendChild(closeButton);
        container.appendChild(categoriesContainer);

        document.body.appendChild(container);
        this.container = container;
    }

    /**
     * Atualizar display
     */
    private updateDisplay(): void {
        const container = document.getElementById('unlockedCategoriesContainer');
        if (!container) return;

        container.innerHTML = '';

        // Agrupar unlocks por tipo
        const unlockedByType: Record<UnlockType, Unlock[]> = {
            [UnlockType.SKILL]: [],
            [UnlockType.ITEM]: [],
            [UnlockType.BASE_STAT]: [],
            [UnlockType.FEATURE]: [],
            [UnlockType.STAGE]: [],
            [UnlockType.DIFFICULTY]: [],
        };

        unlockData.forEach(unlock => {
            if (this.unlockManager.isUnlocked(unlock) || unlock.type === UnlockType.BASE_STAT) {
                // Para base stats, verificar se foi aplicado (tem valor > base)
                if (unlock.type === UnlockType.BASE_STAT) {
                    const baseStats = this.unlockManager.getBaseStats();
                    const statName = unlock.data.statName;
                    if (statName === 'hp' && baseStats.hp > 100) {
                        unlockedByType[unlock.type].push(unlock);
                    } else if (statName === 'damage' && baseStats.damage > 1) {
                        unlockedByType[unlock.type].push(unlock);
                    }
                } else {
                    unlockedByType[unlock.type].push(unlock);
                }
            }
        });

        // Criar seções por tipo
        const typeLabels: Record<UnlockType, string> = {
            [UnlockType.SKILL]: '🎯 Skills',
            [UnlockType.ITEM]: '💎 Items',
            [UnlockType.BASE_STAT]: '📊 Status Base',
            [UnlockType.FEATURE]: '⚙️ Funcionalidades',
            [UnlockType.STAGE]: '🌍 Estágios',
            [UnlockType.DIFFICULTY]: '🔥 Dificuldades',
        };

        Object.entries(unlockedByType).forEach(([type, unlocks]) => {
            if (unlocks.length === 0) return;

            const section = document.createElement('div');
            section.style.cssText = 'margin-bottom: 20px;';

            const sectionTitle = document.createElement('h3');
            sectionTitle.textContent = typeLabels[type as UnlockType];
            sectionTitle.style.cssText = 'font-size: 20px; margin-bottom: 10px; color: #4CAF50;';

            const unlocksList = document.createElement('div');
            unlocksList.style.cssText = 'display: flex; flex-direction: column; gap: 8px;';

            unlocks.forEach(unlock => {
                const unlockDiv = this.createUnlockedElement(unlock);
                unlocksList.appendChild(unlockDiv);
            });

            section.appendChild(sectionTitle);
            section.appendChild(unlocksList);
            container.appendChild(section);
        });

        // Se não há unlocks
        if (container.children.length === 0) {
            const empty = document.createElement('p');
            empty.textContent = 'Nenhum unlock desbloqueado ainda.';
            empty.style.cssText = 'text-align: center; color: #888;';
            container.appendChild(empty);
        }
    }

    /**
     * Criar elemento de unlock desbloqueado
     */
    private createUnlockedElement(unlock: Unlock): HTMLElement {
        const div = document.createElement('div');
        div.style.cssText = `
            border: 2px solid #4CAF50;
            border-radius: 8px;
            padding: 12px;
            background: #1a1a2e;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;

        const info = document.createElement('div');
        info.innerHTML = `
            <strong style="font-size: 16px; color: #4CAF50;">${unlock.name}</strong><br>
            <span style="color: #aaa; font-size: 14px;">${unlock.description}</span>
        `;

        const checkmark = document.createElement('span');
        checkmark.textContent = '✅';
        checkmark.style.cssText = 'font-size: 20px;';

        div.appendChild(info);
        div.appendChild(checkmark);

        return div;
    }
}
