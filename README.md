# HTML5 Canvas and JavaScript Game

Based on video [Chris Courses](https://www.youtube.com/watch?v=eI9idPTT0c4)

Create a player

Shoot projectiles

Create enemies

Detect collision on enemy / projectile hit

Detect collision on enemy / player hit

Remove off screen projectiles

Colorize game

Shrink enemies on hit

Create particle explosion on hit

Add score

Add start game button

Add game over UI

Add restart button

# After video 

Refactor code

Extracting classes

Extracting css

Change code to modules

Sharing responsibilities

Adopting git flow

# Give life to Enemy

On class `Enemy`:

- Add attributes:
 ```
    - name
    - maxHp 
    - currentHp
    - attack
    - value
    - xp
```

- Add functions:
```
    - isDead
    - takeDamage
    - doDamage
```
Created data with some enemies:

```
const dataEnemy =
{
    0:{
        name: 'Globin',
        hp: 1,
        attack: 1,
        color: 'hsla(120,100%,50%,0.3)',
        value: 1,
        xp: 1,
        radius: 20,
        velocity_factor: 3,
    },
    1: {
        name: 'Soldier',
        hp: 2,
        attack: 1,
        color: 'hsla(240,100%,50%,0.3)',
        value: 2,
        xp: 3,
        radius: 30,
        velocity_factor: 3,
    },
    2: {
        name: 'Captain',
        hp: 5,
        attack: 3,
        color: 'hsla(300,100%,50%,0.3)',
        value: 5,
        xp: 15,
        radius: 40,
        velocity_factor: 0.5,
    }
}
```

# Give life to Projectile

On class `Projectile`:

- Add attributes:
 ```
    - name
    - pierce
    - attack
    - color
    - cooldown
    - radius
    }
```

- Add functions:
```
    - doDamage
```
Created data with some enemies:

```
const dataProjectile =
{
    0:{
        name: 'gun',
        pierce: 0,
        attack: 1,
        color: 'hsla(360,100%,50%,0.3)',
        cooldown: 1,
        radius: 10,
        velocity_factor: 8,
    },
    1: {
        name: 'riffle',
        pierce: 1,
        attack: 5,
        color: 'hsla(240,100%,50%,0.3)',
        cooldown: 5,
        radius: 10,
        velocity_factor: 30,
    }
}
```
# Choose Projectile to fire

 - Now we can use the keyboards buttons 'Q' and 'W' to switch the projectile used.
 - We either can do same thing clicking in respectives buttons on screen. 