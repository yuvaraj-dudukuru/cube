// Algorithm lookup table for the layer-by-layer method.
// Everything after the white cross is written for the solving grip:
// yellow centre on top, white on the bottom.
export const ALGORITHMS = {
  whiteCross: {
    intuitive: {
      name: 'intuitive',
      moves: [],
      description: 'No fixed algorithm: find the white edge and turn it into the top face, next to its matching side centre.',
    },
  },
  whiteCorners: {
    'insert-right': {
      name: 'insert-right',
      moves: ['R', 'U', "R'", "U'"],
      description: 'Swaps the corner above a slot with the one inside it. Repeat until the white sticker faces down.',
    },
    'insert-left': {
      name: 'insert-left',
      moves: ["L'", "U'", 'L', 'U'],
      description: 'Mirror of insert-right, for when the white sticker faces the other way.',
    },
  },
  middleLayer: {
    'insert-right': {
      name: 'insert-right',
      moves: ['U', 'R', "U'", "R'", "U'", "F'", 'U', 'F'],
      description: 'Edge belongs in the slot to the right. Align it on top, then insert.',
    },
    'insert-left': {
      name: 'insert-left',
      moves: ["U'", "L'", 'U', 'L', 'U', 'F', "U'", "F'"],
      description: 'Edge belongs in the slot to the left.',
    },
  },
  yellowCross: {
    dot: {
      name: 'dot',
      // F R U R' U' F' f R U R' U' f' — the wide f turns are written as
      // outer-layer turns because the move engine has no wide moves.
      moves: ['F', 'R', 'U', "R'", "U'", "F'", 'B', 'U', 'L', "U'", "L'", "B'"],
      description: 'No yellow edges face up.',
    },
    'L-shape': {
      name: 'L-shape',
      moves: ['F', 'U', 'R', "U'", "R'", "F'"],
      description: 'Two adjacent yellow edges face up (L shape). Hold the L at the back-left.',
    },
    line: {
      name: 'line',
      moves: ['F', 'R', 'U', "R'", "U'", "F'"],
      description: 'Two opposite yellow edges face up (line). Hold the line horizontally.',
    },
  },
  yellowEdges: {
    'swap-edges': {
      name: 'swap-edges',
      moves: ['R', 'U', "R'", 'U', 'R', 'U2', "R'", 'U'],
      description: 'Swaps the front and left yellow edges. The other two stay where they are.',
    },
  },
  yellowCornersPosition: {
    'cycle-corners': {
      name: 'cycle-corners',
      moves: ['U', 'R', "U'", "L'", 'U', "R'", "U'", 'L'],
      description: '3 corners are in the wrong positions. The corner that stays put is at the front-right.',
    },
  },
  yellowCornersOrient: {
    sune: {
      name: 'sune',
      moves: ['R', 'U', "R'", 'U', 'R', 'U2', "R'"],
      description: 'Sune — twists three corners. Repeat for other cases.',
    },
    'anti-sune': {
      name: 'anti-sune',
      moves: ['R', 'U2', "R'", "U'", 'R', "U'", "R'"],
      description: 'Anti-Sune — Sune run backwards.',
    },
    headlights: {
      name: 'headlights',
      moves: ['R2', "D'", 'R', 'U2', "R'", 'D', 'R', 'U2', 'R'],
      description: 'Two corners face the same direction (headlights).',
    },
    niklas: {
      name: 'niklas',
      moves: ['R', "U'", "L'", 'U', "R'", "U'", 'L'],
      description: 'Niklas — cycles three corners.',
    },
  },
};
