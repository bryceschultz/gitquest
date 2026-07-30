import mongoose from 'mongoose';

const missionSchema = new mongoose.Schema({
    levelId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Level', required: true },
    missionNumber: { type: Number, required: true },
    title:         { type: String, required: true },
    story:         { type: String, required: true },
    scenario:      { type: String, required: true },
    order:         { type: Number, required: true },
    xpReward:      { type: Number, default: 10 },
    coinReward:    { type: Number, default: 5 },
}, { timestamps: true });

// compound unique index — no duplicate mission numbers within a level
missionSchema.index({ levelId: 1, missionNumber: 1 }, { unique: true });

export default mongoose.model('Mission', missionSchema);