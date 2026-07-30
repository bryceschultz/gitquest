import mongoose from 'mongoose';

const commandSchema = new mongoose.Schema({
    missionId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Mission', required: true },
    command:       { type: String, required: true },
    validPattern:  { type: String, required: true },
    caseSensitive: { type: Boolean, default: true },

    // Display metadata
    title:      { type: String },                                          // e.g. 'git clone' — defaults to `command` in the UI if omitted
    subtitle:   { type: String },                                          // one-line tagline
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
    about:      { type: String },                                          // narrative intro / mission-intel paragraph

    // Structured tutorial content — each sub-section is optional so
    // existing Command docs keep working while content is filled in.
    briefing: {
        whatItDoes: {
            body: { type: String },
        },
        basicSyntax: {
            blocks: [{
                code: { type: String, required: true },
                desc: { type: String },
            }],
        },
        example: {
            // A line is either a command line (prompt/cmd/comment) or an
            // output line (output). Both shapes coexist in one array so
            // ordering (command, then its output) is preserved.
            terminal: [{
                prompt:  { type: String }, // e.g. '$'
                cmd:     { type: String },
                comment: { type: String },
                output:  { type: String },
            }],
        },
        watchOutFor: {
            warnings: [{ type: String }],
        },
    },

    // Legacy field — kept as a fallback for Command docs not yet migrated
    // to `about`/`briefing`. Not required anymore.
    explainer: { type: String },

    hint:                     { type: String, required: true }, // legacy top-level hint, still used as a fallback
    hintUnlocksAfterAttempts: { type: Number, default: 1 },

    // Battle-specific extras. `scenario` intentionally lives on Mission,
    // not here, to avoid two sources of truth for the same text.
    battle: {
        expected: { type: String }, // human-readable reference answer, for future "reveal answer" UI
        hint:     { type: String }, // preferred hint text — falls back to top-level `hint` if absent
    },
}, { timestamps: true });

export default mongoose.model('Command', commandSchema);