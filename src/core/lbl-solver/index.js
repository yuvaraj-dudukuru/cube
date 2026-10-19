// Layer-by-layer solver. Pure JS, no UI: cube state in, staged list of moves out.
import { applySequence } from '../cubeState.js';
import { ALGORITHMS } from './algorithms.js';

export { ALGORITHMS };

export const STAGES = [
  { name: 'White Cross', lead: "let's build the white cross", intent: 'Build a white plus sign on top. Each white edge belongs above the matching colour centre.' },
  { name: 'White Corners', lead: "let's flip the cube over and place the corners", intent: 'Place all 4 white corners to complete the top layer. Each corner has 3 colours — match them all.' },
  { name: 'Middle Layer', lead: "let's fill in the middle layer", intent: 'Fill in the middle layer. Look for edge pieces with no yellow — they belong in the E-layer slots.' },
  { name: 'Yellow Cross', lead: "let's make a yellow cross", intent: 'Get a yellow cross on top. We only care about orientation here, not which edge is where.' },
  { name: 'Yellow Edges', lead: "let's line up the yellow edges", intent: 'Cycle the yellow edges until each one is above its matching colour centre.' },
  { name: 'Yellow Corners Position', lead: "let's put the yellow corners in their slots", intent: "Get each yellow corner above its correct slot. Colours don't need to face up yet." },
  { name: 'Orient Yellow Corners', lead: "let's turn the yellow corners the right way", intent: 'Orient each yellow corner in place. The cube solves itself one corner at a time.' },
];

// --- Pieces -----------------------------------------------------------------

const U = 0, D = 3; // white is U and yellow is D in the engine's fixed frame
const faceOf = (f) => (f / 9) | 0;
const centre = (f) => faceOf(f) * 9 + 4;

// Cubie position of facelet i (same layout the renderer uses), to group facelets into pieces.
const cubieOf = (i) => {
  const a = 1 - (((i % 9) / 3) | 0), b = (i % 3) - 1;
  return [[b, 1, -a], [1, a, -b], [b, a, 1], [b, -1, a], [-1, a, b], [-b, a, -1]][faceOf(i)];
};
const byCubie = {};
for (let i = 0; i < 54; i++) (byCubie[cubieOf(i)] ??= []).push(i);
export const PIECES = Object.values(byCubie).filter((p) => p.length > 1); // 12 edges + 8 corners

const touching = (face) => (p) => p.some((f) => faceOf(f) === face);
const EDGES = PIECES.filter((p) => p.length === 2);
const CORNERS = PIECES.filter((p) => p.length === 3);
const W_EDGES = EDGES.filter(touching(U));
const W_CORNERS = CORNERS.filter(touching(U));
const MID_EDGES = EDGES.filter((p) => !touching(U)(p) && !touching(D)(p));
const Y_EDGES = EDGES.filter(touching(D));
const Y_CORNERS = CORNERS.filter(touching(D));

// One sticker is enough to pin down where a piece is and how it is twisted.
const anchor = (p) => p.find((f) => faceOf(f) === U || faceOf(f) === D) ?? p[0];
const homeColours = (state, p) => p.map((f) => state[centre(f)]).join('');

// Facelets of the piece carrying exactly these colours, in the order given.
export function pieceStickers(state, colours) {
  for (const p of PIECES) {
    if (p.length !== colours.length) continue;
    const at = [...colours].map((c) => p.find((f) => state[f] === c));
    if (at.every((f) => f !== undefined)) return at;
  }
  throw new Error(`LBL solver: no ${colours} piece — is this a legal cube state?`);
}

// Where the sticker that belongs on facelet `home` currently is.
const locate = (state, home) => {
  const p = PIECES.find((q) => q.includes(home));
  return pieceStickers(state, homeColours(state, p))[p.indexOf(home)];
};

const COLOUR_NAMES = { W: 'white', Y: 'yellow', R: 'red', O: 'orange', G: 'green', B: 'blue' };
export const describePiece = (colours) =>
  `${[...colours].map((c) => COLOUR_NAMES[c]).join('-')} ${colours.length === 2 ? 'edge' : 'corner'}`;

// --- Moves ------------------------------------------------------------------

