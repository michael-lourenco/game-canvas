import { CONFIG } from "./env/index.js";
import {
    createLuckCoin,
    createRandomColor,
    createAngleToCenter,
    createInitialPosition,
    createVelocity
} from "./utils/index.js";
import { 
    Canvas, 
    Enemy, 
    Particle, 
    Player, 
    Projectile 
} from "./core/index.js";

const { 
    CANVAS, 
    ENEMY_INITIAL,
    FRICTION, 
    GAME_STATUS, 
    PLAYER_INITIAL, 
    PROJECTILE_INITIAL,
    SCORE_INITIAL, 
} = CONFIG;

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
    spawnEnemies(context, canvas, enemies);
}

function spawnEnemies(contextToHandle, canvasToHandle, enemiesArray) {
    let refreshIntervalId = setInterval(() => {
        if(gameStatus === GAME_STATUS.START){
            const radius = 10 + ( Math.random() * 30);
 
            const initialPosition = createInitialPosition(
                createLuckCoin(),
                createLuckCoin(),
                radius, 
                canvasToHandle.width, 
                canvasToHandle.height
            );
    
            const color = createRandomColor();
    
            const angleToCenter = createAngleToCenter(
                canvasToHandle.width,
                canvasToHandle.height, 
                initialPosition.x,
                initialPosition.y, 
            ); 

            const velocity = createVelocity(angleToCenter, ENEMY_INITIAL.VELOCITY_FACTOR);
        
            const enemy = new Enemy(
                contextToHandle, 
                initialPosition.x, 
                initialPosition.y, 
                radius, 
                color, 
                velocity
            );

            enemiesArray.push(enemy);
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
                            x: (Math.random() - 0.5) * (Math.random() * 3),
                            y: (Math.random() - 0.5) * (Math.random() * 3)
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

    const velocity = createVelocity(angle, PROJECTILE_INITIAL.VELOCITY_FACTOR);

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
