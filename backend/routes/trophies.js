import express      from 'express';
import requireAuth  from '../middleware/auth.js';
import Trophy       from '../models/Trophy.js';
import AgentTrophy  from '../models/AgentTrophy.js';
import Agent        from '../models/Agent.js';
import Battle       from '../models/Battle.js';
import Mission      from '../models/Mission.js';
import Level        from '../models/Level.js';

const router = express.Router();

// ── GET /api/trophies — all trophies with earned status ───────
router.get('/', requireAuth, async (req, res) => {
    try {
        const [allTrophies, earned] = await Promise.all([
            Trophy.find().sort({ order: 1 }),
            AgentTrophy.find({ agentId: req.agentId }).populate('trophyId'),
        ]);

        const earnedMap = {};
        earned.forEach(at => {
            if (at.trophyId) earnedMap[at.trophyId.key] = at.earnedAt;
        });

        const trophies = allTrophies.map(t => ({
            _id:         t._id,
            key:         t.key,
            name:        t.name,
            description: t.description,
            icon:        t.icon,
            rarity:      t.rarity,
            order:       t.order,
            earned:      !!earnedMap[t.key],
            earnedAt:    earnedMap[t.key] || null,
        }));

        res.json({ trophies });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── POST /api/trophies/evaluate — check & award trophies ─────
router.post('/evaluate', requireAuth, async (req, res) => {
    try {
        const {
            missionId,
            attempts,
            hintUsed,
            skippedTraining,
            durationSeconds,
            sessionMissionCount,
        } = req.body;

        const agentId = req.agentId;

        // Fetch agent, all trophies, already earned
        const [agent, allTrophies, alreadyEarned] = await Promise.all([
            Agent.findById(agentId),
            Trophy.find().sort({ order: 1 }),
            AgentTrophy.find({ agentId }).populate('trophyId'),
        ]);

        const earnedKeys = new Set(alreadyEarned.map(at => at.trophyId?.key).filter(Boolean));

        // Fetch stats needed for evaluation
        const allBattles = await Battle.find({ agentId, passed: true });
        const totalMissions   = allBattles.length;
        const perfectBattles  = allBattles.filter(b => b.perfectPass).length;
        const hintsUsed       = allBattles.filter(b => b.hintUsed).length;
        const fastBattles     = allBattles.filter(b => b.completedAt && b.startedAt &&
            ((new Date(b.completedAt) - new Date(b.startedAt)) / 1000) < 15
        ).length;

        // Get level info for level-completion trophies
        const mission   = await Mission.findById(missionId);
        const levelId   = mission?.levelId;
        const level     = levelId ? await Level.findById(levelId) : null;
        const levelNum  = level?.levelNumber;

        // Check missions per level
        const [lvl1, lvl2, lvl3] = await Promise.all([
            Level.findOne({ levelNumber: 1 }),
            Level.findOne({ levelNumber: 2 }),
            Level.findOne({ levelNumber: 3 }),
        ]);

        const [lvl1Missions, lvl2Missions, lvl3Missions] = await Promise.all([
            Mission.find({ levelId: lvl1?._id }),
            Mission.find({ levelId: lvl2?._id }),
            Mission.find({ levelId: lvl3?._id }),
        ]);

        const completedIds = new Set(allBattles.map(b => String(b.missionId)));

        const lvl1Complete = lvl1Missions.length > 0 && lvl1Missions.every(m => completedIds.has(String(m._id)));
        const lvl2Complete = lvl2Missions.length > 0 && lvl2Missions.every(m => completedIds.has(String(m._id)));
        const lvl3Complete = lvl3Missions.length > 0 && lvl3Missions.every(m => completedIds.has(String(m._id)));
        const allComplete  = lvl1Complete && lvl2Complete && lvl3Complete;

        // Check flawless (3 in a row, no wrong attempts)
        const lastThree = await Battle.find({ agentId, passed: true })
            .sort({ completedAt: -1 }).limit(3);
        const flawless  = lastThree.length === 3 && lastThree.every(b => b.attempts === 1 && !b.hintUsed);

        // No hints in entire level
        const levelBattleIds = (levelNum === 1 ? lvl1Missions : levelNum === 2 ? lvl2Missions : lvl3Missions)
            .map(m => String(m._id));
        const levelBattles = allBattles.filter(b => levelBattleIds.includes(String(b.missionId)));
        const levelComplete = levelBattles.length === levelBattleIds.length;
        const noHintsInLevel = levelComplete && levelBattles.every(b => !b.hintUsed);

        // Evaluate each trophy
        const conditions = {
            first_strike:             totalMissions >= 1,
            loaded:                   (agent.coins ?? 0) >= 10,
            on_the_clock:             durationSeconds != null && durationSeconds < 15,
            clean_slate:              attempts === 1 && !hintUsed,
            committed:                totalMissions >= 5,
            no_hints_required:        noHintsInLevel,
            streak_operative:         (agent.streak ?? 0) >= 3,
            shadow_hunter:            lvl1Complete,
            speed_demon:              fastBattles >= 3,
            coin_collector:           (agent.coins ?? 0) >= 100,
            session_grinder:          (sessionMissionCount ?? 0) >= 5,
            flawless:                 flawless,
            deep_cover:               lvl2Complete,
            week_warrior:             (agent.streak ?? 0) >= 7,
            branch_commander:         totalMissions >= 20,
            coin_vault:               (agent.coins ?? 0) >= 250,
            ghost_protocol:           !!skippedTraining,
            ghost_agent:              lvl3Complete,
            perfectionist:            perfectBattles >= 10,
            shadow_breach_neutralized: allComplete,
        };

        // Award newly unlocked trophies
        const newlyUnlocked = [];
        for (const trophy of allTrophies) {
            if (earnedKeys.has(trophy.key)) continue;
            if (!conditions[trophy.key]) continue;

            await AgentTrophy.create({ agentId, trophyId: trophy._id });
            newlyUnlocked.push({
                key:  trophy.key,
                name: trophy.name,
                icon: trophy.icon,
                rarity: trophy.rarity,
            });
        }

        res.json({ newlyUnlocked });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;