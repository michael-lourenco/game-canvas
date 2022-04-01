
class Enemy {
    constructor(context, x, y, radius, velocity, { color, name, hp, attack, value, xp }) {
        this.context = context;
        
        this.x = x;
        this.y = y;

        this.radius = radius;
        this.color = color;

        this.velocity = velocity;

        this.name = name;

        this.maxHp = hp;
        this.currentHp  = hp;
        
        this.attack = attack;

        this.value = value;
        this.xp = xp;
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

    isDead() {
        return this.currentHp <= 0;
    }

    takeDamage(damage) {
        this.currentHp = this.currentHp - damage;
    }

    doDamage() {
        return this.attack;
    }
}

export { Enemy };
