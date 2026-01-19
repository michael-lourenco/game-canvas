import { InGameShopManager } from '../managers/InGameShopManager';
import { InGameShopSkill } from '../data/inGameShop';

/**
 * UI da loja de skills durante a partida
 */
export class InGameShop {
    private container: HTMLElement | null = null;
    private shopManager: InGameShopManager;
    private onPurchaseCallback: ((skillId: number) => void) | null = null;

    constructor(shopManager: InGameShopManager) {
        this.shopManager = shopManager;
    }

    /**
     * Registrar callback quando skill for comprada
     */
    onPurchase(callback: (skillId: number) => void): void {
        this.onPurchaseCallback = callback;
    }

    /**
     * Mostrar loja
     */
    show(): void {
        this.createContainer();
        this.updateDisplay();
        // Pausar jogo quando loja está aberta (será controlado externamente)
    }

    /**
     * Esconder loja
     */
    hide(): void {
        if (this.container) {
            this.container.style.display = 'none';
        }
    }

    /**
     * Toggle (mostrar/esconder)
     */
    toggle(): void {
        if (this.container && this.container.style.display === 'flex') {
            this.hide();
        } else {
            this.show();
        }
    }

    /**
     * Criar container HTML
     */
    private createContainer(): void {
        if (document.getElementById('inGameShopContainer')) {
            this.container = document.getElementById('inGameShopContainer');
            if (this.container) {
                this.container.style.display = 'flex';
            }
            return;
        }

        const container = document.createElement('div');
        container.id = 'inGameShopContainer';
        container.style.cssText = `
            display: none;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #2a2a3e;
            padding: 30px;
            border-radius: 12px;
            max-width: 600px;
            z-index: 10000;
            color: white;
            flex-direction: column;
            gap: 20px;
            border: 3px solid #4CAF50;
        `;

        // Título
        const title = document.createElement('h2');
        title.textContent = '🛒 Loja de Skills';
        title.style.cssText = 'margin: 0; font-size: 24px; text-align: center; color: #4CAF50;';

        // Points disponíveis
        const pointsDisplay = document.createElement('div');
        pointsDisplay.id = 'shopPointsDisplay';
        pointsDisplay.style.cssText = `
            font-size: 20px;
            text-align: center;
            margin-bottom: 10px;
        `;

        // Botão fechar
        const closeButton = document.createElement('button');
        closeButton.textContent = '✕ Fechar (ESC)';
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

        // Container de skills
        const skillsContainer = document.createElement('div');
        skillsContainer.id = 'shopSkillsContainer';
        skillsContainer.style.cssText = 'display: flex; flex-direction: column; gap: 10px;';

        container.appendChild(title);
        container.appendChild(closeButton);
        container.appendChild(pointsDisplay);
        container.appendChild(skillsContainer);

        document.body.appendChild(container);
        this.container = container;

        // Fechar com ESC
        const escHandler = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && this.container?.style.display === 'flex') {
                this.hide();
            }
        };
        document.addEventListener('keydown', escHandler);
    }

    /**
     * Atualizar display
     */
    updateDisplay(): void {
        const pointsDisplay = document.getElementById('shopPointsDisplay');
        const skillsContainer = document.getElementById('shopSkillsContainer');
        
        if (!pointsDisplay || !skillsContainer) return;

        // Atualizar points
        const points = this.shopManager.getCurrentPoints();
        pointsDisplay.innerHTML = `💰 Points Disponíveis: <strong style="color: #ffd700;">${points}</strong>`;

        // Limpar skills
        skillsContainer.innerHTML = '';

        // Obter skills disponíveis
        const availableSkills = this.shopManager.getAvailableSkills();
        const purchasedSkills = this.shopManager.getPurchasedSkills();

        // Mostrar skills compradas primeiro
        if (purchasedSkills.length > 0) {
            const purchasedSection = document.createElement('div');
            purchasedSection.style.cssText = 'margin-bottom: 15px;';

            const purchasedTitle = document.createElement('h3');
            purchasedTitle.textContent = '✅ Skills Compradas';
            purchasedTitle.style.cssText = 'font-size: 16px; color: #4CAF50; margin-bottom: 10px;';

            const purchasedList = document.createElement('div');
            purchasedList.style.cssText = 'display: flex; flex-direction: column; gap: 5px;';

            purchasedSkills.forEach(skillId => {
                const skillDiv = this.createPurchasedSkillElement(skillId);
                purchasedList.appendChild(skillDiv);
            });

            purchasedSection.appendChild(purchasedTitle);
            purchasedSection.appendChild(purchasedList);
            skillsContainer.appendChild(purchasedSection);
        }

        // Mostrar skills disponíveis para compra
        if (availableSkills.length > 0) {
            const availableSection = document.createElement('div');

            const availableTitle = document.createElement('h3');
            availableTitle.textContent = '🛒 Skills Disponíveis';
            availableTitle.style.cssText = 'font-size: 16px; color: #2196F3; margin-bottom: 10px;';

            const availableList = document.createElement('div');
            availableList.style.cssText = 'display: flex; flex-direction: column; gap: 10px;';

            availableSkills.forEach(skill => {
                const skillDiv = this.createShopSkillElement(skill);
                availableList.appendChild(skillDiv);
            });

            availableSection.appendChild(availableTitle);
            availableSection.appendChild(availableList);
            skillsContainer.appendChild(availableSection);
        } else {
            const empty = document.createElement('p');
            empty.textContent = 'Todas as skills foram compradas! 🎉';
            empty.style.cssText = 'text-align: center; color: #888;';
            skillsContainer.appendChild(empty);
        }
    }

    /**
     * Criar elemento de skill disponível para compra
     */
    private createShopSkillElement(skill: InGameShopSkill): HTMLElement {
        const div = document.createElement('div');
        const canAfford = this.shopManager.canAfford(skill.id);
        const borderColor = canAfford ? '#4CAF50' : '#666';

        div.style.cssText = `
            border: 2px solid ${borderColor};
            border-radius: 8px;
            padding: 15px;
            background: #1a1a2e;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;

        const info = document.createElement('div');
        info.innerHTML = `
            <strong style="font-size: 18px; color: ${borderColor};">${skill.name}</strong><br>
            <span style="color: #aaa; font-size: 14px;">${skill.description}</span><br>
            <span style="color: #888; font-size: 12px;">
                ⚔️ Dano: ${skill.config.attack} | 
                ⏱️ Cooldown: ${skill.config.cooldown}s | 
                🔪 Pierce: ${skill.config.pierce}
            </span>
        `;

        const buyButton = document.createElement('button');
        buyButton.textContent = `${skill.cost} 💰`;
        buyButton.disabled = !canAfford;
        buyButton.style.cssText = `
            padding: 10px 20px;
            background: ${canAfford ? '#4CAF50' : '#666'};
            color: white;
            border: none;
            border-radius: 6px;
            cursor: ${canAfford ? 'pointer' : 'not-allowed'};
            font-size: 16px;
            font-weight: bold;
        `;

        if (canAfford) {
            buyButton.onclick = () => {
                if (this.shopManager.purchaseSkill(skill.id)) {
                    if (this.onPurchaseCallback) {
                        this.onPurchaseCallback(skill.id);
                    }
                    this.updateDisplay();
                }
            };
        }

        div.appendChild(info);
        div.appendChild(buyButton);

        return div;
    }

    /**
     * Criar elemento de skill já comprada
     */
    private createPurchasedSkillElement(skillId: number): HTMLElement {
        const div = document.createElement('div');
        div.style.cssText = `
            border: 2px solid #4CAF50;
            border-radius: 6px;
            padding: 8px 12px;
            background: #1a1a2e;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;

        const skillNames: Record<number, string> = {
            0: 'Gun',
            1: 'Rifle',
            2: 'Shotgun',
            3: 'Bomb',
        };

        const name = document.createElement('span');
        name.textContent = skillNames[skillId] || `Skill ${skillId}`;
        name.style.cssText = 'color: #4CAF50; font-weight: bold;';

        const checkmark = document.createElement('span');
        checkmark.textContent = '✅';
        checkmark.style.cssText = 'font-size: 18px;';

        div.appendChild(name);
        div.appendChild(checkmark);

        return div;
    }
}
