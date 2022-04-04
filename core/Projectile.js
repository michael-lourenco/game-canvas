class Projectile {
    constructor(context, x, y, velocity, { 
    name,
    pierce,
    attack,
    color,
    cooldown,
    radius,
    }) {
        this.context = context;
        this.x = x;
        this.y = y;

        this.velocity = velocity;

        this.attack = attack;
        this.color = color;
        this.cooldown = cooldown;
        this.name = name;
        this.pierce = pierce;
        this.radius = radius;

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

    doDamage() {
        return this.attack;
    }
}

export { Projectile };
