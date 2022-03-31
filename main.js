import { CONFIG } from "./env/index.js";
import { Canvas } from "./core/Canvas.js";
import { Player } from "./core/Player.js";
import { Enemy } from "./core/Enemy.js";
import { Particle } from "./core/Particle.js";
import { Projectile } from "./core/Projectile.js";

const { CANVAS, FRICTION, GAME_STATUS, PLAYER_INITIAL, SCORE_INITIAL, PROJECTILE_INITIAL } = CONFIG;

// create the canvas
let canvas = new Canvas('gameCanvas', document.body, window.innerWidth, window.innerHeight);
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
let player = new Player(context, MIDDLE_SCREEN_X, MIDDLE_SCREEN_Y, PLAYER_INITIAL.RADIUS, PLAYER_INITIAL.COLOR);
let projectiles = [];
let particles = [];
let enemies = [];
let animationId;
let scoreValue = SCORE_INITIAL.VALUE;
let gameStatus = GAME_STATUS.START;

function resetData() {
    player = new Player(context, MIDDLE_SCREEN_X, MIDDLE_SCREEN_Y, PLAYER_INITIAL.RADIUS, PLAYER_INITIAL.COLOR);
    projectiles = [];
    particles = [];
    enemies = [];
    scoreValue = SCORE_INITIAL.VALUE;
    gameStatus = GAME_STATUS.START;
}

function resetHtmlElements() {
    containerStart.style.display = 'none';
    score.innerHTML = SCORE_INITIAL.VALUE;
    scoreStartText.innerHTML = SCORE_INITIAL.VALUE;
}

function init() {
    resetData()
    resetHtmlElements();
    animate();
    spawnEnemies();
}

function luckCoin() {
    return Math.random() < 0.5 ? -1 : 1;
}

function randomColor() {
    return `hsla(${ Math.random() * 360 }, 50%, 50%, 1)`;
}

function spawnEnemies() {
    let refreshIntervalId = setInterval(() => {
        if(gameStatus === GAME_STATUS.START){
                console.log('gameStatus: ', gameStatus);
            console.log('CHAMOU');

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
        } else {
            clearInterval(refreshIntervalId);
        }
    }, 1000);
}

function handleParticles(particlesToHandle) {
    particlesToHandle.forEach(particle => {
        if(particle.alpha <= 0){
            particlesToHandle.splice(particlesToHandle.indexOf(particle), 1);
        } else{
            particle.update();
        }
    })
}

function handleProjectiles(projectilesToHandle) {
    projectilesToHandle.forEach((projectile) => {
        projectile.update();

        // remove projectile if it goes out of bounds
        if(projectile.x + projectile.radius < 0  || 
            projectile.x - projectile.radius > canvas.width || 
            projectile.y + projectile.radius < 0 || 
            projectile.y - projectile.radius > canvas.height) {
                setTimeout(() => {
                    // removing projectile from array
                    projectilesToHandle.splice(projectilesToHandle.indexOf(projectile), 1);
                }); // use setTimeout to remove the effect of flash object after the animation
        }
    })
}

function handleEnemies(contextToHandle, enemiesToHandle, particlesToHandle, playerToHandle, projectilesToHandle) {
    enemiesToHandle.forEach((enemy) => {
        enemy.update();

        // hypot - distance between two points (enemy and player)
        const distanceBetweenPlayer = Math.hypot(
            playerToHandle.x - enemy.x, 
            playerToHandle.y - enemy.y
        );

        //objects touch (enemy and player)
        if(distanceBetweenPlayer < enemy.radius + playerToHandle.radius -5) {
            setTimeout(() => {
                //'end game - the player has hitted'
                cancelAnimationFrame(animationId);
                scoreStartText.innerHTML = scoreValue;
                containerStart.style.display = 'flex';
                gameStatus = GAME_STATUS.END;
                console.log('gameStatus: ', gameStatus);
                
            }, 0); // use setTimeout to remove the effect of flash object after the animation
        }  

        projectilesToHandle.forEach((projectile) => {
            // hypot - distance between two points (enemy and projectile)
            const distanceBetweenProjectile = Math.hypot(
                projectile.x - enemy.x, 
                projectile.y - enemy.y
            );
                
            //objects touch (enemy and projectile)
            if(distanceBetweenProjectile < enemy.radius + projectile.radius -5) {
                //create explosions
                for (let i =0; i < enemy.radius * 2; i++) {
                    particlesToHandle.push(new Particle(
                        contextToHandle,
                        projectile.x,
                        projectile.y,
                        Math.random() * 2,
                        enemy.color,
                        {
                            x: (Math.random() - 0.5) * (Math.random() * 6),
                            y: (Math.random() - 0.5) * (Math.random() * 6)
                        },
                        FRICTION
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
                        projectilesToHandle.splice(projectilesToHandle.indexOf(projectile), 1);
                    }, 0); // use setTimeout to remove the effect of flash object after the animation
                } else {
                    // remove from scene altogether
                    scoreValue += 250;
                    score.innerHTML = scoreValue;
                    setTimeout(() => {
                        enemiesToHandle.splice(enemiesToHandle.indexOf(enemy), 1);
                        projectilesToHandle.splice(projectilesToHandle.indexOf(projectile), 1);
                    }, 0); // use setTimeout to remove the effect of flash object after the animation
                }
            }
        })
    })
}

function handleCanvas(canvasToHandle) {
    const { context, width, height} = canvasToHandle;
    
    context.fillStyle = CANVAS.RGB;
    context.fillRect(0, 0, width, height);
}

function handlePlayer(playerToHandle) {
    playerToHandle.draw();
}

function animate() {
    animationId = requestAnimationFrame(animate);
    
    handleCanvas(canvas);

    handlePlayer(player);

    handleParticles(particles);

    handleProjectiles(projectiles);

    handleEnemies(context, enemies, particles, player, projectiles)

}

window.addEventListener('click', (event) => {
    const angle = Math.atan2(event.clientY - canvas.height / 2, event.clientX - canvas.width / 2); 

    const velocity = {
        x: Math.cos(angle) * 8,
        y: Math.sin(angle) * 8
    }

    projectiles.push(
        new Projectile(
            context,
            canvas.width / 2, 
            canvas.height / 2, 
            PROJECTILE_INITIAL.RADIUS, 
            PROJECTILE_INITIAL.COLOR, 
            velocity
        )
    );
});

startGameButton.addEventListener('click', () => {
    init();
});
