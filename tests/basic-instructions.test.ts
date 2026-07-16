
import { GitInstruction } from "./Git";

describe('Parsing basic operations', () => {
  test('clone operation', () => {
    const rawInstruction = "git clone https://somelink"
    const parsedInstruction = GitInstruction.parse(rawInstruction);

    expect(parsedInstruction.cmds.length).toEqual(3);
    expect(parsedInstruction.cmds[0].recognized).toEqual(true);
    expect(parsedInstruction.cmds[1].recognized).toEqual(true);
    expect(parsedInstruction.cmds[2].recognized).toEqual(false);
  });

  test('rebase operation', () => {
    const rawInstruction = "git rebase somebranch"
    const parsedInstruction = GitInstruction.parse(rawInstruction);

    expect(parsedInstruction.cmds.length).toEqual(3);
    expect(parsedInstruction.cmds[0].recognized).toEqual(true);
    expect(parsedInstruction.cmds[1].recognized).toEqual(true);
    expect(parsedInstruction.cmds[2].recognized).toEqual(false);
  });

  test('checkout operation', () => {
    const rawInstruction = "git checkout someotherbranch"
    const parsedInstruction = GitInstruction.parse(rawInstruction);

    expect(parsedInstruction.cmds.length).toEqual(3);
    expect(parsedInstruction.cmds[0].recognized).toEqual(true);
    expect(parsedInstruction.cmds[1].recognized).toEqual(true);
    expect(parsedInstruction.cmds[2].recognized).toEqual(false);
  });

});