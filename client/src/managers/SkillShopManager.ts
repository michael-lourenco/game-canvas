import { ShopSkill, shopSkills } from '../data/skillShop';
import { UnlockManager } from './UnlockManager';

/**
 * Gerencia loja de skills dentro da partida (usando points)
 */
export class SkillShopManager {
    private availableSkills: ShopSkill[] = [];
    private purchasedSkills: number[] = []; // IDs de skills compradas
    private unlockManager: UnlockManager;
    private currentPoints: number = 0;

    constructor(unlockManager: UnlockManager) {
        this.unlockManager = unlockManager;
        this.initializeShop();
    }

    /**
     * Inicializar loja para nova partida
     */
    initializeShop(): void {
        // Resetar skills compradas
        this.purchasedSkills = [];

        // Verificar quais skills estão desbloqueadas (meta progressão)
        this.availableSkills = shopSkills.map(skill => ({
            ...skill,
            unlocked: this.unlockManager.isSkillUnlocked(skill.id),
            available: true, // Iniciar como disponível se desbloqueado
        }));

        // Filtrar apenas skills desbloqueadas e disponíveis
        this.availableSkills = this.availableSkills.filter(skill => skill.unlocked && skill.available);
    }

    /**
     * Atualizar pontos disponíveis
     */
    updatePoints(points: number): void {
        this.currentPoints = points;
    }

    /**
     * Comprar skill
     * @returns true se comprou com sucesso, false caso contrário
     */
    purchaseSkill(skillId: number): boolean {
        const skill = this.availableSkills.find(s => s.id === skillId);

        // Verificar se skill existe e está disponível
        if (!skill || !skill.available) {
            return false;
        }

        // Verificar se já foi comprada
        if (this.purchasedSkills.includes(skillId)) {
            return false; // Já comprada
        }

        // Verificar se tem points suficientes
        if (this.currentPoints < skill.cost) {
            return false; // Sem points suficientes
        }

        // Comprar skill
        this.currentPoints -= skill.cost;
        this.purchasedSkills.push(skillId);

        return true;
    }

    /**
     * Verificar se pode comprar skill
     */
    canAfford(skillId: number): boolean {
        const skill = this.availableSkills.find(s => s.id === skillId);
        if (!skill) return false;
        return this.currentPoints >= skill.cost;
    }

    /**
     * Verificar se skill foi comprada
     */
    isPurchased(skillId: number): boolean {
        return this.purchasedSkills.includes(skillId);
    }

    /**
     * Obter skills disponíveis para compra
     */
    getAvailableSkills(): ShopSkill[] {
        return this.availableSkills.filter(skill => !this.isPurchased(skill.id));
    }

    /**
     * Obter skills já compradas
     */
    getPurchasedSkills(): number[] {
        return [...this.purchasedSkills];
    }

    /**
     * Obter pontos atuais
     */
    getCurrentPoints(): number {
        return this.currentPoints;
    }

    /**
     * Resetar para nova partida
     */
    reset(): void {
        this.purchasedSkills = [];
        this.currentPoints = 0;
        this.initializeShop();
    }
}
