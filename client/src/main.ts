import { dataEnemy } from './data/enemies';
import { dataProjectile } from './data/projectiles';
import { CONFIG } from './config/game';
import {
    createLuckCoin,
    createRandomColor,
    createAngleToCenter,
    createInitialPosition,
    createRandomIntegerBetweenTwoNumbers,
    createVelocity
} from './utils/index';
import {
    Canvas,
    Enemy,
    Particle,
    Player,
    Projectile
} from './entities';
import { SaveManager } from './managers/SaveManager';

const {
    CANVAS,
    FRICTION,
    GAME_STATUS,
    PARTICLE_INITIAL,
    PLAYER_INITIAL,
    ECONOMY_INITIAL,
} = CONFIG;

// CREATE THE CANVAS
const canvas = new Canvas('gameCanvas', document.body, window.innerWidth, window.innerHeight);
canvas.create();

if (!canvas.context) {
    throw new Error('Failed to create canvas context');
}

const context = canvas.context;

// HTML ELEMENTS
const score = document.querySelector('#score') as HTMLElement;
const xp = document.querySelector('#xp') as HTMLElement;
const startGameButton = document.querySelector('#startGameButton') as HTMLButtonElement;
const qGameButton = document.querySelector('#qGameButton') as HTMLButtonElement;
const wGameButton = document.querySelector('#wGameButton') as HTMLButtonElement;
const eGameButton = document.querySelector('#eGameButton') as HTMLButtonElement;
const rGameButton = document.querySelector('#rGameButton') as HTMLButtonElement;
const qGameTimer = document.querySelector('#qGameTimer') as HTMLElement;
const wGameTimer = document.querySelector('#wGameTimer') as HTMLElement;
const eGameTimer = document.querySelector('#eGameTimer') as HTMLElement;
const rGameTimer = document.querySelector('#rGameTimer') as HTMLElement;

const containerStart = document.querySelector('#containerStart') as HTMLElement;
const scoreStartText = document.querySelector('#scoreStartText') as HTMLElement;
const xpStartText = document.querySelector('#xpStartText') as HTMLElement;

// CREATE COORDINATES X AND Y ON SCREEN / CANVAS
const MIDDLE_SCREEN_X = canvas.width / 2;
const MIDDLE_SCREEN_Y = canvas.height / 2;

// INITIAL DATA FOR GAME OBJECTS
let player: Player;
let projectiles: Projectile[] = [];
let particles: Particle[] = [];
let enemies: Enemy[] = [];
let projectileToFire = dataProjectile[0];
let animationId: number | null = null;
let scoreValue = ECONOMY_INITIAL.SCORE;
let xpValue = ECONOMY_INITIAL.XP;
let gameStatus = GAME_STATUS.START;
let canFire = false;

let qCooldown = 0;
let wCooldown = 0;
let eCooldown = 0;
let rCooldown = 0;

// SAVE MANAGER
const saveManager = new SaveManager();

// Game state tracking (para SaveManager)
let gameStartTime = 0;
let enemiesKilled = 0;
let projectilesFired = 0;

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
    
    // Reset game state tracking
    enemiesKilled = 0;
    projectilesFired = 0;
    gameStartTime = Date.now();
}

// ELEMENTS HTML
function resetHtmlElements() {
    containerStart.style.display = 'none';
    score.innerHTML = ECONOMY_INITIAL.SCORE.toString();
    xp.innerHTML = ECONOMY_INITIAL.XP.toString();
    scoreStartText.innerHTML = ECONOMY_INITIAL.SCORE.toString();
    xpStartText.innerHTML = ECONOMY_INITIAL.XP.toString();
    qGameButton.innerHTML = dataProjectile[0].name;
    wGameButton.innerHTML = dataProjectile[1].name;
    eGameButton.innerHTML = dataProjectile[2].name;
    rGameButton.innerHTML = dataProjectile[3].name;
}

// PLAYER
function handlePlayer(playerToHandle: Player) {
    playerToHandle.draw();
}

// ENEMY
let spawnIntervalId: ReturnType<typeof setInterval> | null = null;

