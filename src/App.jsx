import { CubeRenderer } from './components/3d/CubeRenderer';
import { LearnPanel } from './components/LearnPanel';
import { SOLVED_STATE } from './core/cubeState';
import useCubeStore from './store/useCubeStore';
import useTeachingStore, { isFlipped } from './store/useTeachingStore';

function App() {
  const learning = useTeachingStore(state => state.active);
  const highlightedPieces = useTeachingStore(state => state.highlightedPieces);
  const flipped = useTeachingStore(isFlipped);
  const amber = useTeachingStore(state => state.amber);
  const banner = useTeachingStore(state => state.banner);
  const nextStage = useTeachingStore(state => state.nextStage);

  const startLearning = () => {
    const cube = useCubeStore.getState();
    if (cube.cubeState === SOLVED_STATE) cube.scrambleCube();
    useTeachingStore.getState().startLearnMode();
  };

  return (
    <div className="w-screen h-screen supports-[height:100dvh]:h-dvh flex flex-col md:flex-row bg-slate-900 text-white overflow-hidden">
      {/* Left Panel: 3D Cube (40% on desktop, top half on mobile; a little less while learning, to fit the controls) */}
      <div className={`w-full ${learning ? 'h-[40%]' : 'h-1/2'} md:w-[40%] md:h-full relative border-b md:border-b-0 md:border-r border-slate-700`}>
        <CubeRenderer highlightedPieces={highlightedPieces} flipped={flipped} />
        {/* Brief amber border when a turn was not the expected one: on at once, fades out */}
        <div className={`pointer-events-none absolute inset-0 border-4 border-amber-500 ${amber ? 'opacity-100' : 'opacity-0 transition-opacity duration-300'}`} />
        {/* Stage-complete banner, over the cube so it is in view on any screen (clear of the top face); tap to skip the wait */}
        <div aria-live="polite">
          {banner && (
            <button className="absolute inset-x-4 bottom-4 md:bottom-auto md:top-4 p-3 md:p-4 bg-emerald-600 rounded-lg md:text-lg font-semibold shadow-lg text-left" onClick={nextStage}>
              {banner}
            </button>
          )}
        </div>
      </div>

      {/* Right Panel: Active Content (60% on desktop, bottom half on mobile) */}
      {learning ? (
        <div className="w-full h-[60%] md:w-[60%] md:h-full">
          <LearnPanel />
        </div>
      ) : (
        <div className="w-full h-1/2 md:w-[60%] md:h-full flex flex-col items-center justify-center p-8">
          <h1 className="text-4xl font-bold mb-4 font-sans text-center">Rubik's Cube Learning App</h1>
          <p className="text-slate-400 text-lg mb-8 text-center max-w-md">
            A step-by-step interactive guide to solving the 3x3 Rubik's cube.
          </p>
          <div className="flex gap-4">
            <button onClick={startLearning} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition-colors">
              Start Learning
            </button>
            <button className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition-colors">
              Free Play
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
