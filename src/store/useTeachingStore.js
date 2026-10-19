import { create } from 'zustand';
import { invertMove } from '../core/cubeState';
import useCubeStore from './useCubeStore';
import { STAGES, getHighlightedStickers, isStageComplete, pieceStickers, solveLBL } from '../core/lbl-solver';

const NO_STICKERS = new Set();
const CENTRES = [4, 13, 22, 31, 40, 49];
const cube = () => useCubeStore.getState();
const firstOpenStage = (solution, from = 0) => solution.findIndex((s, i) => i >= from && s.moves.length > 0);

// After the white cross the cube is shown, and its moves are named, yellow-side up.
export const isFlipped = (s) => s.active && !s.finished && s.currentStageIndex >= 1;

// The step of a stage that contains move `index`, and where that step starts.
export const stepAt = (stage, index) => {
  let start = 0;
  for (const step of stage.steps) {
    if (index < start + step.moves.length) return { step, start };
    start += step.moves.length;
  }
  const step = stage.steps.at(-1);
  return { step, start: start - (step?.moves.length ?? 0) };
};

// Quarter turns a move makes: R = 1, R2 = 2, R' = 3.
const turns = (move) => (move.endsWith("'") ? 3 : move.endsWith('2') ? 2 : 1);
const TURN_SUFFIX = ['', '', '2', "'"];

// Swap `remove` moves at `index` of one stage for `insert`, keeping its steps and flat move list in step.
const editPlan = (solution, stageIndex, index, remove, insert) => solution.map((stage, i) => {
  if (i !== stageIndex) return stage;
  const { step, start } = stepAt(stage, index);
  const at = index - start;
  const steps = stage.steps.map((s) => (s === step ? { ...s, moves: [...s.moves.slice(0, at), ...insert, ...s.moves.slice(at + remove)] } : s));
  return { ...stage, steps, moves: steps.flatMap((s) => s.moves) };
});

let amberTimer;
let timers = [];
const later = (fn, ms) => timers.push(setTimeout(fn, ms));
const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };

const useTeachingStore = create((set, get) => {
  // Recompute what the 3D cube should emphasise for the current position.
  const sync = (patch = {}) => {
    const s = { ...get(), ...patch };
    const stage = s.solution[s.currentStageIndex];
    if (!stage) return set({ ...patch, highlightedPieces: NO_STICKERS, glowPieces: NO_STICKERS });
    const { cubeState } = cube();
    const highlightedPieces = getHighlightedStickers(cubeState, s.currentStageIndex);
    const { step } = stepAt(stage, s.currentMoveIndex);
    const glowPieces = step?.piece
      ? new Set(pieceStickers(cubeState, step.piece))
      : s.hintLevel >= 2 ? new Set([...highlightedPieces].filter((i) => !CENTRES.includes(i))) : NO_STICKERS;
    set({ ...patch, highlightedPieces, glowPieces });
  };

  // Solve from the cube as it is now and resume at the first stage that still needs moves.
  const replan = (patch = {}) => {
    const solution = solveLBL(cube().cubeState);
    const currentStageIndex = firstOpenStage(solution);
    const hintLevel = currentStageIndex === get().currentStageIndex ? get().hintLevel : 0;
    sync({ hintLevel, ...patch, solution, currentStageIndex, currentMoveIndex: 0, finished: currentStageIndex === -1 });
  };

  const completeStage = () => {
    const { solution, currentStageIndex } = get();
    const next = firstOpenStage(solution, currentStageIndex + 1);
    const banner = next === -1
      ? 'Cube solved ✓ — nice work!'
      : `${STAGES[currentStageIndex].name} done ✓ — now ${STAGES[next].lead}`;
    set({ completing: true });
    later(() => set({ banner, flashAt: performance.now() }), 300);
    later(() => get().nextStage(), 2300);
  };

  return {
    active: false,
    finished: false,
    solution: [],
    currentStageIndex: 0,
    currentMoveIndex: 0,
    highlightedPieces: NO_STICKERS, // sticker indices to keep lit; empty = all
    glowPieces: NO_STICKERS,        // stickers of the piece being solved right now
    hintLevel: 0,
    banner: null,
    completing: false,
    flashAt: 0,
    amber: false,

    startLearnMode: () => {
      clearTimers();
      replan({ active: true, hintLevel: 0, banner: null, completing: false });
    },

    exitLearnMode: () => {
      clearTimers();
      set({ active: false, finished: false, solution: [], banner: null, completing: false, highlightedPieces: NO_STICKERS, glowPieces: NO_STICKERS });
    },

    // Skip the banner wait (also what the auto-advance timer calls).
    nextStage: () => {
      if (!get().completing) return;
      clearTimers();
      const { solution, currentStageIndex } = get();
      const next = firstOpenStage(solution, currentStageIndex + 1);
      sync({
        completing: false, banner: null, flashAt: 0, hintLevel: 0,
        currentStageIndex: next === -1 ? solution.length : next, currentMoveIndex: 0, finished: next === -1,
      });
    },

    advanceMove: () => {
      if (get().completing) return get().nextStage();
      const { solution, currentStageIndex, currentMoveIndex } = get();
      const stage = solution[currentStageIndex];
      if (!stage) return;
      cube().applyMove(stage.moves[currentMoveIndex]);
      sync({ currentMoveIndex: currentMoveIndex + 1 });
      if (currentMoveIndex + 1 < stage.moves.length) return;
      if (isStageComplete(cube().cubeState, currentStageIndex)) completeStage();
      else replan();
    },

    goBackMove: () => {
      const { solution, currentStageIndex, currentMoveIndex, completing } = get();
      if (completing || currentMoveIndex === 0) return;
      cube().applyMove(invertMove(solution[currentStageIndex].moves[currentMoveIndex - 1]));
      sync({ currentMoveIndex: currentMoveIndex - 1 });
    },

    // Never reject a turn: apply it, then quietly work out the way forward from wherever the cube is now.
    handleWrongMove: (move) => {
      const { solution, currentStageIndex, currentMoveIndex } = get();
      const expected = solution[currentStageIndex]?.moves[currentMoveIndex];
      if (expected === move) return get().advanceMove();
      cube().applyMove(move);
      if (expected?.[0] === move[0]) {
        // Right layer, wrong amount: the plan just turns it the rest of the way.
        const rest = move[0] + TURN_SUFFIX[(turns(expected) - turns(move) + 4) % 4];
        sync({ solution: editPlan(solution, currentStageIndex, currentMoveIndex, 1, [rest]) });
      } else if (!expected || currentStageIndex === 0 || isStageComplete(cube().cubeState, currentStageIndex - 1)) {
        // Everything before this stage is still done: re-solve from here.
        replan();
      } else {
        // The turn undid finished work or interrupted an algorithm: the next step is to turn it back.
        sync({ solution: editPlan(solution, currentStageIndex, currentMoveIndex, 0, [invertMove(move)]) });
      }
      // Half of an expected double turn is not worth a flash.
      if (expected === move[0] + '2') return;
      set({ amber: true });
      clearTimeout(amberTimer);
      amberTimer = setTimeout(() => set({ amber: false }), 300);
    },

    // Every layer turn the user makes (buttons, keys, future swipes) comes through here. Engine-frame move.
    userMove: (move) => {
      if (get().completing) get().nextStage();
      const { solution, currentStageIndex, currentMoveIndex } = get();
      if (solution[currentStageIndex]?.moves[currentMoveIndex] === move) get().advanceMove();
      else get().handleWrongMove(move);
    },

    requestHint: () => sync({ hintLevel: Math.min(3, get().hintLevel + 1) }),
  };
});

export default useTeachingStore;