function spawnEnemies(contextToHandle: CanvasRenderingContext2D, canvasToHandle: Canvas, enemiesArray: Enemy[], enemyData: typeof dataEnemy) {
    if (spawnIntervalId) {
        clearInterval(spawnIntervalId);
    }

    spawnIntervalId = setInterval(() => {
        if (gameStatus === GAME_STATUS.START) {
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
            if (spawnIntervalId) {
                clearInterval(spawnIntervalId);
                spawnIntervalId = null;
            }
        }
    }, 1000);
}

function handleEnemies(
    contextToHandle: CanvasRenderingContext2D,
    enemiesToHandle: Enemy[],
    particlesToHandle: Particle[],
    playerToHandle: Player,
    projectilesToHandle: Projectile[]
) {
    enemiesToHandle.forEach((enemy) => {
        enemy.update();

        if (haveCollision(playerToHandle, enemy)) {
            setTimeout(() => {
                endGame();
            }, 0);
        }

        projectilesToHandle.forEach((projectile) => {
            if (haveCollision(projectile, enemy)) {
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
                    ));
                }

                enemy.takeDamage(projectile.doDamage());

                if (!enemy.isDead()) {
                    console.log(`${enemy.name} recived damage and has ${enemy.currentHp} hp`);

                    setTimeout(() => {
                        destroyProjectile(projectilesToHandle, projectile);
                    }, 0);
                } else {
                    // increase our score
                    scoreValue += enemy.value;
                    score.innerHTML = scoreValue.toString();

                    // increase our xp
                    xpValue += enemy.xp;
                    xp.innerHTML = xpValue.toString();

                    // Track enemies killed
                    enemiesKilled++;

                    // remove from scene altogether
                    setTimeout(() => {
                        destroyEnemy(enemiesToHandle, enemy);
                        destroyProjectile(projectilesToHandle, projectile);
                    }, 0);
                }
            }
        });
    });
}

function destroyEnemy(enemiesToHandleDestroy: Enemy[], enemyToDestroy: Enemy) {
    const index = enemiesToHandleDestroy.indexOf(enemyToDestroy);
    if (index > -1) {
        enemiesToHandleDestroy.splice(index, 1);
    }
}

// PROJECTILE
function handleProjectiles(projectilesToHandle: Projectile[]) {
    projectilesToHandle.forEach((projectile) => {
        projectile.update();

        // remove projectile if it goes out of bounds
        if (isOutOfBounds(projectile, canvas)) {
            setTimeout(() => {
                destroyProjectile(projectilesToHandle, projectile);
            }, 0);
        }
    });
}

function destroyProjectile(projectilesToHandleDestroy: Projectile[], projectileToDestroy: Projectile) {
    const index = projectilesToHandleDestroy.indexOf(projectileToDestroy);
    if (index > -1) {
        projectilesToHandleDestroy.splice(index, 1);
    }
}

function chooseProjectile(idProjectile: number, dataProjectileToChoose: typeof dataProjectile) {
    projectileToFire = dataProjectileToChoose[idProjectile];
}

// PARTICLE
function handleParticles(particlesToHandle: Particle[]) {
    particlesToHandle.forEach(particle => {
        if (particle.alpha <= 0) {
            destroyParticle(particlesToHandle, particle);
        } else {
            particle.update();
        }
    });
}

function destroyParticle(particlesToHandleDestroy: Particle[], particleToDestroy: Particle) {
    const index = particlesToHandleDestroy.indexOf(particleToDestroy);
    if (index > -1) {
        particlesToHandleDestroy.splice(index, 1);
    }
}

// GAME OBJECTS
function haveCollision(gameObjectToHandle: { x: number; y: number; radius: number }, otherGameObject: { x: number; y: number; radius: number }): boolean {
    const distanceBetweenObjects = Math.hypot(
        gameObjectToHandle.x - otherGameObject.x,
        gameObjectToHandle.y - otherGameObject.y
    );

    return distanceBetweenObjects < otherGameObject.radius + gameObjectToHandle.radius;
}

function isOutOfBounds(gameObjectToHandle: { x: number; y: number; radius: number }, canvasToHandle: Canvas): boolean {
    return gameObjectToHandle.x + gameObjectToHandle.radius < 0 ||
        gameObjectToHandle.x - gameObjectToHandle.radius > canvasToHandle.width ||
        gameObjectToHandle.y + gameObjectToHandle.radius < 0 ||
        gameObjectToHandle.y - gameObjectToHandle.radius > canvasToHandle.height;
}

