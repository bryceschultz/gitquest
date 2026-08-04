import express from 'express';
import Level   from '../models/Level.js';

const router = express.Router();

// GET /api/levels — all levels
router.get('/', async (_, res) => {
    try {
        const levels = await Level.find().sort({ order: 1 });
        res.json({ levels });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;