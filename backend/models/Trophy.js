import mongoose from 'mongoose';

const trophySchema = new mongoose.Schema({
    key:         { type: String, required: true, unique: true },
    name:        { type: String, required: true },
    description: { type: String, required: true },
    icon:        { type: String, required: true },
    rarity:      { type: String, required: true,
        enum: ['common', 'uncommon', 'rare', 'legendary'] },
    order:       { type: Number, required: true },
}, { timestamps: true });

export default mongoose.model('Trophy', trophySchema);