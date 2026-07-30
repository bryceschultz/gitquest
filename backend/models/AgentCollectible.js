import mongoose from 'mongoose';

const agentCollectibleSchema = new mongoose.Schema({
    agentId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Agent',       required: true },
    collectibleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Collectible', required: true },
    unlockedAt:    { type: Date, default: Date.now },
    equipped:      { type: Boolean, default: false },
    usesRemaining: { type: Number, default: null },
}, { timestamps: true });

agentCollectibleSchema.index({ agentId: 1, collectibleId: 1 }, { unique: true });

export default mongoose.model('AgentCollectible', agentCollectibleSchema);