import { create } from 'zustand';
import { SOLVED_STATE, applyMove } from '../core/cubeState';

const useCubeStore = create((set, get) => ({
  // Core cube state
  cubeState: SOLVED_STATE,
  applyMove: (move) => set((state) => ({ cubeState: applyMove(state.cubeState, move) })),
  resetCube: () => set({ cubeState: SOLVED_STATE }),
  scrambleCube: () => {
    const moves = ['U', 'R', 'F', 'D', 'L', 'B', "U'", "R'", "F'", "D'", "L'", "B'", 'U2', 'R2', 'F2', 'D2', 'L2', 'B2'];
    let state = SOLVED_STATE;
    for (let i = 0; i < 20; i++) {
      state = applyMove(state, moves[Math.floor(Math.random() * moves.length)]);
    }
    set({ cubeState: state });
  },

  // App mode
  mode: 'learn', // 'learn' | 'solve' | 'drill' | 'algorithms'
  setMode: (mode) => set({ mode }),

  // Learn mode
  currentStage: 0,
  currentStepInStage: 0,
  highlightedCubies: new Set(),
  currentAlgorithm: [],
  currentMoveIndex: 0,
  advanceStep: () => {}, // TODO
  goBack: () => {}, // TODO
  getHint: () => {}, // TODO

  // Colour editor
  isEditorOpen: false,
  selectedColour: 'W',
  setSticker: (index, colour) => set((state) => {
    const arr = state.cubeState.split('');
    arr[index] = colour;
    return { cubeState: arr.join('') };
  }),
  validateState: () => {}, // TODO

  // Solve mode
  solution: [],
  solutionMoveIndex: 0,

  // Settings
  animationSpeed: 'normal',
  showMoveNotation: true,
}));

export default useCubeStore;
