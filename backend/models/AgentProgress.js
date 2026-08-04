import mongoose from 'mongoose';

const agentProgressSchema = new mongoose.Schema({
    agentId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Agent',   required: true },
    missionId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Mission', required: true },
    status:      { type: String, default: 'completed', enum: ['unlocked', 'completed'] },
    completedAt: { type: Date, default: null },
}, { timestamps: true });

agentProgressSchema.index({ agentId: 1, missionId: 1 }, { unique: true });

export default mongoose.model('AgentProgress', agentProgressSchema);