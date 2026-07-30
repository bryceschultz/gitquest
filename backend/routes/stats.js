import express     from 'express';
import requireAuth from '../middleware/auth.js';
import Agent       from '../models/Agent.js';
import Battle      from '../models/Battle.js';
import Mission     from '../models/Mission.js';
import AgentProgress from '../models/AgentProgress.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
    try {
        const agentId = req.agentId;

        const [agent, allBattles, uniqueCompleted, totalMissionCount] = await Promise.all([
            Agent.findById(agentId).lean(),
            Battle.find({ agentId }),                                    // all battle attempts
            AgentProgress.find({ agentId, status: 'completed' }),        // unique missions passed
            Mission.countDocuments(),
        ]);

        // Total battles (every attempt including repeats)
        const battlesWon      = allBattles.filter(b => b.passed).length

        // Unique missions completed (first-time passes only)
        const uniqueMissions  = uniqueCompleted.length

        // Perfect attempts (passed on first try, no hint)
        const perfectAttempts = allBattles.filter(b => b.passed && b.perfectPass).length

        // Hints used across all battles
        const hintsUsed       = allBattles.filter(b => b.hintUsed).length

        res.json({
            stats: {
                missionsComplete:  `${uniqueMissions} / ${totalMissionCount}`,
                battlesWon,
                perfectAttempts,
                currentStreak:     `${agent.streak ?? 0} days`,
                coinsEarned:       agent.coins ?? 0,
                hintsUsed,
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;