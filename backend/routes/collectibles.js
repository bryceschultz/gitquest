import express      from 'express';
import requireAuth  from '../middleware/auth.js';
import Collectible      from '../models/Collectible.js';
import AgentCollectible from '../models/AgentCollectible.js';
import Agent        from '../models/Agent.js';

const router = express.Router();

// GET /api/collectible — all available items + which ones the agent owns
router.get('/', requireAuth, async (req, res) => {
    try {
        const [items, owned] = await Promise.all([
            Collectible.find({ isAvailable: true }).sort({ type: 1, coinCost: 1 }),
            AgentCollectible.find({ agentId: req.agentId }).populate('collectibleId'),
        ]);

        const ownedIds = new Set(owned.map(o => String(o.collectibleId?._id)));

        const result = items.map(item => ({
            _id:         item._id,
            name:        item.name,
            description: item.description,
            type:        item.type,
            coinCost:    item.coinCost,
            emoji:       item.emoji,
            effect:      item.effect,
            owned:       ownedIds.has(String(item._id)),
        }));

        res.json({ items: result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/collectible/:id/unlock — purchase an item
router.post('/:id/unlock', requireAuth, async (req, res) => {
    try {
        const item = await Collectible.findById(req.params.id);
        if (!item) return res.status(404).json({ error: 'Item not found' });

        const agent = await Agent.findById(req.agentId);
        if (!agent)  return res.status(404).json({ error: 'Agent not found' });

        if (agent.coins < item.coinCost)
            return res.status(400).json({ error: 'Insufficient coins' });

        const already = await AgentCollectible.findOne({
            agentId:   req.agentId,
            collectibleId: item._id,
        });
        if (already)
            return res.status(409).json({ error: 'Item already owned' });

        // Deduct coins and save
        agent.coins -= item.coinCost;
        await agent.save();

        // Record ownership
        await AgentCollectible.create({ agentId: req.agentId, collectibleId: item._id });

        res.json({
            message:       `${item.name} acquired successfully`,
            remainingCoins: agent.coins,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/collectible/:id/unequip — remove ownership (makes item repurchasable)
router.post('/:id/unequip', requireAuth, async (req, res) => {
    try {
        await AgentCollectible.findOneAndDelete({
            agentId:   req.agentId,
            collectibleId: req.params.id,
        })
        res.json({ ok: true })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

export default router;