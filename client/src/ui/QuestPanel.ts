import { QuestManager } from '../managers/QuestManager';
import { Quest, QuestRarity } from '../data/quests';

/**
 * UI para exibir quests/missões
 */
export class QuestPanel {
    private container: HTMLElement | null = null;
    private questManager: QuestManager;

    constructor(questManager: QuestManager) {
        this.questManager = questManager;
    }

    /**
     * Mostrar painel de quests
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
        if (document.getElementById('questPanelContainer')) {
            this.container = document.getElementById('questPanelContainer');
            if (this.container) {
                this.container.style.display = 'flex';
            }
            return;
        }

        const container = document.createElement('div');
        container.id = 'questPanelContainer';
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
        title.textContent = '🎯 Quests / Missões';
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

        // Container de tabs
        const tabsContainer = document.createElement('div');
        tabsContainer.style.cssText = 'display: flex; gap: 10px; margin-bottom: 10px;';

        const dailyTab = document.createElement('button');
        dailyTab.textContent = '📅 Diárias';
        dailyTab.id = 'questTabDaily';
        dailyTab.style.cssText = `
            padding: 10px 20px;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
        `;

        const permanentTab = document.createElement('button');
        permanentTab.textContent = '⭐ Permanentes';
        permanentTab.id = 'questTabPermanent';
        permanentTab.style.cssText = `
            padding: 10px 20px;
            background: #666;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
        `;

        let currentTab: 'daily' | 'permanent' = 'daily';

        dailyTab.onclick = () => {
            currentTab = 'daily';
            dailyTab.style.background = '#4CAF50';
            permanentTab.style.background = '#666';
            this.updateQuestList('daily');
        };

        permanentTab.onclick = () => {
            currentTab = 'permanent';
            dailyTab.style.background = '#666';
            permanentTab.style.background = '#4CAF50';
            this.updateQuestList('permanent');
        };

        tabsContainer.appendChild(dailyTab);
        tabsContainer.appendChild(permanentTab);

        // Container de quests
        const questsContainer = document.createElement('div');
        questsContainer.id = 'questsListContainer';
        questsContainer.style.cssText = 'display: flex; flex-direction: column; gap: 10px;';

        container.appendChild(title);
        container.appendChild(closeButton);
        container.appendChild(tabsContainer);
        container.appendChild(questsContainer);

        document.body.appendChild(container);
        this.container = container;

        // Inicializar com tab diária
        this.updateQuestList('daily');
    }

    /**
     * Atualizar lista de quests
     */
    private updateQuestList(type: 'daily' | 'permanent'): void {
        const container = document.getElementById('questsListContainer');
        if (!container) return;

        container.innerHTML = '';

        const quests = type === 'daily' 
            ? this.questManager.getDailyQuests()
            : this.questManager.getPermanentQuests();

        if (quests.length === 0) {
            const empty = document.createElement('p');
            empty.textContent = 'Nenhuma quest disponível.';
            empty.style.cssText = 'text-align: center; color: #888;';
            container.appendChild(empty);
            return;
        }

        quests.forEach(quest => {
            const questElement = this.createQuestElement(quest);
            container.appendChild(questElement);
        });
    }

    /**
     * Criar elemento de quest individual
     */
    private createQuestElement(quest: Quest): HTMLElement {
        const div = document.createElement('div');
        
        const rarityColors: Record<QuestRarity, string> = {
            common: '#888888',
            rare: '#0099ff',
            epic: '#9900ff',
            legendary: '#ff9900',
        };

        const color = rarityColors[quest.rarity] || '#888888';
        const progressPercent = (quest.progress / quest.requirement) * 100;
        const isCompleted = quest.completed;

        div.style.cssText = `
            border: 2px solid ${isCompleted ? '#4CAF50' : color};
            border-radius: 8px;
            padding: 15px;
            background: #1a1a2e;
        `;

        // Header
        const header = document.createElement('div');
        header.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;';

        const name = document.createElement('div');
        name.innerHTML = `
            <strong style="font-size: 18px; color: ${color};">${quest.name}</strong>
            ${isCompleted ? '<span style="color: #4CAF50; margin-left: 10px;">✅</span>' : ''}
        `;

        const reward = document.createElement('div');
        reward.textContent = `${quest.reward} 💎`;
        reward.style.cssText = `font-size: 16px; font-weight: bold; color: #ffd700;`;

        header.appendChild(name);
        header.appendChild(reward);

        // Descrição
        const description = document.createElement('p');
        description.textContent = quest.description;
        description.style.cssText = 'color: #aaa; font-size: 14px; margin: 10px 0;';

        // Progresso
        const progressContainer = document.createElement('div');
        progressContainer.style.cssText = 'margin-top: 10px;';

        const progressText = document.createElement('div');
        progressText.textContent = `${quest.progress} / ${quest.requirement}`;
        progressText.style.cssText = 'font-size: 12px; color: #888; margin-bottom: 5px;';

        const progressBar = document.createElement('div');
        progressBar.style.cssText = `
            width: 100%;
            height: 8px;
            background: #333;
            border-radius: 4px;
            overflow: hidden;
        `;

        const progressFill = document.createElement('div');
        progressFill.style.cssText = `
            height: 100%;
            width: ${progressPercent}%;
            background: ${isCompleted ? '#4CAF50' : color};
            transition: width 0.3s;
        `;

        progressBar.appendChild(progressFill);
        progressContainer.appendChild(progressText);
        progressContainer.appendChild(progressBar);

        div.appendChild(header);
        div.appendChild(description);
        div.appendChild(progressContainer);

        return div;
    }

    /**
     * Atualizar display
     */
    updateDisplay(): void {
        // Atualizar lista se container existir
        if (document.getElementById('questsListContainer')) {
            const dailyTab = document.getElementById('questTabDaily');
            const permanentTab = document.getElementById('questTabPermanent');
            
            if (dailyTab && (dailyTab as HTMLElement).style.background === '#4CAF50') {
                this.updateQuestList('daily');
            } else if (permanentTab && (permanentTab as HTMLElement).style.background === '#4CAF50') {
                this.updateQuestList('permanent');
            }
        }
    }
}
