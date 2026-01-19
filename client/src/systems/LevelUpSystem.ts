/**
 * Sistema de níveis baseado em XP
 */
export class LevelUpSystem {
    private currentLevel: number = 1;
    private currentXp: number = 0;
    private onLevelUpCallbacks: (() => void)[] = [];

    /**
     * Calcular XP necessário para um nível
     * Fórmula: base * (level ^ factor)
     */
    private calculateXpRequired(level: number): number {
        const base = 100; // XP base
        const factor = 1.5; // Fator de crescimento
        return Math.floor(base * Math.pow(level, factor));
    }

    /**
     * Adicionar XP
     * @returns true se subiu de nível
     */
    addXp(amount: number): boolean {
        if (amount <= 0) return false;

        this.currentXp += amount;
        const xpRequired = this.calculateXpRequired(this.currentLevel);

        // Verificar se subiu de nível
        if (this.currentXp >= xpRequired) {
            this.currentLevel++;
            this.currentXp = this.currentXp - xpRequired; // XP extra vai para próximo nível
            
            // Chamar callbacks
            this.onLevelUpCallbacks.forEach(callback => callback());
            
            return true;
        }

        return false;
    }

    /**
     * Obter nível atual
     */
    getLevel(): number {
        return this.currentLevel;
    }

    /**
     * Obter XP atual
     */
    getCurrentXp(): number {
        return this.currentXp;
    }

    /**
     * Obter XP necessário para próximo nível
     */
    getXpRequired(): number {
        return this.calculateXpRequired(this.currentLevel);
    }

    /**
     * Obter progresso de XP (0 a 1)
     */
    getXpProgress(): { current: number; required: number; percentage: number } {
        const required = this.getXpRequired();
        return {
            current: this.currentXp,
            required,
            percentage: this.currentXp / required
        };
    }

    /**
     * Registrar callback quando subir de nível
     */
    onLevelUp(callback: () => void): void {
        this.onLevelUpCallbacks.push(callback);
    }

    /**
     * Resetar (nova partida)
     */
    reset(): void {
        this.currentLevel = 1;
        this.currentXp = 0;
        this.onLevelUpCallbacks = [];
    }
}
