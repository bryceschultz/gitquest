import express     from 'express';
import requireAuth from '../middleware/auth.js';
import Battle      from '../models/Battle.js';
import Agent       from '../models/Agent.js';
import AgentCollectible from '../models/AgentCollectible.js';

const router = express.Router();

// POST /api/battles/complete — record a completed battle
router.post('/complete', requireAuth, async (req, res) => {
    try {
        const {
            missionId,
            commandId,
            attempts,
            hintUsed,
            passed,
            xpEarned,
            coinsEarned,
        } = req.body;

        const perfectPass = attempts === 1 && !hintUsed && passed;

        // Upsert — one battle record per agent per mission
        const battle = await Battle.findOneAndUpdate(
            { agentId: req.agentId, missionId },
            {
                agentId: req.agentId,
                missionId,
                commandId,
                attempts,
                hintUsed,
                passed,
                perfectPass,
                xpEarned,
                coinsEarned,
                completedAt: new Date(),
            },
            { upsert: true, new: true }
        );

        // Update agent totals
        xpEarned = req.body.xpEarned ?? 0;
        coinsEarned = req.body.coinsEarned ?? 0;

        if (passed) {
            const active = await AgentCollectible.find({
                agentId: req.agentId, equipped: true, usesRemaining: { $gt: 0 },
            }).populate('collectibleId');

            for (const ac of active) {
                const c = ac.collectibleId;
                if (c?.effectType === 'xpMultiplier')   xpEarned    = Math.round(xpEarned * c.effectValue);
                if (c?.effectType === 'coinMultiplier') coinsEarned = Math.round(coinsEarned * c.effectValue);

                ac.usesRemaining -= 1;
                if (ac.usesRemaining <= 0) {
                    await AgentCollectible.findByIdAndDelete(ac._id); // exhausted — repurchasable again
                } else {
                    await ac.save();
                }
            }
        }

        res.json({ battle });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/battles/history — agent battle history
router.get('/history', requireAuth, async (req, res) => {
    try {
        const battles = await Battle.find({ agentId: req.agentId })
            .populate('missionId', 'title')
            .sort({ completedAt: -1 })
            .limit(20);
        res.json({ battles });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;