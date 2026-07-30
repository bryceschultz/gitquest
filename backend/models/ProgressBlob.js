import mongoose from 'mongoose';

// Whole-progress persistence for the registry-driven frontend.
// The client's progress object (completedLevels, scores, mode, placement,
// achievements, inventory, spentCoins, hintsUsed) is stored as one document
// per agent — the exact shape localStorage uses, so the client needs no
// translation layer and the curriculum stays defined in code (the mission
// registry), never re-entered into the database.
const progressBlobSchema = new mongoose.Schema({
    agentId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Agent', required: true, unique: true },
    progress: { type: mongoose.Schema.Types.Mixed, required: true },
}, { timestamps: true });

export default mongoose.model('ProgressBlob', progressBlobSchema);
