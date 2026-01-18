import { Router, Request, Response } from 'express';

const router = Router();

// Placeholder - será implementado nas próximas fases
router.post('/register', async (req: Request, res: Response) => {
    res.status(501).json({ error: 'Not implemented yet' });
});

router.post('/login', async (req: Request, res: Response) => {
    res.status(501).json({ error: 'Not implemented yet' });
});

router.post('/logout', async (req: Request, res: Response) => {
    res.status(501).json({ error: 'Not implemented yet' });
});

export { router as authRoutes };
