import mongoose from 'mongoose';

const collectibleSchema = new mongoose.Schema({
    name:        { type: String, required: true, unique: true },
    description: { type: String, required: true },
    type:        { type: String, required: true,
        enum: ['tool', 'boost', 'cosmetic'] },
    coinCost:    { type: Number, required: true, default: 0, min: 0 },
    isAvailable: { type: Boolean, default: true },
    emoji:     { type: String, default: null },
    effect:      { type: String, default: null },
    effectType:  { type: String,
        enum: ['xpMultiplier', 'coinMultiplier', null], default: null },
    effectValue: { type: Number, default: null },
    effectUses:  { type: Number, default: null }, // charges granted per purchase
}, { timestamps: true });

export default mongoose.model('Collectible', collectibleSchema);