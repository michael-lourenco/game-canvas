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