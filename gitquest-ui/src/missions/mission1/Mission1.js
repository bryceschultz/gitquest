import { m1l1 } from './M1L1'
import { m1l2 } from './M1L2'
import { m1l3 } from './M1L3'
import { m1l4 } from './M1L4'
import { m1l5 } from './M1L5'
import { m1l6 } from './M1L6'
import { m1fa } from './M1FA'

export const mission1 = {
  id: 'M1', x: 55, y: 150,
  title: 'Mission 1 — First Contact: The Daily Loop',
  desc: `You're a newly recruited cyber agent. Shadow Breach is attacking government systems, and your first assignment is the workflow every developer runs every single day: get the code, know your state, record your work, share it with HQ. Master this loop and you can survive day one on any team.`,
  outro: `\u{1F3C6} Mission 1 Complete — Field Ready\n\nOutstanding, Agent. You just ran the complete daily loop — clone, status, add, commit, push — the exact rhythm you'll repeat thousands of times in your career. Most recruits take weeks to internalize it. You did it under operational pressure.\n\nBut Shadow Breach fights back: contaminated intelligence has been discovered in the record, and HQ needs an agent who knows how to undo damage without making it worse.\n\nMission 2 clearance granted. Time to learn the Undo Ladder.`,
  assignments: [
    { id: 'M1A1', title: 'Assignment 1.1 — Get the Intel', desc: 'Getting code, staying current, reading your state', lessons: ['M1L1', 'M1L2', 'M1L3'] },
    { id: 'M1A2', title: 'Assignment 1.2 — Report In', desc: 'Recording work and sharing it with the team', lessons: ['M1L4', 'M1L5', 'M1L6'] },
  ],
  fieldAssignment: 'M1FA',
  levels: {
    M1L1: m1l1, M1L2: m1l2, M1L3: m1l3, M1L4: m1l4, M1L5: m1l5, M1L6: m1l6,
    M1FA: m1fa,
  },
}
