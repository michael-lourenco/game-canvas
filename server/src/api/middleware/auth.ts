import { Request, Response, NextFunction } from 'express';

// Placeholder middleware - será implementado nas próximas fases
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // Por enquanto, apenas passa para frente
    // Será implementado com JWT nas próximas fases
    (req as any).user = { id: 'placeholder-user-id' };
    next();
};
