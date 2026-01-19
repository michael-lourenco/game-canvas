import { inGameShopSkills, InGameShopSkill } from '../data/inGameShop';
import { dataProjectile } from '../data/projectiles';

/**
 * Gerencia loja de skills durante a partida (compra com points)
 */
export class InGameShopManager {
    private purchasedSkills: Set<number> = new Set([0]); // Gun (0) sempre disponível
    private currentPoints: number = 0;

    /**
     * Resetar para nova partida
     */
    reset(): void {
        this.purchasedSkills.clear();
        this.purchasedSkills.add(0); // Gun sempre disponível
        this.currentPoints = 0;
    }

    /**
     * Atualizar points disponíveis
     */
    updatePoints(points: number): void {
        this.currentPoints = points;
    }

    /**
     * Comprar skill
     * @returns true se comprou com sucesso
     */
    purchaseSkill(skillId: number): boolean {
        // Verificar se já foi comprada
        if (this.purchasedSkills.has(skillId)) {
            return false; // Já comprada
        }

        // Encontrar skill na loja
        const shopSkill = inGameShopSkills.find(s => s.id === skillId);
        if (!shopSkill) {
            return false; // Skill não encontrada na loja
        }

        // Verificar se tem points suficientes
        if (this.currentPoints < shopSkill.cost) {
            return false; // Sem points suficientes
        }

        // Comprar skill
        this.currentPoints -= shopSkill.cost;
        this.purchasedSkills.add(skillId);

        // Adicionar skill ao dataProjectile
        dataProjectile[skillId] = { ...shopSkill.config };

        return true;
    }

    /**
     * Verificar se pode comprar skill
     */
    canAfford(skillId: number): boolean {
        const shopSkill = inGameShopSkills.find(s => s.id === skillId);
        if (!shopSkill) return false;
        return this.currentPoints >= shopSkill.cost;
    }

    /**
     * Verificar se skill foi comprada
     */
    isPurchased(skillId: number): boolean {
        return this.purchasedSkills.has(skillId);
    }

    /**
     * Obter skills disponíveis para compra (não compradas)
     */
    getAvailableSkills(): InGameShopSkill[] {
        return inGameShopSkills.filter(skill => !this.isPurchased(skill.id));
    }

    /**
     * Obter skills já compradas
     */
    getPurchasedSkills(): number[] {
        return Array.from(this.purchasedSkills);
    }

    /**
     * Obter points atuais
     */
    getCurrentPoints(): number {
        return this.currentPoints;
    }
}
