export const SOLVED_STATE = "WWWWWWWWWRRRRRRRRRGGGGGGGGGYYYYYYYYYOOOOOOOOOBBBBBBBBB";
// Standard WCA Facelet Mapping:
// U: 0..8   (White)
// R: 9..17  (Red)
// F: 18..26 (Green)
// D: 27..35 (Yellow)
// L: 36..44 (Orange)
// B: 45..53 (Blue)
// Note: In our model, F=Green, R=Red, U=White, D=Yellow, L=Orange, B=Blue

const cycle = (arr, a, b, c, d) => {
  const temp = arr[d];
  arr[d] = arr[c];
  arr[c] = arr[b];
  arr[b] = arr[a];
  arr[a] = temp;
};

const rotateFace = (arr, faceIndex) => {
  const f = faceIndex * 9;
  cycle(arr, f + 0, f + 2, f + 8, f + 6); // Corners
  cycle(arr, f + 1, f + 5, f + 7, f + 3); // Edges
};

export const applyMove = (stateStr, move) => {
  let arr = stateStr.split('');
  let count = 1;
  if (move.endsWith("'")) count = 3;
  if (move.endsWith("2")) count = 2;
  const baseMove = move[0];

  for (let i = 0; i < count; i++) {
    if (baseMove === 'U') {
      rotateFace(arr, 0);
      cycle(arr, 18, 36, 45, 9);
      cycle(arr, 19, 37, 46, 10);
      cycle(arr, 20, 38, 47, 11);
    } else if (baseMove === 'R') {
      rotateFace(arr, 1);
      cycle(arr, 8, 45, 35, 26);
      cycle(arr, 5, 48, 32, 23);
      cycle(arr, 2, 51, 29, 20);
    } else if (baseMove === 'F') {
      rotateFace(arr, 2);
      cycle(arr, 6, 9, 29, 44);
      cycle(arr, 7, 12, 28, 41);
      cycle(arr, 8, 15, 27, 38);
    } else if (baseMove === 'D') {
      rotateFace(arr, 3);
      cycle(arr, 24, 15, 51, 42);
      cycle(arr, 25, 16, 52, 43);
      cycle(arr, 26, 17, 53, 44);
    } else if (baseMove === 'L') {
      rotateFace(arr, 4);
      cycle(arr, 0, 18, 27, 53);
      cycle(arr, 3, 21, 30, 50);
      cycle(arr, 6, 24, 33, 47);
    } else if (baseMove === 'B') {
      rotateFace(arr, 5);
      cycle(arr, 2, 36, 33, 17);
      cycle(arr, 1, 39, 34, 14);
      cycle(arr, 0, 42, 35, 11);
    }
  }
  return arr.join('');
};

export const applySequence = (stateStr, moves) => {
  let curr = stateStr;
  for (const m of moves) {
    curr = applyMove(curr, m);
  }
  return curr;
};

export const invertMove = (move) => {
  if (move.endsWith("'")) return move[0];
  if (move.endsWith("2")) return move;
  return move + "'";
};
