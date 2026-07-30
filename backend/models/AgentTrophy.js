import mongoose from 'mongoose';

const agentTrophySchema = new mongoose.Schema({
    agentId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Agent', required: true },
    trophyId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Trophy', required: true },
    earnedAt:  { type: Date, default: Date.now },
}, { timestamps: true });

agentTrophySchema.index({ agentId: 1, trophyId: 1 }, { unique: true });

export default mongoose.model('AgentTrophy', agentTrophySchema);