import mongoose    from 'mongoose';
import dotenv      from 'dotenv';
import Collectible     from './models/Collectible.js';

dotenv.config();

const collectibles = [
    // ── Tools ──────────────────────────────────────────────
    {
        name: 'Auto-hint Module',
        description: 'Reveals a hint after your first wrong attempt instead of your second.',
        type: 'tool', coinCost: 80, emoji: '⚡', isAvailable: true,
        effect: 'Hint unlocks one attempt earlier than usual.',
        effectType: null, effectValue: null, effectUses: null,
    },
    {
        name: 'Syntax Scanner',
        description: 'Highlights the exact part of your command that is wrong on a failed attempt.',
        type: 'tool', coinCost: 120, emoji: '🔬', isAvailable: true,
        effect: 'Pinpoints syntax errors on failure.',
        effectType: null, effectValue: null, effectUses: null,
    },
    {
        name: 'Ghost Command',
        description: 'Shows a faded version of the correct command. You still have to type it yourself.',
        type: 'tool', coinCost: 200, emoji: '👻', isAvailable: true,
        effect: 'Displays a ghost overlay of the correct command.',
        effectType: null, effectValue: null, effectUses: null,
    },
    {
        name: 'Mission Debrief',
        description: 'Unlocks a detailed post-mission breakdown showing time taken, attempts, and accuracy score.',
        type: 'tool', coinCost: 150, emoji: '📋', isAvailable: true,
        effect: 'Shows full stats after each mission.',
        effectType: null, effectValue: null, effectUses: null,
    },
    {
        name: 'Command Reference Card',
        description: 'Adds a collapsible cheat sheet of all Git commands you have learned so far.',
        type: 'tool', coinCost: 60, emoji: '📖', isAvailable: true,
        effect: 'Adds a reference panel during missions.',
        effectType: null, effectValue: null, effectUses: null,
    },
    {
        name: 'Intel Archive',
        description: 'Lets you bookmark missions and revisit them from a dedicated saved list.',
        type: 'tool', coinCost: 100, emoji: '🗂', isAvailable: true,
        effect: 'Enables mission bookmarking.',
        effectType: null, effectValue: null, effectUses: null,
    },

    // ── Boosts ─────────────────────────────────────────────
    {
        name: 'Double XP Token',
        description: 'Earn double XP on your next completed mission.',
        type: 'boost', coinCost: 60, emoji: '✦', isAvailable: true,
        effect: '2x XP on next mission.',
        effectType: 'xpMultiplier', effectValue: 2, effectUses: 1,
    },
    {
        name: 'Streak Shield',
        description: 'Protects your current streak if you miss a day.',
        type: 'boost', coinCost: 90, emoji: '🛡', isAvailable: true,
        effect: 'Streak is preserved for one missed day.',
        effectType: null, effectValue: null, effectUses: null,
    },
    {
        name: 'Time Freeze',
        description: 'Pauses any timed battle challenges for 30 seconds.',
        type: 'boost', coinCost: 150, emoji: '⏸', isAvailable: true,
        effect: 'Freezes timer for 30 seconds.',
        effectType: null, effectValue: null, effectUses: null,
    },
    {
        name: 'Coin Multiplier',
        description: 'Earn 1.5x coins on your next 3 completed missions.',
        type: 'boost', coinCost: 80, emoji: '🪙', isAvailable: true,
        effect: '1.5x coins for next 3 missions.',
        effectType: 'coinMultiplier', effectValue: 1.5, effectUses: 3,
    },
    {
        name: 'XP Surge',
        description: 'Earn double XP on your next completed level.',
        type: 'boost', coinCost: 110, emoji: '🚀', isAvailable: true,
        effect: '2x XP on next level completion.',
        effectType: null, effectValue: null, effectUses: null,
    },
    {
        name: 'Second Chance',
        description: 'Restores one lost life during a battle, once per mission.',
        type: 'boost', coinCost: 130, emoji: '❤️', isAvailable: true,
        effect: 'Restores 1 life per mission.',
        effectType: null, effectValue: null, effectUses: null,
    },

    // ── Cosmetics ───────────────────────────────────────────
    {
        name: 'Agent Callsign',
        description: 'Set a custom callsign that appears in the topbar instead of your codename.',
        type: 'cosmetic', coinCost: 100, emoji: '🪪', isAvailable: true,
        effect: 'Custom callsign in topbar.',
        effectType: null, effectValue: null, effectUses: null,
    },
    {
        name: 'Terminal Cursor',
        description: 'Changes your battle input cursor to a blinking block instead of the default.',
        type: 'cosmetic', coinCost: 50, emoji: '▋', isAvailable: true,
        effect: 'Blinking block cursor in terminal.',
        effectType: null, effectValue: null, effectUses: null,
    },
    {
        name: 'Neon Blue Theme',
        description: 'Changes the UI accent color from green to electric blue.',
        type: 'cosmetic', coinCost: 250, emoji: '💙', isAvailable: true,
        effect: 'Electric blue UI accent.',
        effectType: null, effectValue: null, effectUses: null,
    },
    {
        name: 'Classified Stamp',
        description: 'Adds a red CLASSIFIED watermark effect to mission briefings.',
        type: 'cosmetic', coinCost: 75, emoji: '🔴', isAvailable: true,
        effect: 'CLASSIFIED stamp on briefings.',
        effectType: null, effectValue: null, effectUses: null,
    },
    {
        name: 'Gold Rank Badge',
        description: 'Displays a gold star next to your codename in the topbar.',
        type: 'cosmetic', coinCost: 200, emoji: '⭐', isAvailable: true,
        effect: 'Gold star in topbar badge.',
        effectType: null, effectValue: null, effectUses: null,
    },
    {
        name: 'Shadow Operative Badge',
        description: 'Unlocks an exclusive animated badge on your agent profile.',
        type: 'cosmetic', coinCost: 300, emoji: '🛸', isAvailable: true,
        effect: 'Animated badge on profile.',
        effectType: null, effectValue: null, effectUses: null,
    },
];

async function seed() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✔ Connected to MongoDB');
    await Collectible.deleteMany({});
    await Collectible.insertMany(collectibles);
    console.log(`✔ Seeded ${collectibles.length} collectibles`);
    await mongoose.disconnect();
    process.exit(0);
}

seed().catch(err => {
    console.error('✘ Seed error:', err);
    process.exit(1);
});