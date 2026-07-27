import express       from 'express';
import mongoose      from 'mongoose';
import cookieParser  from 'cookie-parser';
import cors          from 'cors';
import dotenv        from 'dotenv';

import agentRoutes   from './routes/agents.js';
import authRoutes    from './routes/auth.js';
import battleRoutes  from './routes/battles.js';
import collectibleRoutes from './routes/collectibles.js';
import levelRoutes   from './routes/levels.js';
import missionRoutes from './routes/missions.js';
import statsRoutes  from './routes/stats.js';
import trophyRoutes from './routes/trophies.js';


import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

dotenv.config();

const app = express();

// ── Middleware ────────────────────────────────────────────────
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,             // allow cookies cross-origin
}));
app.use(express.json());
app.use(cookieParser());
app.use('/audio', express.static(path.join(__dirname, 'audio')))

// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/agents',   agentRoutes);
app.use('/api/levels',   levelRoutes);
app.use('/api/missions', missionRoutes);
app.use('/api/battles',  battleRoutes);
app.use('/api/collectible',  collectibleRoutes);
app.use('/api/stats',    statsRoutes);
app.use('/api/trophies', trophyRoutes);

// ── Health check ──────────────────────────────────────────────
app.get('/api/health', (_, res) => res.json({ status: 'online' }));

// ── Connect to MongoDB & start server ─────────────────────────
const PORT = process.env.PORT || 5001;

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('✔ Connected to MongoDB');
        app.listen(PORT, '0.0.0.0', () =>
            console.log(`✔ Server running on port ${PORT}`)
        );
    })
    .catch(err => {
        console.error('✘ MongoDB connection error:', err);
        process.exit(1);
    });