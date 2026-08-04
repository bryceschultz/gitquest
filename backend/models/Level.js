import mongoose from 'mongoose';

const levelSchema = new mongoose.Schema({
    levelNumber: { type: Number, required: true, unique: true, min: 1, max: 3 },
    title:       { type: String, required: true },
    subtitle:    { type: String },
    difficulty:  { type: String, required: true,
        enum: ['beginner', 'intermediate', 'advanced'] },
    order:       { type: Number, required: true },
    xpReward:    { type: Number, default: 0 },
    coinReward:  { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Level', levelSchema);