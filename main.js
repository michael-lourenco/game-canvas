import { Canvas } from "./core/Canvas.js";
import { FRICTION } from "./env/index.js";
import { Player } from "./core/Player.js";
import { Enemy } from "./core/Enemy.js";
import { Particle } from "./core/Particle.js";
import { Projectile } from "./core/Projectile.js";
// canvas and context
//const canvas = document.querySelector('canvas');

// create the canvas and reporting list
let canvas = new Canvas('myCanvas', document.body, window.innerWidth, window.innerHeight);
canvas.create();

const { context } = canvas;

// html elements
const score = document.querySelector('#score');
const startGameButton = document.querySelector('#startGameButton');
const containerStart = document.querySelector('#containerStart');
const scoreStartText = document.querySelector('#scoreStartText');

// center coordinates x and y on screen/canvas
const MIDDLE_SCREEN_X = canvas.width / 2;
const MIDDLE_SCREEN_Y = canvas.height / 2;

// initial data for game objects
let player = new Player(context, MIDDLE_SCREEN_X, MIDDLE_SCREEN_Y, 10, 'white');
let projectiles = [];
let particles = [];
let enemies = [];
let animationId;
let scoreValue = 0;


function resetData() {
    player = new Player(context, MIDDLE_SCREEN_X, MIDDLE_SCREEN_Y, 10, 'white');
    projectiles = [];
    particles = [];
    enemies = [];
    scoreValue = 0;
}

function resetHtmlElements() {
    score.innerHTML = scoreValue;
    scoreStartText.innerHTML = scoreValue;
}

function init() {
    resetData()
    resetHtmlElements();
}

function luckCoin() {
    return Math.random() < 0.5 ? -1 : 1;
}

function randomColor() {
    return `hsla(${ Math.random() * 360 }, 50%, 50%, 1)`;
}

function spawnEnemies() {
    setInterval(() => {
        const radius = 10 +( Math.random() * 30);
        let x;
        let y;


        if(luckCoin()){
            x = luckCoin() ? 0 - radius : canvas.width + radius;
            y = Math.random() * canvas.height;
        } else {
            x = Math.random() * canvas.width;
            y = luckCoin() ? 0 - radius : canvas.height + radius;
        }

        const color = randomColor();

        const angleToCenter = Math.atan2(
            canvas.height / 2 -y, 
            canvas.width / 2 -x
        ); 

        const velocity = {
            x: Math.cos(angleToCenter) * 5,
            y: Math.sin(angleToCenter) * 5
        }
    
        const enemy = new Enemy(context, x, y, radius, color, velocity);
        enemies.push(enemy);
    }, 1000);
}

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
                //'end game - the player has hitted'
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
                        context,
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

window.addEventListener('click', (event) => {
    const angle = Math.atan2(event.clientY - canvas.height / 2, event.clientX - canvas.width / 2); 

    const velocity = {
        x: Math.cos(angle) * 10,
        y: Math.sin(angle) * 10
    }

    projectiles.push(
        new Projectile(
            context,
            canvas.width / 2, 
            canvas.height / 2, 
            5, 
            'white', 
            velocity,
            FRICTION
        )
    );
});

startGameButton.addEventListener('click', () => {
    init();
    animate();
    spawnEnemies();
    containerStart.style.display = 'none';
});
