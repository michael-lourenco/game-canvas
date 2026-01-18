export interface EnemyData {
    color: string;
    name: string;
    hp: number;
    attack: number;
    value: number;
    xp: number;
    radius: number;
}

export interface Velocity {
    x: number;
    y: number;
}

export class Enemy {
    public context: CanvasRenderingContext2D;
    public x: number;
    public y: number;
    public radius: number;
    public color: string;
    public velocity: Velocity;
    public name: string;
    public maxHp: number;
    public currentHp: number;
    public attack: number;
    public value: number;
    public xp: number;

    constructor(
        context: CanvasRenderingContext2D,
        x: number,
        y: number,
        velocity: Velocity,
        data: EnemyData
    ) {
        this.context = context;
        this.x = x;
        this.y = y;
        this.radius = data.radius;
        this.color = data.color;
        this.velocity = velocity;
        this.name = data.name;
        this.maxHp = data.hp;
        this.currentHp = data.hp;
        this.attack = data.attack;
        this.value = data.value;
        this.xp = data.xp;
    }

    draw() {
        this.context.beginPath();
        this.context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.context.fillStyle = this.color;
        this.context.fill();
    }

    update() {
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }

    isDead(): boolean {
        return this.currentHp <= 0;
    }

    takeDamage(damage: number) {
        this.currentHp = this.currentHp - damage;
    }

    doDamage(): number {
        return this.attack;
    }
}
