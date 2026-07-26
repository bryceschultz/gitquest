import express       from 'express';
import requireAuth   from '../middleware/auth.js';
import Agent         from '../models/Agent.js';
import Battle        from '../models/Battle.js';
import Mission       from '../models/Mission.js';
import Level         from '../models/Level.js';
import AgentProgress from '../models/AgentProgress.js';

const router = express.Router();

// GET /api/agents/me
router.get('/me', requireAuth, async (req, res) => {
    try {
        const agent = await Agent.findById(req.agentId).select('-passwordHash');
        res.json({ agent });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/agents/leaderboard?type=alltime|level
router.get('/leaderboard', requireAuth, async (req, res) => {
    try {
        const { type = 'alltime' } = req.query;
        const agentId = req.agentId;

        if (type === 'alltime') {
            // Sum xpEarned from all passed battles per agent, tie-break by earliest completedAt
            const xpData = await Battle.aggregate([
                { $match: { passed: true } },
                { $group: {
                        _id:          '$agentId',
                        totalXP:      { $sum: '$xpEarned' },
                        lastCompleted:{ $min: '$completedAt' },
                    }},
                { $sort: { totalXP: -1, lastCompleted: 1 } },
                { $limit: 10 },
                { $lookup: {
                        from:         'agents',
                        localField:   '_id',
                        foreignField: '_id',
                        as:           'agent',
                    }},
                { $unwind: '$agent' },
                { $project: {
                        _id:          0,
                        agentId:      '$_id',
                        codename:     '$agent.codename',
                        totalXP:      1,
                        lastCompleted:1,
                    }},
            ]);

            res.json({ leaderboard: xpData });

        } else if (type === 'level') {
            // Find the current agent's level based on AgentProgress
            const currentAgent = await Agent.findById(agentId);

            // Determine current level: highest level with at least one completed mission
            const completedProgress = await AgentProgress.find({
                agentId, status: 'completed',
            }).populate({ path: 'missionId', populate: { path: 'levelId' } });

            // Get unique level numbers completed
            const levelNums = new Set(
                completedProgress
                    .map(p => p.missionId?.levelId?.levelNumber)
                    .filter(Boolean)
            );

            // Current level = highest level with completed missions, or 1
            const currentLevelNum = levelNums.size > 0 ? Math.max(...levelNums) : 1;
            const currentLevel    = await Level.findOne({ levelNumber: currentLevelNum });

            if (!currentLevel) {
                return res.json({ leaderboard: [], levelNumber: 1 });
            }

            // Get all mission IDs belonging to this level
            const levelMissions = await Mission.find({ levelId: currentLevel._id });
            const missionIds    = levelMissions.map(m => m._id);

            // Sum XP from battles for these missions only
            const xpData = await Battle.aggregate([
                { $match: { passed: true, missionId: { $in: missionIds } } },
                { $group: {
                        _id:          '$agentId',
                        totalXP:      { $sum: '$xpEarned' },
                        lastCompleted:{ $min: '$completedAt' },
                    }},
                { $sort: { totalXP: -1, lastCompleted: 1 } },
                { $limit: 10 },
                { $lookup: {
                        from:         'agents',
                        localField:   '_id',
                        foreignField: '_id',
                        as:           'agent',
                    }},
                { $unwind: '$agent' },
                { $project: {
                        _id:          0,
                        agentId:      '$_id',
                        codename:     '$agent.codename',
                        totalXP:      1,
                        lastCompleted:1,
                    }},
            ]);

            res.json({ leaderboard: xpData, levelNumber: currentLevelNum });
        }

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;