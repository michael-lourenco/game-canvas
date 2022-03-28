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

const player = new Player(x, y, 10, 'white');

const projectiles = [];

const enemies = [];

function spawnEnemies() {
    setInterval(() => {
        const radius = 10 +( Math.random() * 30);
        let x;
        let y;


        if(Math.random() < 0.5){
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
            y = Math.random() * canvas.height;
        } else {
            x = Math.random() * canvas.width;
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
        }

        const color = `hsla(${ Math.random() * 360 }, 100%, 50%, 1)`; // random color

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

let animationId;

function animate() {
    animationId = requestAnimationFrame(animate);
    c.fillStyle = 'rgb(0,0,0,0.3)';
    c.fillRect(0, 0, canvas.width, canvas.height);
    player.draw();

    projectiles.forEach((projectile) => {
        projectile.update();

        // remove projectile if it goes out of bounds
        if(projectile.x + projectile.radius < 0  || 
            projectile.x - projectile.radius > canvas.width || 
            projectile.y + projectile.radius < 0 || 
            projectile.y - projectile.radius > canvas.height) {
                setTimeout(() => {
                    console.log('removing projectile')
                    projectiles.splice(projectiles.indexOf(projectile), 1);
                }); // use setTimeout to remove the effect of flash object after the animation
        }
    })

    enemies.forEach((enemy) => {
        enemy.update();

        // hypot - distance between two points (enemy and player)
        const distanceBetweenPlayer = Math.hypot(
            player.x - enemy.x, 
            player.y - enemy.y
        );

        //objects touch (enemy and player)
        if(distanceBetweenPlayer < enemy.radius + player.radius -5) {
            setTimeout(() => {
                console.log('END GAME - THE PLAYER HAS HITTED')
                cancelAnimationFrame(animationId);
            }, 0); // use setTimeout to remove the effect of flash object after the animation
        }  

        projectiles.forEach((projectile) => {
            // hypot - distance between two points (enemy and projectile)
            const distanceBetweenProjectile = Math.hypot(
                projectile.x - enemy.x, 
                projectile.y - enemy.y
                ) 
                
            //objects touch (enemy and projectile)
            if(distanceBetweenProjectile < enemy.radius + projectile.radius -5) {
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
            'white', 
            velocity
        )
    )
})

animate();
spawnEnemies();
