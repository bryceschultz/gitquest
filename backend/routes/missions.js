import express  from 'express';
import Mission  from '../models/Mission.js';
import Command  from '../models/Command.js';
import AgentProgress from '../models/AgentProgress.js'
import requireAuth   from '../middleware/auth.js'

const router = express.Router();

// GET /api/missions?levelId=xxx — missions for a level
router.get('/', async (req, res) => {
    try {
        const { levelId } = req.query;
        const filter = levelId ? { levelId } : {};
        const missions = await Mission.find(filter).sort({ order: 1 });
        res.json({ missions });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/missions/:id/command — get command for a mission
router.get('/:id/command', async (req, res) => {
    try {
        const command = await Command.findOne({ missionId: req.params.id });
        if (!command) return res.status(404).json({ error: 'Command not found' });
        res.json({ command });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/missions/progress — load all completed mission IDs for the agent
router.get('/progress', requireAuth, async (req, res) => {
    try {
        const records = await AgentProgress.find({
            agentId: req.agentId,
            status:  'completed',
        })
        const completedIds = records.map(r => String(r.missionId))
        res.json({ completedIds })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// POST /api/missions/progress — mark a mission as completed
router.post('/progress', requireAuth, async (req, res) => {
    try {
        const { missionId } = req.body
        await AgentProgress.findOneAndUpdate(
            { agentId: req.agentId, missionId },
            { agentId: req.agentId, missionId, status: 'completed', completedAt: new Date() },
            { upsert: true, new: true }
        )
        res.json({ ok: true })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

export default router;