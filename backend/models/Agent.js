import mongoose from 'mongoose';

const agentSchema = new mongoose.Schema({
    codename:       { type: String, required: true, unique: true, trim: true,
        match: [/^\S+$/, 'Codename cannot contain spaces'] },
    email:          { type: String, required: true, unique: true, lowercase: true,
        trim: true, match: [/.+@.+\..+/, 'Invalid email format'] },
    passwordHash:   { type: String, required: true },
    avatarUrl:      { type: String, default: null },
    coins:          { type: Number, default: 0, min: 0 },
    streak:         { type: Number, default: 0, min: 0 },
    lastActiveDate: { type: Date,   default: null },
    perfectAttempts:{ type: Number, default: 0 },
    totalMissions:  { type: Number, default: 0 },
    totalXP:        { type: Number, default: 0, min: 0 },
    rank:           { type: String, default: 'Recruit',
        enum: ['Recruit','Field Agent'] },
    // Result of the Field Agent placement quiz — a recommendation only.
    // Field agents get free-roam access to every mission regardless of
    // this result (set via rank === 'Field Agent'); it's stored purely so
    // the UI can surface where HQ suggests they begin. Null if the
    // player skipped the quiz.
    placement: {
        recommendedLevel: { type: Number, default: null },
        pct:               { type: Number, default: null },
        correct:           { type: Number, default: null },
        total:             { type: Number, default: null },
        completedAt:       { type: Date,   default: null },
    },
}, { timestamps: true });

export default mongoose.model('Agent', agentSchema);