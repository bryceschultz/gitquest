import { m4l1 } from './M4L1'
import { m4l2 } from './M4L2'
import { m4l3 } from './M4L3'
import { m4l4 } from './M4L4'
import { m4l5 } from './M4L5'
import { m4l6 } from './M4L6'
import { m4l7 } from './M4L7'
import { m4l8 } from './M4L8'
import { m4l9 } from './M4L9'
import { m4l10 } from './M4L10'
import { m4l11 } from './M4L11'
import { m4fa } from './M4FA'

export const mission4 = {
  id: 'M4', x: 405, y: 95,
  title: 'Mission 4 — Ghost Protocol: History Surgery & Shipping',
  desc: `Shadow Breach's masterminds have activated Ghost Protocol. Countering it requires Git's most powerful and unforgiving tier: rewriting history with surgical precision, publishing rewritten history the ONLY safe way, recovering work that looks lost forever, and sealing the final release. One wrong command could compromise everything.`,
  outro: `\u{1F3C6} Mission 4 Complete — Ghost Protocol Cleared\n\nIt's over, Agent. Shadow Breach has been dismantled.\n\nYou rewrote history without leaving a trace, published it safely under lease, hunted a bug through fifty commits with binary search, recovered intelligence from the void, and sealed the final evidence package for the classified vault.\n\n\u{1F396} OPERATION SHADOW BREACH — COMPLETE\n\nFrom the desk of the Director, U.S. Cyber Defense Agency:\n\nAgent — when you first cloned that repository, you were a recruit. Today you are something else entirely.\n\nYou mastered the daily loop that carries every developer's career. You learned to read the record before acting, and to undo damage with the precision of a surgeon choosing the right instrument. You ran parallel operations like a seasoned team lead, and you bent history itself to your will without harming a single teammate's work.\n\nShadow Breach is gone. But these skills don't expire. Every repository you'll ever touch, every team you'll ever join, every crisis you'll ever debug — you're ready.\n\nThe nation owes you one, Agent. Well done.`,
  assignments: [
    { id: 'M4A1', title: 'Assignment 4.1 — Rewrite the Record', desc: 'Surgical history editing, and the only safe way to publish it', lessons: ['M4L1', 'M4L2', 'M4L3', 'M4L4'] },
    { id: 'M4A2', title: 'Assignment 4.2 — Search & Recover', desc: 'Finding bugs in history; recovering "lost" work', lessons: ['M4L5', 'M4L6', 'M4L7', 'M4L8'] },
    { id: 'M4A3', title: 'Assignment 4.3 — Seal the Vault', desc: 'Release rituals: milestones, signed provenance, final export', lessons: ['M4L9', 'M4L10', 'M4L11'] },
  ],
  fieldAssignment: 'M4FA',
  levels: {
    M4L1: m4l1, M4L2: m4l2, M4L3: m4l3, M4L4: m4l4, M4L5: m4l5, M4L6: m4l6,
    M4L7: m4l7, M4L8: m4l8, M4L9: m4l9, M4L10: m4l10, M4L11: m4l11,
    M4FA: m4fa,
  },
}
