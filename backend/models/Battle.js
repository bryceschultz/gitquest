import mongoose from 'mongoose';

const battleSchema = new mongoose.Schema({
    agentId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Agent',   required: true },
    missionId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Mission', required: true },
    commandId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Command', required: true },
    attempts:       { type: Number, default: 0, min: 0 },
    hintUsed:       { type: Boolean, default: false },
    passed:         { type: Boolean, default: false },
    perfectPass:    { type: Boolean, default: false },
    xpEarned:       { type: Number, default: 0 },
    coinsEarned:    { type: Number, default: 0 },
    startedAt:      { type: Date, default: Date.now },
    completedAt:    { type: Date, default: null },
}, { timestamps: true });

export default mongoose.model('Battle', battleSchema);