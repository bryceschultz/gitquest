import { m3l1 } from './M3L1'
import { m3l2 } from './M3L2'
import { m3l3 } from './M3L3'
import { m3l4 } from './M3L4'
import { m3l5 } from './M3L5'
import { m3l6 } from './M3L6'
import { m3l7 } from './M3L7'
import { m3l8 } from './M3L8'
import { m3l9 } from './M3L9'
import { m3fa } from './M3FA'

export const mission3 = {
  id: 'M3', x: 290, y: 150,
  title: 'Mission 3 — Parallel Operations: Branching & Integration',
  desc: `Shadow Breach runs parallel cells; so will you. Learn to open covert threads of work without touching the main record, survive interruptions, and — the heart of team development — integrate parallel work deliberately: fetch vs pull, merge vs rebase, and cleaning up after yourself.`,
  outro: `\u{1F3C6} Mission 3 Complete — Parallel Operator\n\nMasterful, Agent. You just executed the exact workflow professional software teams run every week — branch, work, stash through an interruption, sync, integrate, clean up. You also now command BOTH integration strategies: merge preserves the parallel history, rebase replays it clean.\n\nOne target remains: Shadow Breach's leadership and their Ghost Protocol contingency. What comes next is Git's most powerful and most dangerous tier.\n\nMission 4 clearance granted. This is where most agents stop. You won't.`,
  assignments: [
    { id: 'M3A1', title: 'Assignment 3.1 — Open a Covert Thread', desc: 'Parallel work and context-switching mid-task', lessons: ['M3L1', 'M3L2', 'M3L3', 'M3L4'] },
    { id: 'M3A2', title: 'Assignment 3.2 — Reunify', desc: 'Seeing the field, then integrating parallel work deliberately', lessons: ['M3L5', 'M3L6', 'M3L7', 'M3L8', 'M3L9'] },
  ],
  fieldAssignment: 'M3FA',
  levels: {
    M3L1: m3l1, M3L2: m3l2, M3L3: m3l3, M3L4: m3l4, M3L5: m3l5,
    M3L6: m3l6, M3L7: m3l7, M3L8: m3l8, M3L9: m3l9,
    M3FA: m3fa,
  },
}
