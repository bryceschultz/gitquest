

export class GitCmd {
  static validCmds: Set<string> = new Set(['git', 'clone', 'rebase', 'init', 'checkout']);
  cmd: string;
  recognized: boolean;

  constructor(cmd: string, recognized: boolean) {
    this.cmd = cmd;
    this.recognized = recognized;
  }


  static parse(cmd: string): GitCmd {
    if (GitCmd.validCmds.has(cmd)) {
      return new GitCmd(cmd, true);
    } else {
      return new GitCmd(cmd, false);
    }
  }
}

export class GitInstruction {
  cmds: GitCmd[];
  constructor(cmds: GitCmd[]) {
    this.cmds = cmds;
  }

  static parse(cmd: string): GitInstruction {
    const rawCmds = cmd.split(" ");
    const parsedCmds = rawCmds.map(rawCmd => GitCmd.parse(rawCmd));

    if (parsedCmds.length > 0) {
      return new GitInstruction(parsedCmds);
    } else {
      return new GitInstruction([])
    }
  }
}