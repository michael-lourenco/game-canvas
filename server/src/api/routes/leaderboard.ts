import { Router, Request, Response } from 'express';

const router = Router();

// Placeholder - será implementado nas próximas fases
router.get('/', async (req: Request, res: Response) => {
    res.status(501).json({ error: 'Not implemented yet' });
});

export { router as leaderboardRoutes };
