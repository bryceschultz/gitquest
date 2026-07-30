import mongoose from 'mongoose';
import dotenv   from 'dotenv';
import Trophy   from './models/Trophy.js';

dotenv.config();

const trophies = [
    { key: 'first_strike',            order: 1,  icon: '🩸', rarity: 'common',    name: 'First Strike',               description: 'Complete your very first mission.' },
    { key: 'loaded',                  order: 2,  icon: '💰', rarity: 'common',    name: 'Loaded',                     description: 'Earn your first 10 coins.' },
    { key: 'on_the_clock',            order: 3,  icon: '⏱',  rarity: 'common',    name: 'On The Clock',               description: 'Complete a battle in under 15 seconds.' },
    { key: 'clean_slate',             order: 4,  icon: '✦',  rarity: 'common',    name: 'Clean Slate',                description: 'Pass a mission on the first attempt with no hint used.' },
    { key: 'committed',               order: 5,  icon: '📋', rarity: 'common',    name: 'Committed',                  description: 'Complete 5 missions total.' },
    { key: 'no_hints_required',       order: 6,  icon: '🧠', rarity: 'uncommon',  name: 'No Hints Required',          description: 'Complete an entire level without using any hint.' },
    { key: 'streak_operative',        order: 7,  icon: '🔥', rarity: 'uncommon',  name: 'Streak Operative',           description: 'Maintain a 3-day login streak.' },
    { key: 'shadow_hunter',           order: 8,  icon: '🎯', rarity: 'uncommon',  name: 'Shadow Hunter',              description: 'Complete all 10 missions in Level 1.' },
    { key: 'speed_demon',             order: 9,  icon: '⚡', rarity: 'uncommon',  name: 'Speed Demon',                description: 'Complete 3 battles in under 15 seconds each.' },
    { key: 'coin_collector',          order: 10, icon: '🪙', rarity: 'uncommon',  name: 'Coin Collector',             description: 'Accumulate 100 coins.' },
    { key: 'session_grinder',         order: 11, icon: '💪', rarity: 'uncommon',  name: 'Session Grinder',            description: 'Complete 5 missions in one session.' },
    { key: 'flawless',                order: 12, icon: '🏅', rarity: 'rare',      name: 'Flawless',                   description: 'Complete 3 missions in a row with no wrong attempts.' },
    { key: 'deep_cover',              order: 13, icon: '🕵️', rarity: 'rare',      name: 'Deep Cover',                 description: 'Complete all 10 missions in Level 2.' },
    { key: 'week_warrior',            order: 14, icon: '📅', rarity: 'rare',      name: 'Week Warrior',               description: 'Maintain a 7-day login streak.' },
    { key: 'branch_commander',        order: 15, icon: '⎇',  rarity: 'rare',      name: 'Branch Commander',           description: 'Complete 20 missions total.' },
    { key: 'coin_vault',              order: 16, icon: '💎', rarity: 'rare',      name: 'Coin Vault',                 description: 'Accumulate 250 coins.' },
    { key: 'ghost_protocol',          order: 17, icon: '👻', rarity: 'rare',      name: 'Ghost Protocol',             description: 'Complete a mission by skipping the training module and going straight to battle.' },
    { key: 'ghost_agent',             order: 18, icon: '🛸', rarity: 'legendary', name: 'Ghost Agent',                description: 'Complete all 10 missions in Level 3.' },
    { key: 'perfectionist',           order: 19, icon: '🌟', rarity: 'legendary', name: 'Perfectionist',              description: 'Pass 10 missions on the first attempt with no hints used.' },
    { key: 'shadow_breach_neutralized', order: 20, icon: '🛡', rarity: 'legendary', name: 'Shadow Breach Neutralized', description: 'Complete all 30 missions. The operation is over.' },
];

/**
 *
 * @returns {Promise<void>}
 */
async function seedTrophies() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✔ Connected to MongoDB');
    await Trophy.deleteMany({});
    await Trophy.insertMany(trophies);
    console.log(`✔ Seeded ${trophies.length} trophies`);
    await mongoose.disconnect();
    process.exit(0);
}

seedTrophies().catch(err => {
    console.error('✘ Seed error:', err);
    process.exit(1);
});