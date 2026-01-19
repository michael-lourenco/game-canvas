import { DiamondManager } from '../managers/DiamondManager';
import { UnlockManager } from '../managers/UnlockManager';
import { unlockData, Unlock } from '../data/unlocks';

/**
 * Tela principal (Hub) - Meta progressão
 */
export class Hub {
    private container: HTMLElement | null = null;
    private diamondManager: DiamondManager;
    private unlockManager: UnlockManager;
    private onStartGameCallback: (() => void) | null = null;

    constructor(diamondManager: DiamondManager, unlockManager: UnlockManager) {
        this.diamondManager = diamondManager;
        this.unlockManager = unlockManager;
    }

    /**
     * Mostrar Hub
     */
    show(): void {
        this.createContainer();
        this.updateDisplay();
    }

    /**
     * Esconder Hub
     */
    hide(): void {
        if (this.container) {
            this.container.style.display = 'none';
        }
    }

    /**
     * Registrar callback para iniciar jogo
     */
    onStartGame(callback: () => void): void {
        this.onStartGameCallback = callback;
    }

    /**
     * Criar container HTML
     */
    private createContainer(): void {
        // Verificar se já existe
        if (document.getElementById('hubContainer')) {
            this.container = document.getElementById('hubContainer');
            if (this.container) {
                this.container.style.display = 'flex';
            }
            return;
        }

        const container = document.createElement('div');
        container.id = 'hubContainer';
        container.style.cssText = `
            display: flex;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            z-index: 9999;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: white;
            font-family: Arial, sans-serif;
        `;

        // Título
        const title = document.createElement('h1');
        title.textContent = '🏛️ Hub';
        title.style.cssText = `
            font-size: 48px;
            margin-bottom: 30px;
            text-align: center;
        `;

        // Diamonds
        const diamondsContainer = document.createElement('div');
        diamondsContainer.id = 'hubDiamonds';
        diamondsContainer.style.cssText = `
            font-size: 24px;
            margin-bottom: 40px;
            text-align: center;
        `;

        // Stats
        const statsContainer = document.createElement('div');
        statsContainer.id = 'hubStats';
        statsContainer.style.cssText = `
            margin-bottom: 40px;
            text-align: center;
        `;

        // Botão Iniciar Partida
        const startButton = document.createElement('button');
        startButton.textContent = '▶️ Iniciar Partida';
        startButton.style.cssText = `
            padding: 15px 40px;
            font-size: 20px;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            margin: 10px;
            transition: background 0.3s;
        `;
        startButton.onmouseenter = () => { startButton.style.background = '#45a049'; };
        startButton.onmouseleave = () => { startButton.style.background = '#4CAF50'; };
        startButton.onclick = () => {
            if (this.onStartGameCallback) {
                this.onStartGameCallback();
            }
            this.hide();
        };

        // Botão Unlocks
        const unlocksButton = document.createElement('button');
        unlocksButton.textContent = '🔓 Unlocks';
        unlocksButton.style.cssText = `
            padding: 15px 40px;
            font-size: 20px;
            background: #2196F3;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            margin: 10px;
            transition: background 0.3s;
        `;
        unlocksButton.onmouseenter = () => { unlocksButton.style.background = '#0b7dda'; };
        unlocksButton.onmouseleave = () => { unlocksButton.style.background = '#2196F3'; };
        unlocksButton.onclick = () => {
            this.showUnlocks();
        };

        container.appendChild(title);
        container.appendChild(diamondsContainer);
        container.appendChild(statsContainer);
        container.appendChild(startButton);
        container.appendChild(unlocksButton);

        document.body.appendChild(container);
        this.container = container;
    }

    /**
     * Atualizar display (diamonds, stats)
     */
    private updateDisplay(): void {
        const diamondsEl = document.getElementById('hubDiamonds');
        if (diamondsEl) {
            const diamonds = this.diamondManager.getTotal();
            diamondsEl.innerHTML = `💎 Diamonds: <strong>${diamonds}</strong>`;
        }

        // TODO: Adicionar stats (melhor score, nível máximo, etc)
    }

    /**
     * Mostrar painel de unlocks
     */
    private showUnlocks(): void {
        // Criar modal simples de unlocks
        const modal = document.createElement('div');
        modal.id = 'unlocksModal';
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #2a2a3e;
            padding: 30px;
            border-radius: 12px;
            max-width: 800px;
            max-height: 80vh;
            overflow-y: auto;
            z-index: 10000;
            color: white;
        `;

        const title = document.createElement('h2');
        title.textContent = '🔓 Unlocks Disponíveis';
        title.style.cssText = 'margin-top: 0; margin-bottom: 20px;';

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
        closeButton.onclick = () => {
            modal.remove();
        };

        const unlocksList = document.createElement('div');
        unlocksList.style.cssText = 'display: flex; flex-direction: column; gap: 10px;';

        // Filtrar unlocks disponíveis (não desbloqueados)
        const availableUnlocks = unlockData.filter(u => !this.unlockManager.isUnlocked(u));
        const diamonds = this.diamondManager.getTotal();

        availableUnlocks.forEach(unlock => {
            const unlockDiv = this.createUnlockElement(unlock, diamonds);
            unlocksList.appendChild(unlockDiv);
        });

        if (availableUnlocks.length === 0) {
            const noUnlocks = document.createElement('p');
            noUnlocks.textContent = 'Todos os unlocks foram desbloqueados! 🎉';
            noUnlocks.style.cssText = 'text-align: center; color: #888;';
            unlocksList.appendChild(noUnlocks);
        }

        modal.appendChild(title);
        modal.appendChild(closeButton);
        modal.appendChild(unlocksList);

        document.body.appendChild(modal);
    }

    /**
     * Criar elemento de unlock individual
     */
    private createUnlockElement(unlock: Unlock, availableDiamonds: number): HTMLElement {
        const div = document.createElement('div');
        const canAfford = availableDiamonds >= unlock.cost;
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
            <strong style="font-size: 18px;">${unlock.name}</strong><br>
            <span style="color: #aaa; font-size: 14px;">${unlock.description}</span>
        `;

        const costButton = document.createElement('button');
        costButton.textContent = `${unlock.cost} 💎`;
        costButton.disabled = !canAfford;
        costButton.style.cssText = `
            padding: 10px 20px;
            background: ${canAfford ? '#4CAF50' : '#666'};
            color: white;
            border: none;
            border-radius: 6px;
            cursor: ${canAfford ? 'pointer' : 'not-allowed'};
            font-size: 16px;
        `;

        if (canAfford) {
            costButton.onclick = () => {
                if (this.unlockManager.unlock(unlock)) {
                    this.updateDisplay();
                    costButton.textContent = '✅ Desbloqueado!';
                    costButton.disabled = true;
                    costButton.style.background = '#888';
                    setTimeout(() => {
                        // Recriar modal para atualizar lista
                        document.getElementById('unlocksModal')?.remove();
                        this.showUnlocks();
                    }, 500);
                }
            };
        }

        div.appendChild(info);
        div.appendChild(costButton);

        return div;
    }
}
