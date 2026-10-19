// Self-check: node src/core/lbl-solver/check.js
import assert from 'node:assert/strict';
import { SOLVED_STATE, applyMove, applySequence } from '../cubeState.js';
import { ALGORITHMS, flipMoves, isStageComplete, solveLBL } from './index.js';

const TURNS = ['U', 'R', 'F', 'D', 'L', 'B'].flatMap((f) => [f, f + "'", f + '2']);
const scramble = () => {
  let state = SOLVED_STATE;
  for (let i = 0; i < 25; i++) state = applyMove(state, TURNS[Math.floor(Math.random() * TURNS.length)]);
  return state;
};

// Last-layer algorithms must leave the first two layers alone.
for (const group of ['yellowCross', 'yellowEdges', 'yellowCornersPosition', 'yellowCornersOrient']) {
  for (const alg of Object.values(ALGORITHMS[group])) {
    assert(isStageComplete(applySequence(SOLVED_STATE, flipMoves(alg.moves)), 2), `${group}/${alg.name} breaks the first two layers`);
  }
}

assert(solveLBL(SOLVED_STATE).every((s) => s.moves.length === 0), 'solved cube needs no moves');

const RUNS = 300;
let total = 0, longest = 0, slowest = 0;
for (let i = 0; i < RUNS; i++) {
  let state = scramble();
  const t = performance.now();
  const solution = solveLBL(state);
  slowest = Math.max(slowest, performance.now() - t);
  assert.equal(solution.length, 7);
  let count = 0;
  for (const { stage, moves, steps } of solution) {
    assert.deepEqual(moves, steps.flatMap((s) => s.moves));
    assert(moves.every((m) => TURNS.includes(m)), `stage ${stage} has a move the engine cannot do`);
    state = applySequence(state, moves);
    assert(isStageComplete(state, stage), `stage ${stage} not complete after its moves`);
    count += moves.length;
  }
  assert.equal(state, SOLVED_STATE);
  total += count;
  longest = Math.max(longest, count);
}
console.log(`${RUNS} scrambles solved. avg ${(total / RUNS).toFixed(0)} moves, longest ${longest}, slowest solve ${slowest.toFixed(0)}ms`);