const relabel = (moves, map) => moves.map((m) => map[m[0]] + m.slice(1));
const Z2 = { U: 'D', D: 'U', R: 'L', L: 'R', F: 'F', B: 'B' };
const Y = { F: 'R', R: 'B', B: 'L', L: 'F', U: 'U', D: 'D' };
// Yellow-on-top grip <-> engine frame. Its own inverse.
export const flipMoves = (moves) => relabel(moves, Z2);
const turnY = (moves, n) => (n ? turnY(relabel(moves, Y), n - 1) : moves);
const uTurn = (n) => [[], ['U'], ['U2'], ["U'"]][((n % 4) + 4) % 4];

const ID = String.fromCharCode(...Array.from({ length: 54 }, (_, i) => 48 + i));
// to[i] = where the sticker on facelet i ends up after `moves`
const destinations = (moves) => {
  const after = applySequence(ID, moves);
  const to = [];
  for (let j = 0; j < 54; j++) to[after.charCodeAt(j) - 48] = j;
  return to;
};

// A search option: `pre` U turns, the algorithm body, `post` U turns (grip frame unless told otherwise).
const option = (alg, body, pre = 0, post = 0, frame = flipMoves) => ({
  alg, body, pre, post,
  to: destinations(frame([...uTurn(pre), ...body, ...uTurn(post)])),
});
const FACE_TURNS = ['U', 'R', 'F', 'D', 'L', 'B']
  .flatMap((f) => [f, f + "'", f + '2'])
  .map((m) => option(null, [m], 0, 0, (x) => x));
const U_TURNS = [1, 2, 3].map((n) => option(null, [], n));
// Each algorithm tried at all four slots around the cube.
const slots = (algs) => [0, 1, 2, 3].flatMap((r) => Object.values(algs).map((a) => option(a, turnY(a.moves, r))));
// Each last-layer algorithm tried from all four angles, plus plain U turns.
const lastLayer = (algs, undo = true) => [
  ...U_TURNS,
  ...[0, 1, 2, 3].flatMap((k) => Object.values(algs).map((a) => option(a, a.moves, k, undo ? -k : 0))),
];
const OPTIONS = {
  whiteCorners: [...U_TURNS, ...slots(ALGORITHMS.whiteCorners)],
  middleLayer: [...U_TURNS, ...slots(ALGORITHMS.middleLayer)],
  yellowCross: lastLayer(ALGORITHMS.yellowCross, false),
  yellowEdges: lastLayer(ALGORITHMS.yellowEdges),
  yellowCornersPosition: lastLayer(ALGORITHMS.yellowCornersPosition),
  yellowCornersOrient: lastLayer(ALGORITHMS.yellowCornersOrient),
};

// --- Search -----------------------------------------------------------------

// Breadth-first over the positions of the tracked stickers; returns the options to apply, in order.
function search(state, homes, options, done = (pos) => pos.every((p, i) => p === homes[i])) {
  const start = homes.map((h) => locate(state, h));
  if (done(start)) return [];
  const seen = new Set([String.fromCharCode(...start)]);
  let frontier = [{ pos: start }];
  while (frontier.length) {
    const next = [];
    for (const node of frontier) {
      for (const opt of options) {
        const pos = node.pos.map((p) => opt.to[p]);
        const key = String.fromCharCode(...pos);
        if (seen.has(key)) continue;
        seen.add(key);
        const child = { pos, opt, parent: node };
        if (done(pos)) {
          const path = [];
          for (let n = child; n.opt; n = n.parent) path.unshift(n.opt);
          return path;
        }
        next.push(child);
      }
    }
    frontier = next;
  }
  throw new Error('LBL solver: no solution — is this a legal cube state?');
}

// Turn a path of options into teaching steps (engine-frame moves), folding U turns into the next algorithm.
function toSteps(path, piece = null) {
  const steps = [];
  let pending = 0;
  for (const o of path) {
    if (!o.alg) { pending += o.pre; continue; }
    steps.push({ name: o.alg.name, description: o.alg.description, piece, moves: flipMoves([...uTurn(pending + o.pre), ...o.body]) });
    pending = o.post;
  }
  if (pending % 4) steps.push({ name: 'line-up', description: 'Turn the top layer to line everything up.', piece, moves: flipMoves(uTurn(pending)) });
  return steps;
}

