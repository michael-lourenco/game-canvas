import { dataEnemy } from './data/enemy.js';
import { dataProjectile } from './data/projectile.js';
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
    FRICTION, 
    GAME_STATUS, 
    PARTICLE_INITIAL,
    PLAYER_INITIAL, 
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
const qGameButton = document.querySelector('#qGameButton');
const wGameButton = document.querySelector('#wGameButton');
const eGameButton = document.querySelector('#eGameButton');
const rGameButton = document.querySelector('#rGameButton');
const qGameTimer = document.querySelector('#qGameTimer');
const wGameTimer = document.querySelector('#wGameTimer');
const eGameTimer = document.querySelector('#eGameTimer');
const rGameTimer = document.querySelector('#rGameTimer');

const containerStart = document.querySelector('#containerStart');
const scoreStartText = document.querySelector('#scoreStartText');
const xpStartText = document.querySelector('#xpStartText');

// CREATE COORDINATES X AND Y ON SCREEN / CANVAS
const MIDDLE_SCREEN_X = canvas.width / 2;
const MIDDLE_SCREEN_Y = canvas.height / 2;

// INIITAL DATA FOR GAME OBJECTS
let player = new Player(context, MIDDLE_SCREEN_X, MIDDLE_SCREEN_Y, PLAYER_INITIAL.RADIUS, PLAYER_INITIAL.COLOR);
let projectiles = [];
let particles = [];
let enemies = [];
let projectileToFire = dataProjectile[0];
let animationId;
let scoreValue = ECONOMY_INITIAL.SCORE;
let xpValue = ECONOMY_INITIAL.XP;
let gameStatus = GAME_STATUS.START;
let canFire = false;

let qCooldown = 0;
let wCooldown = 0;
let eCooldown = 0;
let rCooldown = 0;

// colors of buttons status
const BUTTON_IN_COOLDOWN_COLOR = '#203060';
const BUTTON_CANFIRE_COLOR = '#20f020';
const BUTTON_CHOOSED_COLOR = '#F02020';
const BUTTON_STANDARD_COLOR = '#203060';

// DATA
function resetData() {
    player = new Player(context, MIDDLE_SCREEN_X, MIDDLE_SCREEN_Y, PLAYER_INITIAL.RADIUS, PLAYER_INITIAL.COLOR);
    projectiles = [];
    particles = [];
    enemies = [];
    scoreValue = ECONOMY_INITIAL.SCORE;
    xpValue = ECONOMY_INITIAL.XP;
    gameStatus = GAME_STATUS.START;
    canFire = false;
    qCooldown = 0;
    wCooldown = 0;
    eCooldown = 0;
    rCooldown = 0;
}

// ELEMENTS HTML
function resetHtmlElements() {
    containerStart.style.display = 'none';
    score.innerHTML = ECONOMY_INITIAL.SCORE;
    xp.innerHTML = ECONOMY_INITIAL.XP;
    scoreStartText.innerHTML = ECONOMY_INITIAL.SCORE;
    xpStartText.innerHTML = ECONOMY_INITIAL.XP;
    qGameButton.innerHTML = dataProjectile[0].name;
    wGameButton.innerHTML = dataProjectile[1].name;
    eGameButton.innerHTML = dataProjectile[2].name;
    rGameButton.innerHTML = dataProjectile[3].name;
}

// PLAYER
function handlePlayer(playerToHandle) {
    playerToHandle.draw();
}

