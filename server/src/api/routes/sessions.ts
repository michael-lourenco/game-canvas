import { Router, Request, Response } from 'express';

const router = Router();

// Placeholder - será implementado nas próximas fases
router.post('/', async (req: Request, res: Response) => {
    res.status(501).json({ error: 'Not implemented yet' });
});

router.get('/:id', async (req: Request, res: Response) => {
    res.status(501).json({ error: 'Not implemented yet' });
});

router.patch('/:id', async (req: Request, res: Response) => {
    res.status(501).json({ error: 'Not implemented yet' });
});

router.post('/:id/end', async (req: Request, res: Response) => {
    res.status(501).json({ error: 'Not implemented yet' });
});

export { router as sessionRoutes };
