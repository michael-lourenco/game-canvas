
// canvas and context
const canvas = document.querySelector('canvas');

const context = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;

// html elements
const score = document.querySelector('#score');
const startGameButton = document.querySelector('#startGameButton');
const containerStart = document.querySelector('#containerStart');
const scoreStartText = document.querySelector('#scoreStartText');


// center coordinates x and y on screen/canvas
const middleScreenX = canvas.width / 2;
const middleScreenY = canvas.height / 2;

// initial data for game objects
let player = new Player(middleScreenX, middleScreenY, 10, 'white');
let projectiles = [];
let particles = [];
let enemies = [];

function init() {
    // reset data
    player = new Player(middleScreenX, middleScreenY, 10, 'white');
    projectiles = [];
    particles = [];
    enemies = [];
    scoreValue = 0;

    // reset html elements
    score.innerHTML = scoreValue;
    scoreStartText.innerHTML = scoreValue;
}

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
    }, 1000);
}

let animationId;
let scoreValue = 0;

function animate() {
    animationId = requestAnimationFrame(animate);
    
    context.fillStyle = 'rgb(0,0,0,0.3)';
    context.fillRect(0, 0, canvas.width, canvas.height);

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
                    // removing projectile from array
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
                //'END GAME - THE PLAYER HAS HITTED'
                cancelAnimationFrame(animationId);
                scoreStartText.innerHTML = scoreValue;
                containerStart.style.display = 'flex';
                
            }, 0); // use setTimeout to remove the effect of flash object after the animation
        }  

        projectiles.forEach((projectile) => {
            // hypot - distance between two points (enemy and projectile)
            const distanceBetweenProjectile = Math.hypot(
                projectile.x - enemy.x, 
                projectile.y - enemy.y
            );
                
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
                    });

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
    );
})

startGameButton.addEventListener('click', () => {
    init();
    animate();
    spawnEnemies();
    containerStart.style.display = 'none';
});