// ENEMY
function spawnEnemies(contextToHandle, canvasToHandle, enemiesArray, enemyData) {
    let refreshIntervalId = setInterval(() => {
        if(gameStatus === GAME_STATUS.START) {

            const chooseRandomEnemy = createRandomIntegerBetweenTwoNumbers(0, 2);

            const enemyDataChoosed = enemyData[chooseRandomEnemy];

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

function handleEnemies(contextToHandle, enemiesToHandle, particlesToHandle, playerToHandle, projectilesToHandle) {
    enemiesToHandle.forEach((enemy) => {
        enemy.update();

        if(haveCollision(playerToHandle, enemy)) {
            setTimeout(() => {
                endGame();                
            }, 0); // use setTimeout to remove the effect of flash object after the animation
        }  

        projectilesToHandle.forEach((projectile) => {

            if(haveCollision(projectile, enemy)) {
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

                enemy.takeDamage(projectile.doDamage());

                if(!enemy.isDead()) {

                    console.log(`${ enemy.name } recived damage and has ${ enemy.currentHp } hp`);

                    setTimeout(() => {
                        destroyProjectile(projectilesToHandle, projectile);
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
                        destroyEnemy(enemiesToHandle, enemy);
                        destroyProjectile(projectilesToHandle, projectile);
                    }, 0); // use setTimeout to remove the effect of flash object after the animation
                }
            }
        })
    })
}

function destroyEnemy(enemiesToHandleDestroy, enemyToDestroy) {
    enemiesToHandleDestroy.splice(enemiesToHandleDestroy.indexOf(enemyToDestroy), 1);
}

// PROJECTILE
function handleProjectiles(projectilesToHandle) {
    projectilesToHandle.forEach((projectile) => {
        projectile.update();

        // remove projectile if it goes out of bounds
        if(isOutOfBounds(projectile, canvas)) {
                setTimeout(() => {
                    // removing projectile from array
                    destroyProjectile(projectilesToHandle, projectile);
                }); // use setTimeout to remove the effect of flash object after the animation
        }
    })
}

function destroyProjectile(projectilesToHandleDestroy, projectileToDestroy) {
    projectilesToHandleDestroy.splice(projectilesToHandleDestroy.indexOf(projectileToDestroy), 1);
}

function chooseProjectile (idProjectile, dataProjectileToChoose) {
    projectileToFire = dataProjectileToChoose[idProjectile];
}

// PARTICLE
function handleParticles(particlesToHandle) {
    particlesToHandle.forEach(particle => {
        if(particle.alpha <= 0){
            destroyParticle(particlesToHandle, particle);
        } else{
            particle.update();
        }
    })
}

function destroyParticle(particlesToHandleDestroy, particleToDestroy) {
    particlesToHandleDestroy.splice(particlesToHandleDestroy.indexOf(particleToDestroy), 1);
}

// GAME OBJECTS
function haveCollision(gameObjectToHandle, otherGameObject) {
    // hypot - distance between two points (enemy and player)
    const distanceBetweenObjects = Math.hypot(
        gameObjectToHandle.x - otherGameObject.x, 
        gameObjectToHandle.y - otherGameObject.y
    );

    return distanceBetweenObjects < otherGameObject.radius + gameObjectToHandle.radius;
}

function isOutOfBounds(gameObjectToHandle, canvasToHandle) {
    return gameObjectToHandle.x + gameObjectToHandle.radius < 0  || 
        gameObjectToHandle.x - gameObjectToHandle.radius > canvasToHandle.width || 
        gameObjectToHandle.y + gameObjectToHandle.radius < 0 || 
        gameObjectToHandle.y - gameObjectToHandle.radius > canvasToHandle.height
}

function changeGameObjectRadius(gameObjectToHandle, radiusToChange) {
    gsap.to(gameObjectToHandle, {
        radius: gameObjectToHandle.radius - radiusToChange,
    });
}

// CANVAS
function handleCanvas(canvasToHandle) {
    const { context, width, height} = canvasToHandle;
    
    context.fillStyle = CANVAS.RGB;
    context.fillRect(0, 0, width, height);
}

// CORE FUNCTIONS
function initiateGame() {
    resetData();
    resetHtmlElements();
    animate();
    watchCooldowns();
    spawnEnemies(context, canvas, enemies, dataEnemy);
}

function endGame() {
    cancelAnimationFrame(animationId);
    scoreStartText.innerHTML = scoreValue;
    xpStartText.innerHTML = xpValue;
    containerStart.style.display = 'flex';
    gameStatus = GAME_STATUS.END;
}

function animate() {
    animationId = requestAnimationFrame(animate);
    
    handleCanvas(canvas);

    handlePlayer(player);

    handleParticles(particles);

    handleProjectiles(projectiles);

    handleEnemies(context, enemies, particles, player, projectiles)
}

// COOLDOWNS
function watchCooldowns() {
    let refreshCooldownsIntervalId = setInterval(() => {
        if(gameStatus === GAME_STATUS.START) {

            // qCooldown
            //change button background color
            if(projectileToFire === dataProjectile[0]){
                qGameButton.style.backgroundColor = BUTTON_CHOOSED_COLOR;
            } else {
                qGameButton.style.backgroundColor = BUTTON_STANDARD_COLOR;
            }

            if(dataProjectile[0].currentCoolDown < dataProjectile[0].cooldown) {
                qGameTimer.innerHTML = dataProjectile[0].cooldown - dataProjectile[0].currentCoolDown;
                dataProjectile[0].currentCoolDown++;
                qGameTimer.style.backgroundColor = BUTTON_IN_COOLDOWN_COLOR;
            } else if(projectileToFire === dataProjectile[0] && dataProjectile[0].currentCoolDown >= dataProjectile[0].cooldown) {
                canFire = true;
                qGameTimer.innerHTML = "";
                qGameTimer.style.backgroundColor = BUTTON_CANFIRE_COLOR;
            } else {
                qGameTimer.innerHTML = "";
                qGameTimer.style.backgroundColor = BUTTON_CANFIRE_COLOR;
            }

            // wCooldown
            //change button background color
            if(projectileToFire === dataProjectile[1]){
                wGameButton.style.backgroundColor = BUTTON_CHOOSED_COLOR;
            } else {
                wGameButton.style.backgroundColor = BUTTON_STANDARD_COLOR;
            }

            if(dataProjectile[1].currentCoolDown < dataProjectile[1].cooldown) {
                wGameTimer.innerHTML = dataProjectile[1].cooldown - dataProjectile[1].currentCoolDown;
                dataProjectile[1].currentCoolDown++;
                wGameTimer.style.backgroundColor = BUTTON_IN_COOLDOWN_COLOR;
            }  else if(projectileToFire === dataProjectile[1] && dataProjectile[1].currentCoolDown >= dataProjectile[1].cooldown) {
                canFire = true;
                wGameTimer.innerHTML = "";
                wGameTimer.style.backgroundColor = BUTTON_CANFIRE_COLOR;
            }  
            else {
                wGameTimer.innerHTML = "";
                wGameTimer.style.backgroundColor = BUTTON_CANFIRE_COLOR;
            }

            // eCooldown
            //change button background color
            if(projectileToFire === dataProjectile[2]){
                eGameButton.style.backgroundColor = BUTTON_CHOOSED_COLOR;
            } else {
                eGameButton.style.backgroundColor = BUTTON_STANDARD_COLOR;
            }

            if(dataProjectile[2].currentCoolDown < dataProjectile[2].cooldown) {
                eGameTimer.innerHTML = dataProjectile[2].cooldown - dataProjectile[2].currentCoolDown;
                dataProjectile[2].currentCoolDown++;
                eGameTimer.style.backgroundColor = BUTTON_IN_COOLDOWN_COLOR;
            } else if(projectileToFire === dataProjectile[2] && dataProjectile[2].currentCoolDown >= dataProjectile[2].cooldown) {
                canFire = true;
                eGameTimer.innerHTML = "";
                eGameTimer.style.backgroundColor = BUTTON_CANFIRE_COLOR;
            } else {
                eGameTimer.innerHTML = "";
                eGameTimer.style.backgroundColor = BUTTON_CANFIRE_COLOR;
            }

            // rCooldown
            //change button background color
            if(projectileToFire === dataProjectile[3]){
                rGameButton.style.backgroundColor = BUTTON_CHOOSED_COLOR;
            } else {
                rGameButton.style.backgroundColor = BUTTON_STANDARD_COLOR;
            }

            if(dataProjectile[3].currentCoolDown < dataProjectile[3].cooldown) {
                rGameTimer.innerHTML = dataProjectile[3].cooldown - dataProjectile[3].currentCoolDown;
                dataProjectile[3].currentCoolDown++;
                rGameTimer.style.backgroundColor = BUTTON_IN_COOLDOWN_COLOR;
            } else if(projectileToFire === dataProjectile[3] && dataProjectile[3].currentCoolDown >= dataProjectile[3].cooldown) {
                canFire = true;
                rGameTimer.innerHTML = "";
                rGameTimer.style.backgroundColor = BUTTON_CANFIRE_COLOR;
            } else {
                rGameTimer.innerHTML = "";
                rGameTimer.style.backgroundColor = BUTTON_CANFIRE_COLOR;
            } 
        } else {
            clearInterval(refreshCooldownsIntervalId);
        }
    }, 1000);
}

// handleButtons
function qHandle(){
    chooseProjectile(0, dataProjectile);
    qGameButton.style.backgroundColor = BUTTON_CHOOSED_COLOR;
    if(dataProjectile[0].currentCoolDown >= dataProjectile[0].cooldown)
    {  
        canFire = true;

    } else {
        canFire = false;
    }
}

function wHandle(){
    chooseProjectile(1, dataProjectile);
    wGameButton.style.backgroundColor = BUTTON_CHOOSED_COLOR;
    if(dataProjectile[1].currentCoolDown >= dataProjectile[1].cooldown)
    {
        canFire = true;

    } else {
        canFire = false;
    }
}

function eHandle(){
    chooseProjectile(2, dataProjectile);
    eGameButton.style.backgroundColor = BUTTON_CHOOSED_COLOR;
    if(dataProjectile[2].currentCoolDown >= dataProjectile[2].cooldown)
    {
        canFire = true;

    } else {
        canFire = false;
    }
}

function rHandle(){
    chooseProjectile(3, dataProjectile);
    rGameButton.style.backgroundColor = BUTTON_CHOOSED_COLOR;
    if(dataProjectile[3].currentCoolDown >= dataProjectile[3].cooldown)
    {     
        canFire = true;

    } else {
        canFire = false;
    }
}

// INTERACTION
window.addEventListener('click', (event) => {
    if(gameStatus === GAME_STATUS.START && canFire) {
    
        const angle = Math.atan2(event.clientY - MIDDLE_SCREEN_Y, event.clientX -MIDDLE_SCREEN_X); 

        const velocity = createVelocity(angle, projectileToFire.velocity_factor);

        console.log(' Projectile choosed: ', projectileToFire);

        projectiles.push(
            new Projectile(
                context,
                MIDDLE_SCREEN_X, 
                MIDDLE_SCREEN_Y, 
                velocity,
                projectileToFire
            )
        );

        projectileToFire.currentCoolDown = 0;
        canFire = false;
    }
});

startGameButton.addEventListener('click', () => initiateGame());

qGameButton.addEventListener('click', () => qHandle());

wGameButton.addEventListener('click', () => wHandle());

eGameButton.addEventListener('click', () => eHandle());

rGameButton.addEventListener('click', () => rHandle());

window.addEventListener('keyup', (event) => {
    // q = 81
    if (event.key === 'q' || event.keyCode === 81) {
        // gun
        qHandle();
    }

    // w = 87
    if (event.key === 'w' || event.keyCode === 87) {
        // riffle
        wHandle();
    }

    // e = 101
    if (event.key === 'e' || event.keyCode === 101) {
        // shotgun
        eHandle();
    }

    // r = 114
    if (event.key === 'r' || event.keyCode === 114) {
        // bomb
        rHandle();
    }
});
