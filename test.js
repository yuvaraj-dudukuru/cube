import { SOLVED_STATE, applyMove, applySequence, invertMove } from './src/core/cubeState.js';

let failed = false;

const assertEq = (a, b, msg) => {
  if (a !== b) {
    console.error(`FAILED: ${msg}\nExpected: ${b}\nGot:      ${a}`);
    failed = true;
  }
};

const scramble = ["U", "R", "F", "D", "L", "B", "U2", "R'", "F2", "D'", "L2", "B'"];
const reverseScramble = scramble.map(invertMove).reverse();

const scrambledState = applySequence(SOLVED_STATE, scramble);
if (scrambledState === SOLVED_STATE) {
  console.error("FAILED: Scrambled state shouldn't be solved");
  failed = true;
}

const reversedState = applySequence(scrambledState, reverseScramble);
assertEq(reversedState, SOLVED_STATE, "Reversed state should be solved");

['U', 'R', 'F', 'D', 'L', 'B'].forEach(move => {
  let state = SOLVED_STATE;
  for (let i = 0; i < 4; i++) {
    state = applyMove(state, move);
  }
  assertEq(state, SOLVED_STATE, `4x ${move}`);
});

['U', 'R', 'F', 'D', 'L', 'B'].forEach(move => {
  let state1 = applyMove(applyMove(SOLVED_STATE, move), move);
  let state2 = applyMove(SOLVED_STATE, move + '2');
  assertEq(state1, state2, `${move} twice == ${move}2`);
});

['U', 'R', 'F', 'D', 'L', 'B'].forEach(move => {
  let state1 = applyMove(SOLVED_STATE, move);
  let state2 = applyMove(state1, move + "'");
  assertEq(state2, SOLVED_STATE, `${move} + inverse`);
});

if (!failed) {
  console.log("All tests passed!");
} else {
  process.exit(1);
}
