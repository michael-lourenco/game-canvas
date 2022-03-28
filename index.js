const canvas = document.querySelector('canvas');

const c = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;

const score = document.querySelector('#score');
const startGameButton = document.querySelector('#startGameButton');
const containerStart = document.querySelector('#containerStart');
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

const friction = 0.99;

class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
    }

    draw() {
        c.save();
        c.globalAlpha = this.alpha;
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
        c.restore();
    }

    update() {
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
        this.alpha -= 0.01;
    }
}

const x = canvas.width / 2;
const y = canvas.height / 2;

const player = new Player(x, y, 10, 'white');

const projectiles = [];
const particles = [];
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

        const color = `hsla(${ Math.random() * 360 }, 50%, 50%, 1)`; // random color

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
let scoreValue = 0;

function animate() {
    animationId = requestAnimationFrame(animate);
    c.fillStyle = 'rgb(0,0,0,0.3)';
    c.fillRect(0, 0, canvas.width, canvas.height);
    player.draw();

    particles.forEach(particle => {
        if(particle.alpha <= 0){
            particles.splice(particles.indexOf(particle), 1);
        } else{
            particle.update();
        }
    })

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
                containerStart.style.display = 'flex';
                containerStart.style.opacity = 1;
                containerStart.style.zIndex = 100;
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

                //create explosions
                for (let i =0; i < enemy.radius * 2; i++) {
                    particles.push(new Particle(
                        projectile.x,
                        projectile.y,
                        Math.random() * 2,
                        enemy.color,
                        {
                            x: (Math.random() - 0.5) * (Math.random() * 6),
                            y: (Math.random() - 0.5) * (Math.random() * 6)
                        }
                    ))
                }

                if(enemy.radius - 10 > 5) {
                    // increase our score
                    scoreValue += 100;
                    score.innerHTML = scoreValue;

                    gsap.to(enemy, {
                        radius: enemy.radius -10,
                    })
                    setTimeout(() => {
                        projectiles.splice(projectiles.indexOf(projectile), 1);
                    }, 0); // use setTimeout to remove the effect of flash object after the animation
                } else {
                    // remove from scene altogether
                    scoreValue += 250;
                    score.innerHTML = scoreValue;
                    setTimeout(() => {
                        enemies.splice(enemies.indexOf(enemy), 1);
                        projectiles.splice(projectiles.indexOf(projectile), 1);
                    }, 0); // use setTimeout to remove the effect of flash object after the animation
                }
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

startGameButton.addEventListener('click', () => {
    containerStart.style.display = 'none';
    containerStart.style.opacity = 0;
    containerStart.style.zIndex = -1;
    animate();
    spawnEnemies();
})
