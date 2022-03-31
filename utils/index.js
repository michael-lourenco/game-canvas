function createLuckCoin() {
    return Math.random() < 0.5 ? true : false;
}

function createRandomColor() {
    return `hsla(${ Math.random() * 360 }, 50%, 50%, 1)`;
}

function createAngleToCenter(width, height, initialX, initialY) {
    return Math.atan2(
        height / 2 - initialY, 
        width / 2 - initialX
    ); 
}

function createInitialPosition(luckToDirection, luckToSense,radiusToUse, widthToUse, heightToUse) {
    let x;
    let y;

    if(luckToDirection){
        x = luckToSense ? 0 - radiusToUse : widthToUse + radiusToUse;
        y = Math.random() * heightToUse;
    } else {
        x = Math.random() * widthToUse;
        y = luckToSense ? 0 - radiusToUse : heightToUse + radiusToUse;
    }

    return {
        x,
        y
    }
}

function createVelocity(angle, multiplyFactor = 1) {
    return {
        x: Math.cos(angle) * multiplyFactor,
        y: Math.sin(angle) * multiplyFactor
    }
}

export {
    createLuckCoin,
    createRandomColor,
    createAngleToCenter,
    createInitialPosition,
    createVelocity
}
