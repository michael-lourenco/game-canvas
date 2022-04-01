import { dataEnemy } from './data/enemy.js';
import { CONFIG } from "./env/index.js";
import {
    createLuckCoin,
    createRandomColor,
    createAngleToCenter,
    createInitialPosition,
    createRandomIntegerBetweenTwoNumbers,
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
    PARTICLE_INITIAL,
    PLAYER_INITIAL, 
    PROJECTILE_INITIAL,
    ECONOMY_INITIAL, 
} = CONFIG;

// CREATE THE CANVAS
let canvas = new Canvas('gameCanvas', document.body, window.innerWidth, window.innerHeight);
canvas.create();

const { context } = canvas;

// HTML ELEMENTS
const score = document.querySelector('#score');
const xp = document.querySelector('#xp');
const startGameButton = document.querySelector('#startGameButton');
const containerStart = document.querySelector('#containerStart');
const scoreStartText = document.querySelector('#scoreStartText');
const xpStartText = document.querySelector('#xpStartText');

// CREATE COORDINATES X AND Y ON SCREENV/CANVAS
const MIDDLE_SCREEN_X = canvas.width / 2;
const MIDDLE_SCREEN_Y = canvas.height / 2;

// INIITAL DATA FOR GAME OBJECTS
let player = new Player(context, MIDDLE_SCREEN_X, MIDDLE_SCREEN_Y, PLAYER_INITIAL.RADIUS, PLAYER_INITIAL.COLOR);
let projectiles = [];
let particles = [];
let enemies = [];
let animationId;
let scoreValue = ECONOMY_INITIAL.SCORE;
let xpValue = ECONOMY_INITIAL.XP;
let gameStatus = GAME_STATUS.START;

// DATA
function resetData() {
    player = new Player(context, MIDDLE_SCREEN_X, MIDDLE_SCREEN_Y, PLAYER_INITIAL.RADIUS, PLAYER_INITIAL.COLOR);
    projectiles = [];
    particles = [];
    enemies = [];
    scoreValue = ECONOMY_INITIAL.SCORE;
    xpValue = ECONOMY_INITIAL.XP;
    gameStatus = GAME_STATUS.START;
}

// ELEMENTS HTML
function resetHtmlElements() {
    containerStart.style.display = 'none';
    score.innerHTML = ECONOMY_INITIAL.SCORE;
    xp.innerHTML = ECONOMY_INITIAL.XP;
    scoreStartText.innerHTML = ECONOMY_INITIAL.SCORE;
    xpStartText.innerHTML = ECONOMY_INITIAL.XP;
}

function init() {
    resetData()
    resetHtmlElements();
    animate();
    spawnEnemies(context, canvas, enemies, dataEnemy);
}

// HANDLERS
function spawnEnemies(contextToHandle, canvasToHandle, enemiesArray, enemyData) {
    let refreshIntervalId = setInterval(() => {
        if(gameStatus === GAME_STATUS.START) {

            const chooseRandomEnemy = createRandomIntegerBetweenTwoNumbers(0, 2);

            const enemyDataChoosed = enemyData[chooseRandomEnemy]
            console.log(' Random enemy choosed: ', enemyDataChoosed);
 
            const initialPosition = createInitialPosition(
                createLuckCoin(),
                createLuckCoin(),
                enemyDataChoosed.radius, 
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

            const velocity = createVelocity(angleToCenter, enemyDataChoosed.velocity_factor);
        
            const enemy = new Enemy(
                contextToHandle, 
                initialPosition.x, 
                initialPosition.y,  
                velocity,
                enemyDataChoosed
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
                xpStartText.innerHTML = xpValue;
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
                for (let i = 0; i < enemy.radius * PARTICLE_INITIAL.MULTIPLY_FACTOR; i++) {
                    particlesToHandle.push(new Particle(
                        contextToHandle,
                        projectile.x,
                        projectile.y,
                        Math.random() * PARTICLE_INITIAL.MULTIPLY_RADIUS_FACTOR,
                        enemy.color,
                        {
                            x: (Math.random() - 0.5) * (Math.random() * PARTICLE_INITIAL.VELOCITY_FACTOR),
                            y: (Math.random() - 0.5) * (Math.random() * PARTICLE_INITIAL.VELOCITY_FACTOR)
                        },
                        FRICTION
                    ))
                }

                enemy.takeDamage(1);

                if(!enemy.isDead()) {

                    console.log(`${ enemy.name } recived damage and has ${ enemy.currentHp } hp`);

                    setTimeout(() => {
                        projectilesToHandle.splice(projectilesToHandle.indexOf(projectile), 1);
                    }, 0); // use setTimeout to remove the effect of flash object after the animation
                } else {
                    // increase our score
                    scoreValue += enemy.value;
                    score.innerHTML = scoreValue;

                    // increase our xp
                    xpValue += enemy.xp;
                    xp.innerHTML = xpValue;
                    
                    // remove from scene altogether
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

// UTILS
function changeGameObjectRadius(gameObjectToHandle, radiusToChange) {
    gsap.to(gameObjectToHandle, {
        radius: gameObjectToHandle.radius - radiusToChange,
    });
}

// CORE FUNCTION ANIMATE
function animate() {
    animationId = requestAnimationFrame(animate);
    
    handleCanvas(canvas);

    handlePlayer(player);

    handleParticles(particles);

    handleProjectiles(projectiles);

    handleEnemies(context, enemies, particles, player, projectiles)

}

// INTERACTION
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
