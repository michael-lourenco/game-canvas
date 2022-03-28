const canvas = document.querySelector('canvas');

const c = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;
class Player {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }

    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    }
}

class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    }

    update() {
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    }

    update() {
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

const x = canvas.width / 2;
const y = canvas.height / 2;

const player = new Player(x, y, 30, 'blue');

const projectiles = [];

const enemies = [];

function spawnEnemies() {
    setInterval(() => {
        const radius = 10 +( Math.random() * 30);
        let x;
        let y;
        let color;

        if(Math.random() < 0.5){
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
            y = Math.random() * canvas.height;
            color = 'green';
        } else {
            x = Math.random() * canvas.width;
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
            color = 'blue';
        }

        const angleToCenter = Math.atan2(
            canvas.height / 2 -y, 
            canvas.width / 2 -x
        ); 

        const velocity = {
            x: Math.cos(angleToCenter) * 5,
            y: Math.sin(angleToCenter) * 5
        }
    
        const enemy = new Enemy(x, y, radius, color, velocity);
        enemies.push(enemy);
        console.log(enemy)
    }, 1000);
}


function animate() {
    requestAnimationFrame(animate);
    c.clearRect(0, 0, canvas.width, canvas.height);
    player.draw();

    projectiles.forEach((projectile) => {
        projectile.update();
    })

    enemies.forEach((enemy) => {
        enemy.update();

        projectiles.forEach((projectile) => {
            // hypot - distance between two points
            const distanceBetween = Math.hypot(
                projectile.x - enemy.x, 
                projectile.y - enemy.y
                ) 
                
            //objects touch
            if(distanceBetween < enemy.radius + projectile.radius) {
                setTimeout(() => {
                    enemies.splice(enemies.indexOf(enemy), 1);
                    projectiles.splice(projectiles.indexOf(projectile), 1);
                }, 0); // use setTimeout to remove the effect of flash object after the animation
            }
        })
    })
}

window.addEventListener('click', (event) =>{
    console.log(event.clientX, event.clientY);  

    const angle = Math.atan2(event.clientY - canvas.height / 2, event.clientX - canvas.width / 2); 

    const velocity = {
        x: Math.cos(angle) * 10,
        y: Math.sin(angle) * 10
    }

    projectiles.push(
        new Projectile(
            canvas.width / 2, 
            canvas.height / 2, 
            5, 
            'red', 
            velocity
        )
    )
})

animate();
spawnEnemies();
