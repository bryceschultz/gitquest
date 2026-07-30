import express      from 'express';
import requireAuth  from '../middleware/auth.js';
import ProgressBlob from '../models/ProgressBlob.js';
import Agent        from '../models/Agent.js';

const router = express.Router();

// GET /api/progress — the signed-in agent's saved progress (or null).
router.get('/', requireAuth, async (req, res) => {
    try {
        const doc = await ProgressBlob.findOne({ agentId: req.agentId });
        res.json({ progress: doc ? doc.progress : null });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/progress — upsert the whole progress object, and denormalize a
// few Agent fields so existing leaderboard/stats queries keep working.
router.put('/', requireAuth, async (req, res) => {
    try {
        const { progress } = req.body;
        if (!progress || typeof progress !== 'object' || !Array.isArray(progress.completedLevels)) {
            return res.status(400).json({ error: 'Invalid progress payload' });
        }
        await ProgressBlob.findOneAndUpdate(
            { agentId: req.agentId },
            { progress },
            { upsert: true, new: true },
        );
        const scores = Object.values(progress.scores ?? {});
        await Agent.findByIdAndUpdate(req.agentId, {
            coins: Math.max(0, (progress.completedLevels.length * 10) - (progress.spentCoins ?? 0)),
            totalXP: scores.reduce((a, b) => a + b, 0),
            perfectAttempts: scores.filter(s => s === 100).length,
            lastActiveDate: new Date(),
        });
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
