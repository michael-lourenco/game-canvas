const CONFIG = {
    CANVAS: {
        RGB: 'rgb(0,0,0,0.3)',
    },
    ENEMY_INITIAL: {
        VELOCITY_FACTOR: 3,
    },
    FRICTION: 0.99,
    GAME_STATUS :{
        START: 0,
        PLAYING: 1,
        END: 2,
    },
    PLAYER_INITIAL: {
        COLOR: 'white',
        RADIUS: 10,
    },
    PROJECTILE_INITIAL: {
        COLOR: 'white',
        RADIUS: 5,
        VELOCITY_FACTOR: 8,
    },
    SCORE_INITIAL: {
        VALUE: 0,
    },
}

export { CONFIG };
