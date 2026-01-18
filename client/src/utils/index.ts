export function createLuckCoin(): boolean {
    return Math.random() < 0.5 ? true : false;
}

export function createRandomColor(): string {
    return `hsla(${Math.random() * 360}, 50%, 50%, 1)`;
}

export function createAngleToCenter(
    width: number,
    height: number,
    initialX: number,
    initialY: number
): number {
    return Math.atan2(
        height / 2 - initialY,
        width / 2 - initialX
    );
}

export interface Position {
    x: number;
    y: number;
}

export function createInitialPosition(
    luckToDirection: boolean,
    luckToSense: boolean,
    radiusToUse: number,
    widthToUse: number,
    heightToUse: number
): Position {
    let x: number;
    let y: number;

    if (luckToDirection) {
        x = luckToSense ? 0 - radiusToUse : widthToUse + radiusToUse;
        y = Math.random() * heightToUse;
    } else {
        x = Math.random() * widthToUse;
        y = luckToSense ? 0 - radiusToUse : heightToUse + radiusToUse;
    }

    return { x, y };
}

export function createRandomIntegerBetweenTwoNumbers(
    minReceived: number,
    maxReceived: number
): number {
    const min = parseInt(minReceived.toString());
    const max = parseInt(maxReceived.toString());

    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export interface Velocity {
    x: number;
    y: number;
}

export function createVelocity(angle: number, multiplyFactor: number = 1): Velocity {
    return {
        x: Math.cos(angle) * multiplyFactor,
        y: Math.sin(angle) * multiplyFactor
    };
}