// CANVAS
function handleCanvas(canvasToHandle: Canvas) {
    const { context, width, height } = canvasToHandle;

    if (!context) return;

    context.fillStyle = CANVAS.RGB;
    context.fillRect(0, 0, width, height);
}

// CORE FUNCTIONS
async function initiateGame() {
    resetData();
    resetHtmlElements();
    
    // Iniciar sessão no SaveManager
    await saveManager.startSession();
    
    animate();
    watchCooldowns();
    spawnEnemies(context, canvas, enemies, dataEnemy);
}

async function endGame() {
    if (animationId !== null) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }

    // Finalizar sessão no SaveManager
    try {
        await saveManager.endSession(scoreValue, xpValue);
        console.log('Game session saved!');
    } catch (error) {
        console.error('Error saving game session:', error);
    }

    scoreStartText.innerHTML = scoreValue.toString();
    xpStartText.innerHTML = xpValue.toString();
    containerStart.style.display = 'flex';
    gameStatus = GAME_STATUS.END;
}

let lastSaveUpdate = 0;
const SAVE_UPDATE_INTERVAL = 5000; // 5 segundos

function animate() {
    animationId = requestAnimationFrame(animate);

    handleCanvas(canvas);

    handlePlayer(player);

    handleParticles(particles);

    handleProjectiles(projectiles);

    handleEnemies(context, enemies, particles, player, projectiles);

    // Atualizar SaveManager periodicamente (a cada 5 segundos)
    const now = Date.now();
    if (now - lastSaveUpdate >= SAVE_UPDATE_INTERVAL) {
        lastSaveUpdate = now;
        saveManager.updateGameState({
            enemiesKilled,
            projectilesFired,
            timeElapsed: Math.floor((now - gameStartTime) / 1000),
        });
        saveManager.updateSession(scoreValue, xpValue).catch(err => {
            console.error('Error updating session:', err);
        });
    }
}

// COOLDOWNS
let cooldownIntervalId: ReturnType<typeof setInterval> | null = null;

