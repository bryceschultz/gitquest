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
        } = req.body;

        const perfectPass = attempts === 1 && !hintUsed && passed;

        // Base reward amounts. Zeroed out entirely if the battle wasn't
        // actually passed, regardless of what the client sent.
        let xpEarned    = passed ? (req.body.xpEarned ?? 0) : 0;
        let coinsEarned = passed ? (req.body.coinsEarned ?? 0) : 0;

        // Apply any equipped, unexhausted boosts (Double XP Token / Double
        // Coins) BEFORE the reward is recorded or credited, so both the
        // Battle record and the agent's totals reflect the real amount.
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

        // Upsert — one battle record per agent per mission. Stores the
        // FINAL (post-multiplier) amounts so history/leaderboards match
        // what was actually credited to the agent.
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

        // Credit the agent's totals
        if (passed) {
            await Agent.findByIdAndUpdate(req.agentId, {
                $inc: {
                    totalXP:       xpEarned,
                    coins:         coinsEarned,
                    totalMissions: 1,
                    ...(perfectPass ? { perfectAttempts: 1 } : {}),
                }
            });
        }

        res.json({ battle, xpEarned, coinsEarned });
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