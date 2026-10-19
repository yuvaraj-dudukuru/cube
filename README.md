# 🎲 Rubik's Cube Learning App

An interactive, step-by-step 3D guide to solving the 3×3 Rubik's Cube — built with React, Three.js, and a custom Layer-by-Layer (LBL) solver engine.

---

## ✨ Features

- **Interactive 3D Cube** — A fully rendered, rotatable 3×3 Rubik's Cube using WebGL/Three.js.
- **Layer-by-Layer (LBL) Teaching Mode** — Guides the user through all 7 stages of the beginner's LBL method.
- **Adaptive Solver** — If you make a wrong move, the app instantly recomputes the solution from your cube's current state — no punishment, no restart.
- **Progressive Hint System** — Three levels of hints:
  1. Highlights the relevant pieces on the cube.
  2. Names and describes the target piece.
  3. Displays the exact next move in large text.
- **Keyboard & Button Controls** — Turn any face using on-screen buttons or keyboard keys (`U`, `D`, `L`, `R`, `F`, `B`; hold `Shift` for the prime/inverse turn).
- **Auto-Scramble** — Scrambles the cube with 20 random moves before each learning session.
- **Move Navigation** — Step forward or backward through the solution one move at a time.
- **Stage Progress Bar** — Visual indicator showing which of the 7 stages are complete, active, or upcoming.
- **Responsive Layout** — Works on desktop (side-by-side panel) and mobile (stacked layout).

---

## 🧩 The 7 Solving Stages

The app teaches the classic **Layer-by-Layer (LBL)** method. Each stage has a goal, and the 3D cube highlights only the pieces relevant to that stage.