function watchCooldowns() {
    if (cooldownIntervalId) {
        clearInterval(cooldownIntervalId);
    }

    cooldownIntervalId = setInterval(() => {
        if (gameStatus === GAME_STATUS.START) {
            // qCooldown
            if (projectileToFire === dataProjectile[0]) {
                qGameButton.style.backgroundColor = BUTTON_CHOOSED_COLOR;
            } else {
                qGameButton.style.backgroundColor = BUTTON_STANDARD_COLOR;
            }

            if (dataProjectile[0].currentCoolDown < dataProjectile[0].cooldown) {
                qGameTimer.innerHTML = (dataProjectile[0].cooldown - dataProjectile[0].currentCoolDown).toString();
                dataProjectile[0].currentCoolDown++;
                qGameTimer.style.backgroundColor = BUTTON_IN_COOLDOWN_COLOR;
            } else if (projectileToFire === dataProjectile[0] && dataProjectile[0].currentCoolDown >= dataProjectile[0].cooldown) {
                canFire = true;
                qGameTimer.innerHTML = "";
                qGameTimer.style.backgroundColor = BUTTON_CANFIRE_COLOR;
            } else {
                qGameTimer.innerHTML = "";
                qGameTimer.style.backgroundColor = BUTTON_CANFIRE_COLOR;
            }

            // wCooldown
            if (projectileToFire === dataProjectile[1]) {
                wGameButton.style.backgroundColor = BUTTON_CHOOSED_COLOR;
            } else {
                wGameButton.style.backgroundColor = BUTTON_STANDARD_COLOR;
            }

            if (dataProjectile[1].currentCoolDown < dataProjectile[1].cooldown) {
                wGameTimer.innerHTML = (dataProjectile[1].cooldown - dataProjectile[1].currentCoolDown).toString();
                dataProjectile[1].currentCoolDown++;
                wGameTimer.style.backgroundColor = BUTTON_IN_COOLDOWN_COLOR;
            } else if (projectileToFire === dataProjectile[1] && dataProjectile[1].currentCoolDown >= dataProjectile[1].cooldown) {
                canFire = true;
                wGameTimer.innerHTML = "";
                wGameTimer.style.backgroundColor = BUTTON_CANFIRE_COLOR;
            } else {
                wGameTimer.innerHTML = "";
                wGameTimer.style.backgroundColor = BUTTON_CANFIRE_COLOR;
            }

            // eCooldown
            if (projectileToFire === dataProjectile[2]) {
                eGameButton.style.backgroundColor = BUTTON_CHOOSED_COLOR;
            } else {
                eGameButton.style.backgroundColor = BUTTON_STANDARD_COLOR;
            }

            if (dataProjectile[2].currentCoolDown < dataProjectile[2].cooldown) {
                eGameTimer.innerHTML = (dataProjectile[2].cooldown - dataProjectile[2].currentCoolDown).toString();
                dataProjectile[2].currentCoolDown++;
                eGameTimer.style.backgroundColor = BUTTON_IN_COOLDOWN_COLOR;
            } else if (projectileToFire === dataProjectile[2] && dataProjectile[2].currentCoolDown >= dataProjectile[2].cooldown) {
                canFire = true;
                eGameTimer.innerHTML = "";
                eGameTimer.style.backgroundColor = BUTTON_CANFIRE_COLOR;
            } else {
                eGameTimer.innerHTML = "";
                eGameTimer.style.backgroundColor = BUTTON_CANFIRE_COLOR;
            }

            // rCooldown
            if (projectileToFire === dataProjectile[3]) {
                rGameButton.style.backgroundColor = BUTTON_CHOOSED_COLOR;
            } else {
                rGameButton.style.backgroundColor = BUTTON_STANDARD_COLOR;
            }

            if (dataProjectile[3].currentCoolDown < dataProjectile[3].cooldown) {
                rGameTimer.innerHTML = (dataProjectile[3].cooldown - dataProjectile[3].currentCoolDown).toString();
                dataProjectile[3].currentCoolDown++;
                rGameTimer.style.backgroundColor = BUTTON_IN_COOLDOWN_COLOR;
            } else if (projectileToFire === dataProjectile[3] && dataProjectile[3].currentCoolDown >= dataProjectile[3].cooldown) {
                canFire = true;
                rGameTimer.innerHTML = "";
                rGameTimer.style.backgroundColor = BUTTON_CANFIRE_COLOR;
            } else {
                rGameTimer.innerHTML = "";
                rGameTimer.style.backgroundColor = BUTTON_CANFIRE_COLOR;
            }
        } else {
            if (cooldownIntervalId) {
                clearInterval(cooldownIntervalId);
                cooldownIntervalId = null;
            }
        }
    }, 1000);
}

// handleButtons
function qHandle() {
    chooseProjectile(0, dataProjectile);
    qGameButton.style.backgroundColor = BUTTON_CHOOSED_COLOR;
    if (dataProjectile[0].currentCoolDown >= dataProjectile[0].cooldown) {
        canFire = true;
    } else {
        canFire = false;
    }
}

function wHandle() {
    chooseProjectile(1, dataProjectile);
    wGameButton.style.backgroundColor = BUTTON_CHOOSED_COLOR;
    if (dataProjectile[1].currentCoolDown >= dataProjectile[1].cooldown) {
        canFire = true;
    } else {
        canFire = false;
    }
}

function eHandle() {
    chooseProjectile(2, dataProjectile);
    eGameButton.style.backgroundColor = BUTTON_CHOOSED_COLOR;
    if (dataProjectile[2].currentCoolDown >= dataProjectile[2].cooldown) {
        canFire = true;
    } else {
        canFire = false;
    }
}

function rHandle() {
    chooseProjectile(3, dataProjectile);
    rGameButton.style.backgroundColor = BUTTON_CHOOSED_COLOR;
    if (dataProjectile[3].currentCoolDown >= dataProjectile[3].cooldown) {
        canFire = true;
    } else {
        canFire = false;
    }
}

// INTERACTION
window.addEventListener('click', (event) => {
    if (gameStatus === GAME_STATUS.START && canFire) {
        const angle = Math.atan2(event.clientY - MIDDLE_SCREEN_Y, event.clientX - MIDDLE_SCREEN_X);

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

        // Track projectiles fired
        projectilesFired++;

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
        qHandle();
    }

    // w = 87
    if (event.key === 'w' || event.keyCode === 87) {
        wHandle();
    }

    // e = 101
    if (event.key === 'e' || event.keyCode === 101) {
        eHandle();
    }

    // r = 114
    if (event.key === 'r' || event.keyCode === 114) {
        rHandle();
    }
});
