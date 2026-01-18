export interface ProjectileData {
    name: string;
    pierce: number;
    attack: number;
    color: string;
    cooldown: number;
    radius: number;
    velocity_factor: number;
    currentCoolDown?: number;
}

export interface Velocity {
    x: number;
    y: number;
}

export class Projectile {
    public context: CanvasRenderingContext2D;
    public x: number;
    public y: number;
    public velocity: Velocity;
    public attack: number;
    public color: string;
    public cooldown: number;
    public name: string;
    public pierce: number;
    public radius: number;

    constructor(
        context: CanvasRenderingContext2D,
        x: number,
        y: number,
        velocity: Velocity,
        data: ProjectileData
    ) {
        this.context = context;
        this.x = x;
        this.y = y;
        this.velocity = velocity;
        this.attack = data.attack;
        this.color = data.color;
        this.cooldown = data.cooldown;
        this.name = data.name;
        this.pierce = data.pierce;
        this.radius = data.radius;
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

    doDamage(): number {
        return this.attack;
    }
}
