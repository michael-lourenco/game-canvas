const dataProjectile =
{
    0:{
        name: 'gun',
        pierce: 0,
        attack: 1,
        color: 'hsla(360,100%,50%,0.3)',
        cooldown: 1,
        currentCoolDown: 0,
        radius: 10,
        velocity_factor: 8,
    },
    1: {
        name: 'riffle',
        pierce: 5,
        attack: 5,
        color: 'hsla(240,100%,50%,0.3)',
        cooldown: 3,
        currentCoolDown: 0,
        radius: 10,
        velocity_factor: 30,
    },
    2: {
        name: 'shotgun',
        pierce: 2,
        attack: 8,
        color: 'hsla(120,100%,50%,0.3)',
        cooldown: 5,
        currentCoolDown: 0,
        radius: 20,
        velocity_factor: 7,
    },
    3: {
        name: 'bomb',
        pierce: 100,
        attack: 10,
        color: 'hsla(25,100%,50%,0.3)',
        cooldown: 15,
        currentCoolDown: 0,
        radius: 50,
        velocity_factor: 5,
    }
}

export { dataProjectile };
