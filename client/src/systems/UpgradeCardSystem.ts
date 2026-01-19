import { UpgradeCard, upgradeCards, CardRarity, rarityWeights } from '../data/upgradeCards';

/**
 * Sistema de cartas de melhoria
 */
export class UpgradeCardSystem {
    private selectedCards: UpgradeCard[] = [];
    private activeEffects: Map<string, number> = new Map(); // statName -> value

    /**
     * Gerar 3 cartas aleatórias baseadas em raridade
     * @param currentLevel Nível atual (afeta probabilidade de raridades)
     */
    generateCardOptions(currentLevel: number = 1): UpgradeCard[] {
        const options: UpgradeCard[] = [];
        const availableCards = [...upgradeCards]; // Copiar array
        
        // Ajustar pesos baseado no nível (níveis maiores = mais chances de raridades altas)
        const levelMultiplier = Math.min(1 + (currentLevel - 1) * 0.05, 2); // Max 2x

        for (let i = 0; i < 3 && availableCards.length > 0; i++) {
            // Selecionar carta baseada em raridade
            const card = this.selectRandomCardByRarity(availableCards, levelMultiplier);
            
            if (card) {
                options.push(card);
                // Remover da lista disponível para não repetir
                const index = availableCards.indexOf(card);
                if (index > -1) {
                    availableCards.splice(index, 1);
                }
            }
        }

        return options;
    }

    /**
     * Selecionar carta aleatória baseada em raridade
     */
    private selectRandomCardByRarity(cards: UpgradeCard[], levelMultiplier: number): UpgradeCard | null {
        if (cards.length === 0) return null;

        // Calcular pesos ajustados
        const adjustedWeights: Record<CardRarity, number> = {
            common: rarityWeights.common,
            rare: rarityWeights.rare * levelMultiplier,
            epic: rarityWeights.epic * levelMultiplier * 1.5,
            legendary: rarityWeights.legendary * levelMultiplier * 2,
        };

        // Filtrar cards por raridade e calcular probabilidades
        const totalWeight = Object.values(adjustedWeights).reduce((sum, w) => sum + w, 0);
        let random = Math.random() * totalWeight;

        // Selecionar raridade
        let selectedRarity: CardRarity = 'common';
        for (const [rarity, weight] of Object.entries(adjustedWeights) as [CardRarity, number][]) {
            if (random <= weight) {
                selectedRarity = rarity;
                break;
            }
            random -= weight;
        }

        // Filtrar cards da raridade selecionada
        const cardsOfRarity = cards.filter(c => c.rarity === selectedRarity);
        
        if (cardsOfRarity.length === 0) {
            // Fallback: retornar qualquer carta
            return cards[Math.floor(Math.random() * cards.length)];
        }

        // Selecionar carta aleatória dessa raridade
        return cardsOfRarity[Math.floor(Math.random() * cardsOfRarity.length)];
    }

    /**
     * Aplicar efeito da carta escolhida
     * @returns Stats atualizados
     */
    applyCard(card: UpgradeCard): { stats: Map<string, number>; newSkills?: number[] } {
        this.selectedCards.push(card);

        const newSkills: number[] = [];

        // Aplicar efeito baseado no tipo
        switch (card.type) {
            case 'stat_boost':
                if (card.effect.statName && card.effect.statValue !== undefined) {
                    const currentValue = this.activeEffects.get(card.effect.statName) || 1;
                    // Para multiplicadores, multiplicar
                    // Para valores absolutos, somar (será definido no effect)
                    this.activeEffects.set(card.effect.statName, currentValue * card.effect.statValue);
                }
                break;

            case 'skill_upgrade':
                // Será aplicado diretamente na skill
                // Por enquanto, apenas registrar
                break;

            case 'new_skill':
                if (card.effect.newSkillId !== undefined) {
                    newSkills.push(card.effect.newSkillId);
                }
                break;

            case 'effect':
                // Efeitos especiais serão processados separadamente
                break;
        }

        return {
            stats: new Map(this.activeEffects),
            newSkills: newSkills.length > 0 ? newSkills : undefined
        };
    }

    /**
     * Obter cartas já selecionadas nesta partida
     */
    getSelectedCards(): UpgradeCard[] {
        return [...this.selectedCards];
    }

    /**
     * Obter efeitos ativos
     */
    getActiveEffects(): Map<string, number> {
        return new Map(this.activeEffects);
    }

    /**
     * Obter multiplicador de stat específico
     */
    getStatMultiplier(statName: string): number {
        return this.activeEffects.get(statName) || 1;
    }

    /**
     * Resetar para nova partida
     */
    reset(): void {
        this.selectedCards = [];
        this.activeEffects.clear();
    }
}