| # | Stage | Goal |
|---|-------|------|
| 1 | **White Cross** | Build a white plus sign on top. Each white edge goes above its matching colour centre. |
| 2 | **White Corners** | Place all 4 white corners to complete the top (white) layer. |
| 3 | **Middle Layer** | Insert the 4 middle-layer edge pieces (no yellow stickers). |
| 4 | **Yellow Cross** | Orient yellow edges to form a cross on top. Position doesn't matter yet. |
| 5 | **Yellow Edges** | Cycle the yellow edges until each one is above its matching centre colour. |
| 6 | **Yellow Corners — Position** | Move each yellow corner above its correct slot (colour-facing doesn't matter yet). |
| 7 | **Orient Yellow Corners** | Twist each yellow corner in place to complete the solve. |

> After stage 1 (White Cross), the cube is flipped yellow-side up. All move names shown in the UI reflect this grip automatically.

---

## 🏗️ Project Architecture

```
cube/
├── index.html                  # App entry point
├── vite.config.js              # Vite build configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── src/
│   ├── main.jsx                # React root mount
│   ├── App.jsx                 # Root component — layout + mode switching
│   ├── components/
│   │   ├── LearnPanel.jsx      # Right panel: stage info, move list, hint system, controls
│   │   └── 3d/
│   │       ├── CubeRenderer.jsx  # Three.js canvas setup (react-three-fiber)
│   │       └── Cubie.jsx         # Individual cubie (small cube piece) mesh + highlighting
│   ├── core/
│   │   ├── cubeState.js        # Pure cube state engine (string-based, WCA facelet order)
│   │   └── lbl-solver/
│   │       ├── index.js        # Full LBL solver + stage checks + highlighting logic
│   │       ├── algorithms.js   # Named algorithms (F2L inserts, OLL, PLL etc.)
│   │       └── check.js        # Stage completion predicates
│   └── store/
│       ├── useCubeStore.js     # Zustand store: cube state, scramble, apply move
│       └── useTeachingStore.js # Zustand store: learning session state, hint level, move tracking
```

### Key Modules

#### `src/core/cubeState.js`
The low-level, pure-JavaScript cube engine. The cube state is represented as a 54-character string following the standard **WCA facelet mapping**:

```
U: 0–8   (White)   R: 9–17  (Red)    F: 18–26 (Green)
D: 27–35 (Yellow)  L: 36–44 (Orange) B: 45–53 (Blue)
```

Exports:
- `SOLVED_STATE` — the canonical solved state string.
- `applyMove(state, move)` — applies a single move (`U`, `R'`, `F2`, etc.) and returns the new state.
- `applySequence(state, moves[])` — applies an array of moves in order.
- `invertMove(move)` — returns the inverse of a move (`R` → `R'`, `R'` → `R`, `R2` → `R2`).

#### `src/core/lbl-solver/index.js`
A pure-JavaScript **breadth-first search** solver that computes the LBL solution for any valid cube state. It:
- Identifies all 20 movable pieces (12 edges + 8 corners) from facelet positions.
- Runs BFS over piece positions to find the shortest path to place each piece.
- Breaks the solution into named **steps** with descriptions (e.g., "white-red edge · intuitive").
- Exports `STAGES` (stage metadata), `solveLBL(cubeState)` (full solution), `isStageComplete`, and `getHighlightedStickers`.

#### `src/store/useCubeStore.js`
[Zustand](https://github.com/pmndrs/zustand) store managing the physical cube state: apply a move, reset, or scramble.

#### `src/store/useTeachingStore.js`
Zustand store managing the entire learning session:
- Tracks current stage, current move index, and hint level.
- Handles **wrong moves gracefully** — re-plans from the current state without scolding the user.
- Controls the amber flash (wrong layer), stage-complete banner, and auto-advance timer.

#### `src/components/3d/CubeRenderer.jsx` & `Cubie.jsx`
Uses [`@react-three/fiber`](https://github.com/pmndrs/react-three-fiber) and [`@react-three/drei`](https://github.com/pmndrs/drei) to render the cube. Each of the 26 visible cubies is an independent `Cubie` component that dims when it is not relevant to the current stage.

#### `src/components/LearnPanel.jsx`
The instructional right panel. Shows:
- Stage name, intent text, and a progress bar across all 7 stages.
- The current step's algorithm move sequence (past moves greyed out, current move highlighted in blue).
- Hint text (shown progressively).
- Navigation buttons (← Prev / Next →) and all 12 face-turn buttons.
- Keyboard listener for `U D L R F B` (with `Shift` for prime turns).

---

## 🚀 Running Locally

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or newer
- npm (comes with Node.js)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/yuvaraj-dudukuru/cube.git
cd cube

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

The app will be available at **http://localhost:5173** (or the next available port).

### Other Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Vite dev server with HMR |
| `npm run build` | Build the production bundle to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run Oxlint static analysis |

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| [React 18](https://react.dev/) | UI framework |
| [Vite](https://vitejs.dev/) | Build tool and dev server |
| [Three.js](https://threejs.org/) | 3D rendering engine |
| [@react-three/fiber](https://github.com/pmndrs/react-three-fiber) | React renderer for Three.js |
| [@react-three/drei](https://github.com/pmndrs/drei) | Three.js helpers (OrbitControls, etc.) |
| [Zustand](https://github.com/pmndrs/zustand) | Lightweight global state management |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first CSS styling |
| [Lucide React](https://lucide.dev/) | Icon library |
| [Oxlint](https://oxc.rs/docs/guide/usage/linter.html) | Fast JavaScript linter |

---

## 📖 How to Use the App

1. **Open the app** — you'll see the 3D cube on the left and the landing screen on the right.
2. **Click "Start Learning"** — the cube scrambles and the first stage (White Cross) begins.
3. **Follow the instructions** in the right panel:
   - The relevant pieces are **brighter** on the cube; unrelated pieces are dimmed.
   - The move sequence for the current step is shown in monospace. The **next move** is highlighted in blue.
   - Click **Next →** to apply the next move automatically, or make the move yourself using the buttons or keyboard.
   - Click **← Prev** to undo the last move.
4. **Made a wrong move?** No problem — the plan updates silently to find a new path from wherever your cube is now. A brief amber border flashes to let you know.
5. **Need help?** Click **Hint** up to 3 times for progressively more direct guidance.
6. **Finish all 7 stages** to see the solved confirmation screen, then scramble and go again!

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

---

## 📄 License

This project is open source. See the repository for license details.
