import { UpgradeCard } from '../data/upgradeCards';

/**
 * UI para seleção de cartas de melhoria (ao subir de nível)
 */
export class UpgradeSelection {
    private container: HTMLElement | null = null;
    private selectedCard: UpgradeCard | null = null;
    private resolveCallback: ((card: UpgradeCard | null) => void) | null = null;

    constructor() {
        this.createContainer();
    }

    /**
     * Criar container HTML
     */
    private createContainer(): void {
        // Verificar se já existe
        if (document.getElementById('upgradeSelectionContainer')) {
            this.container = document.getElementById('upgradeSelectionContainer');
            return;
        }

        const container = document.createElement('div');
        container.id = 'upgradeSelectionContainer';
        container.style.cssText = `
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 10000;
            justify-content: center;
            align-items: center;
            flex-direction: column;
        `;

        const title = document.createElement('h2');
        title.textContent = 'Level Up! Escolha uma Carta';
        title.style.cssText = `
            color: white;
            font-size: 32px;
            margin-bottom: 30px;
            text-align: center;
        `;

        const cardsContainer = document.createElement('div');
        cardsContainer.id = 'cardsContainer';
        cardsContainer.style.cssText = `
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
            justify-content: center;
            max-width: 1200px;
        `;

        container.appendChild(title);
        container.appendChild(cardsContainer);
        document.body.appendChild(container);

        this.container = container;
    }

    /**
     * Mostrar UI de seleção de cartas
     * @param cards Array de 3 cartas para escolher
     * @returns Promise com carta escolhida ou null se cancelado
     */
    async show(cards: UpgradeCard[]): Promise<UpgradeCard | null> {
        if (!this.container) {
            this.createContainer();
        }

        const cardsContainer = document.getElementById('cardsContainer');
        if (!cardsContainer) return null;

        // Limpar cards anteriores
        cardsContainer.innerHTML = '';

        // Criar cards visuais
        cards.forEach((card, index) => {
            const cardElement = this.createCardElement(card, index);
            cardsContainer.appendChild(cardElement);
        });

        // Mostrar container
        if (this.container) {
            this.container.style.display = 'flex';
        }

        // Retornar Promise que resolve quando carta for escolhida
        return new Promise((resolve) => {
            this.resolveCallback = resolve;
        });
    }

    /**
     * Criar elemento visual de carta
     */
    private createCardElement(card: UpgradeCard, index: number): HTMLElement {
        const cardDiv = document.createElement('div');
        
        // Cores por raridade
        const rarityColors: Record<string, string> = {
            common: '#888888',
            rare: '#0099ff',
            epic: '#9900ff',
            legendary: '#ff9900',
        };

        const color = rarityColors[card.rarity] || '#888888';

        cardDiv.style.cssText = `
            width: 280px;
            min-height: 350px;
            background: #1a1a1a;
            border: 3px solid ${color};
            border-radius: 12px;
            padding: 20px;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
            color: white;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        `;

        cardDiv.onmouseenter = () => {
            cardDiv.style.transform = 'scale(1.05)';
            cardDiv.style.boxShadow = `0 0 20px ${color}`;
        };

        cardDiv.onmouseleave = () => {
            cardDiv.style.transform = 'scale(1)';
            cardDiv.style.boxShadow = 'none';
        };

        // Raridade
        const rarityLabel = document.createElement('div');
        rarityLabel.textContent = card.rarity.toUpperCase();
        rarityLabel.style.cssText = `
            color: ${color};
            font-weight: bold;
            font-size: 12px;
            margin-bottom: 10px;
        `;

        // Nome
        const name = document.createElement('h3');
        name.textContent = card.name;
        name.style.cssText = `
            font-size: 24px;
            margin: 0 0 15px 0;
            color: ${color};
        `;

        // Descrição
        const description = document.createElement('p');
        description.textContent = card.description;
        description.style.cssText = `
            font-size: 16px;
            color: #cccccc;
            line-height: 1.5;
            flex-grow: 1;
        `;

        cardDiv.appendChild(rarityLabel);
        cardDiv.appendChild(name);
        cardDiv.appendChild(description);

        // Event listener para seleção
        cardDiv.onclick = () => {
            this.selectCard(card);
        };

        return cardDiv;
    }

    /**
     * Selecionar carta
     */
    private selectCard(card: UpgradeCard): void {
        this.selectedCard = card;
        this.hide();

        if (this.resolveCallback) {
            this.resolveCallback(card);
            this.resolveCallback = null;
        }
    }

    /**
     * Esconder UI
     */
    hide(): void {
        if (this.container) {
            this.container.style.display = 'none';
        }
    }
}