// Solve `pieces` one at a time without losing the ones in `kept`.
function placeEach(state, pieces, kept, options) {
  const homes = kept.map(anchor);
  const steps = [];
  for (const p of pieces) {
    homes.push(anchor(p));
    const added = toSteps(search(state, homes, options), homeColours(state, p));
    steps.push(...added);
    state = applySequence(state, added.flatMap((s) => s.moves));
  }
  return steps;
}

// --- Stage solvers: each returns steps of { name, description, piece, moves } -----

function solveWhiteCross(state) {
  const homes = [];
  const steps = [];
  for (const p of W_EDGES) {
    homes.push(anchor(p));
    const moves = search(state, homes, FACE_TURNS).flatMap((o) => o.body);
    if (!moves.length) continue;
    steps.push({ ...ALGORITHMS.whiteCross.intuitive, piece: homeColours(state, p), moves });
    state = applySequence(state, moves);
  }
  return steps;
}

const solveWhiteCorners = (state) => placeEach(state, W_CORNERS, W_EDGES, OPTIONS.whiteCorners);
const solveMiddleLayer = (state) => placeEach(state, MID_EDGES, [...W_EDGES, ...W_CORNERS], OPTIONS.middleLayer);

const Y_EDGE_HOMES = Y_EDGES.map(anchor);
const LAST_LAYER_HOMES = [...Y_EDGES, ...Y_CORNERS].map(anchor);

const solveYellowCross = (state) =>
  toSteps(search(state, Y_EDGE_HOMES, OPTIONS.yellowCross, (pos) => pos.every((p) => faceOf(p) === D)));

const solveYellowEdges = (state) => toSteps(search(state, Y_EDGE_HOMES, OPTIONS.yellowEdges));

const solveYCornersPosition = (state) =>
  toSteps(search(state, LAST_LAYER_HOMES, OPTIONS.yellowCornersPosition,
    (pos) => pos.every((p, i) => (i < 4 ? p === LAST_LAYER_HOMES[i] : Y_CORNERS[i - 4].includes(p)))));

const solveYCornersOrient = (state) => toSteps(search(state, LAST_LAYER_HOMES, OPTIONS.yellowCornersOrient));

const SOLVERS = [solveWhiteCross, solveWhiteCorners, solveMiddleLayer, solveYellowCross, solveYellowEdges, solveYCornersPosition, solveYCornersOrient];

// The full staged solution. `moves` are engine-frame and chain from one stage into the next.
export function solveLBL(cubeState) {
  let state = cubeState;
  return SOLVERS.map((solve, stage) => {
    const steps = solve(state);
    const moves = steps.flatMap((s) => s.moves);
    state = applySequence(state, moves);
    return { stage, name: STAGES[stage].name, moves, steps };
  });
}

// --- Stage checks and highlights ----------------------------------------------

const home = (state, pieces) => pieces.every((p) => p.every((f) => state[f] === state[centre(f)]));
const CHECKS = [
  (s) => home(s, W_EDGES),
  (s) => home(s, W_CORNERS),
  (s) => home(s, MID_EDGES),
  (s) => Y_EDGE_HOMES.every((f) => s[f] === s[centre(f)]),
  (s) => home(s, Y_EDGES),
  (s) => Y_CORNERS.every((p) => p.every((f) => p.some((g) => s[g] === s[centre(f)]))),
  (s) => home(s, Y_CORNERS),
];
// A stage is complete when it and every stage before it hold.
export const isStageComplete = (cubeState, stage) => CHECKS.slice(0, stage + 1).every((check) => check(cubeState));

const CENTRES = [4, 13, 22, 31, 40, 49];
// Sticker indices (0–53) that matter for a stage: its pieces plus the centres.
export function getHighlightedStickers(cubeState, stage) {
  const white = cubeState[centre(U * 9)], yellow = cubeState[centre(D * 9)];
  const size = [2, 3, 2, 2, 2, 3, 3][stage];
  const relevant = (cols) =>
    stage < 2 ? cols.includes(white) : stage === 2 ? !cols.includes(white) && !cols.includes(yellow) : cols.includes(yellow);
  return new Set([
    ...CENTRES,
    ...PIECES.filter((p) => p.length === size && relevant(p.map((f) => cubeState[f]))).flat(),
  ]);
}
