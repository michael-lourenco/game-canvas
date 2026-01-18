import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authRoutes } from './api/routes/auth';
import { sessionRoutes } from './api/routes/sessions';
import { leaderboardRoutes } from './api/routes/leaderboard';
import { authMiddleware } from './api/middleware/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rotas públicas
app.use('/api/auth', authRoutes);

// Rotas protegidas (requer autenticação)
app.use('/api/sessions', authMiddleware, sessionRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

app.listen(PORT, () => {
    console.log(`🚀 Game Server running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/health`);
    console.log(`📍 API: http://localhost:${PORT}/api`);
});
