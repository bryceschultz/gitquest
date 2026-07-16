import { m2l1 } from './M2L1'
import { m2l2 } from './M2L2'
import { m2l3 } from './M2L3'
import { m2l4 } from './M2L4'
import { m2l5 } from './M2L5'
import { m2l6 } from './M2L6'
import { m2fa } from './M2FA'

export const mission2 = {
  id: 'M2', x: 170, y: 95,
  title: 'Mission 2 — Damage Control: Reading & Undoing',
  desc: `False intelligence has been planted in the record. Before you can fix anything you must READ the history — then choose the right undo for each kind of damage. The Undo Ladder, ordered by blast radius: amend your last commit, restore a file, revert a pushed commit, reset a local one. Wrong tool, worse damage.`,
  outro: `\u{1F3C6} Mission 2 Complete — Damage Controller\n\nExceptional judgment, Agent. You read the record before acting, and you chose the correct undo for every kind of damage — the skill that separates professionals from people who make things worse. "Which undo do I use?" will never scare you again.\n\nIntel reports Shadow Breach cells operating in parallel. To counter them, HQ is authorizing you for parallel operations of your own.\n\nMission 3 clearance granted. Time to branch out.`,
  assignments: [
    { id: 'M2A1', title: 'Assignment 2.1 — Inspect the Evidence', desc: 'Reading history and changes before acting', lessons: ['M2L1', 'M2L2'] },
    { id: 'M2A2', title: 'Assignment 2.2 — The Undo Ladder', desc: 'The four undos, ordered by blast radius', lessons: ['M2L3', 'M2L4', 'M2L5', 'M2L6'] },
  ],
  fieldAssignment: 'M2FA',
  levels: {
    M2L1: m2l1, M2L2: m2l2, M2L3: m2l3, M2L4: m2l4, M2L5: m2l5, M2L6: m2l6,
    M2FA: m2fa,
  },
}
