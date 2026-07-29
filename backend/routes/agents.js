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

// POST /api/agents/placement — persist the Field Agent placement quiz
// result and unlock the recommended starting point.
//
// recommendedLevel maps to score as: 0-49% -> 1, 50-74% -> 2, 75-100% -> 3.
// Every mission in every level BELOW recommendedLevel is marked completed
// in AgentProgress, so the mission map's existing sequential-unlock logic
// naturally opens those levels — no special-case bypass needed.
//   - Level 1 (0-49%):   nothing marked complete
//   - Level 2 (50-74%):  all Level 1 missions marked complete
//   - Level 3 (75-100%): all Level 1 and Level 2 missions marked complete
//
// Body shapes:
//   { skipped: true }                                          — skip
//   { recommendedLevel, pct, correct, total }                   — scored
router.post('/placement', requireAuth, async (req, res) => {
    try {
        const { recommendedLevel, pct, correct, total, skipped } = req.body;

        const update = { rank: 'Field Agent' };

        if (!skipped) {
            const valid =
                typeof recommendedLevel === 'number' &&
                typeof pct     === 'number' &&
                typeof correct === 'number' &&
                typeof total   === 'number';

            if (!valid) {
                return res.status(400).json({ error: 'Invalid placement payload' });
            }

            update.placement = {
                recommendedLevel,
                pct,
                correct,
                total,
                completedAt: new Date(),
            };

            // Auto-complete every mission in levels below the recommended
            // starting level.
            if (recommendedLevel > 1) {
                const lowerLevels = await Level.find({
                    levelNumber: { $lt: recommendedLevel },
                });
                const lowerLevelIds = lowerLevels.map(l => l._id);

                const missionsToComplete = await Mission.find({
                    levelId: { $in: lowerLevelIds },
                });

                await Promise.all(
                    missionsToComplete.map(m =>
                        AgentProgress.findOneAndUpdate(
                            { agentId: req.agentId, missionId: m._id },
                            {
                                agentId:     req.agentId,
                                missionId:   m._id,
                                status:      'completed',
                                completedAt: new Date(),
                            },
                            { upsert: true, new: true }
                        )
                    )
                );
            }
        }

        const agent = await Agent.findByIdAndUpdate(req.agentId, update, { new: true })
            .select('-passwordHash');

        if (!agent) return res.status(404).json({ error: 'Agent not found' });

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