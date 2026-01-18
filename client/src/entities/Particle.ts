export interface Velocity {
    x: number;
    y: number;
}

export class Particle {
    public context: CanvasRenderingContext2D;
    public x: number;
    public y: number;
    public radius: number;
    public color: string;
    public velocity: Velocity;
    public alpha: number;
    public friction: number;

    constructor(
        context: CanvasRenderingContext2D,
        x: number,
        y: number,
        radius: number,
        color: string,
        velocity: Velocity,
        friction: number
    ) {
        this.context = context;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
        this.friction = friction;
    }

    draw() {
        this.context.save();
        this.context.globalAlpha = this.alpha;
        this.context.beginPath();
        this.context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.context.fillStyle = this.color;
        this.context.fill();
        this.context.restore();
    }

    update() {
        this.draw();
        this.velocity.x *= this.friction;
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
        this.alpha -= 0.01;
    }
}
