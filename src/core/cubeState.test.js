import { describe, it, expect } from 'vitest';
import { SOLVED_STATE, applyMove, applySequence, invertMove } from './cubeState';

describe('Cube State', () => {
  it('should return the solved state when reversed', () => {
    const scramble = ["U", "R", "F", "D", "L", "B", "U2", "R'", "F2", "D'", "L2", "B'"];
    const reverseScramble = scramble.map(invertMove).reverse();
    
    const scrambledState = applySequence(SOLVED_STATE, scramble);
    expect(scrambledState).not.toBe(SOLVED_STATE);

    const reversedState = applySequence(scrambledState, reverseScramble);
    expect(reversedState).toBe(SOLVED_STATE);
  });

  it('applying move 4 times should return to original', () => {
    ['U', 'R', 'F', 'D', 'L', 'B'].forEach(move => {
      let state = SOLVED_STATE;
      for (let i = 0; i < 4; i++) {
        state = applyMove(state, move);
      }
      expect(state).toBe(SOLVED_STATE);
    });
  });

  it('applying move 2 times should match U2', () => {
    ['U', 'R', 'F', 'D', 'L', 'B'].forEach(move => {
      let state1 = applyMove(applyMove(SOLVED_STATE, move), move);
      let state2 = applyMove(SOLVED_STATE, move + '2');
      expect(state1).toBe(state2);
    });
  });

  it('applying move and inverse should return to original', () => {
    ['U', 'R', 'F', 'D', 'L', 'B'].forEach(move => {
      let state1 = applyMove(SOLVED_STATE, move);
      let state2 = applyMove(state1, move + "'");
      expect(state2).toBe(SOLVED_STATE);
    });
  });
});
