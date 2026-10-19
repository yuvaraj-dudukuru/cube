import { useEffect } from 'react';
import useTeachingStore, { isFlipped, stepAt } from '../store/useTeachingStore';
import useCubeStore from '../store/useCubeStore';
import { STAGES, describePiece, flipMoves } from '../core/lbl-solver';

const FACES = ['U', 'D', 'L', 'R', 'F', 'B'];
const LAST_LAYER_HINTS = {
  3: 'Look at the yellow edges on top — only which way they face matters.',
  4: 'Look at the yellow edges on top — compare their side colours with the centres.',
  5: 'Look at the yellow corners on top — check which slot each one sits above.',
  6: 'Look at the yellow corners on top — find the ones whose yellow faces sideways.',
};

export const LearnPanel = () => {
  const { solution, currentStageIndex, currentMoveIndex, hintLevel, completing, finished } = useTeachingStore();
  const { advanceMove, goBackMove, requestHint, userMove, startLearnMode, exitLearnMode } = useTeachingStore();
  const scrambleCube = useCubeStore((state) => state.scrambleCube);

  // After the white cross the cube is shown yellow-side up; moves are named for that grip.
  const flipped = useTeachingStore(isFlipped);
  const inGrip = (move) => (flipped ? flipMoves([move])[0] : move);

  useEffect(() => {
    const onKey = (e) => {
      const face = e.key.toUpperCase();
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey || !FACES.includes(face)) return;
      userMove(inGrip(face + (e.shiftKey ? "'" : '')));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (finished) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-6 p-8 text-center">
        <h2 className="text-3xl font-bold">Cube solved ✓</h2>
        <div className="flex gap-3">
          <button className="px-5 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold" onClick={() => { scrambleCube(); startLearnMode(); }}>
            Scramble and go again
          </button>
          <button className="px-5 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold" onClick={exitLearnMode}>
            Exit
          </button>
        </div>
      </div>
    );
  }

  const stage = solution[currentStageIndex];
  if (!stage) return null;
  const { step, start } = stepAt(stage, currentMoveIndex);
  const nextMove = stage.moves[currentMoveIndex];
  const hint = step.piece ? `Find the glowing piece — it's the ${describePiece(step.piece)}.` : LAST_LAYER_HINTS[currentStageIndex];

  return (
    <div className="w-full h-full flex flex-col gap-3 md:gap-4 px-4 pt-4 md:p-8 overflow-y-auto">
      <div>
        <div className="flex gap-1 mb-2">
          {STAGES.map((s, i) => (
            <div key={s.name} className={`h-1.5 flex-1 rounded ${i < currentStageIndex ? 'bg-emerald-500' : i === currentStageIndex ? 'bg-blue-500' : 'bg-slate-700'}`} />
          ))}
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-lg md:text-2xl font-bold">Stage {currentStageIndex + 1} of {STAGES.length} — {stage.name}</h2>
          <button className="text-sm text-slate-400 hover:text-white" onClick={exitLearnMode}>Exit</button>
        </div>
        <p className="text-sm md:text-base text-slate-300 mt-1">{STAGES[currentStageIndex].intent}</p>
        {flipped && <p className="text-xs md:text-sm text-slate-500 mt-1">The cube is shown yellow-side up from here on — white stays on the bottom.</p>}
      </div>

      <div className="bg-slate-800 rounded-lg p-3 md:p-4">
        <div className="text-sm text-slate-400">
          <span className="font-semibold text-slate-200">{step.piece ? describePiece(step.piece) : step.name}</span>
          {step.piece && step.name !== 'intuitive' && <> · {step.name}</>}
        </div>
        <div className="flex flex-wrap gap-2 mt-2 font-mono text-lg">
          {step.moves.map((move, i) => {
            const at = start + i;
            const style = at < currentMoveIndex
              ? 'text-slate-600'
              : at === currentMoveIndex ? 'font-bold text-white bg-blue-600 rounded px-2' : 'text-slate-400';
            return <span key={i} className={style}>{inGrip(move)}</span>;
          })}
        </div>
        <div aria-live="polite">
          {hintLevel >= 1 && (
            <div className="mt-3 pt-3 border-t border-slate-700">
              <p className="text-sm md:text-base text-amber-200">{hint}</p>
              {hintLevel >= 3 && nextMove && <p className="text-3xl md:text-4xl font-bold mt-1">Turn: {inGrip(nextMove)}</p>}
            </div>
          )}
        </div>
        <p className="text-xs md:text-sm text-slate-400 mt-3">{step.description}</p>
      </div>

      <p className="text-xs md:text-sm text-slate-500 md:order-last">Turned something else? Don't worry — the steps simply update to match your cube.</p>

      {/* Pinned to the bottom of the panel on small screens so the controls never scroll out of reach */}
      <div className="sticky bottom-0 mt-auto -mx-4 px-4 py-3 bg-slate-900 border-t border-slate-800 flex flex-col gap-3 md:static md:mt-0 md:mx-0 md:p-0 md:border-0">
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold disabled:opacity-40" onClick={goBackMove} disabled={completing || currentMoveIndex === 0}>
            ← Prev
          </button>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold" onClick={advanceMove}>
            {completing ? 'Continue →' : 'Next →'}
          </button>
          <button className="px-4 py-2 bg-amber-600 hover:bg-amber-500 rounded-lg font-semibold ml-auto disabled:opacity-40" onClick={requestHint} disabled={hintLevel >= 3}>
            Hint
          </button>
        </div>
        <div>
          <p className="hidden md:block text-sm text-slate-400 mb-2">Turn a layer yourself (or press U D L R F B, with Shift for the reverse turn):</p>
          <div className="grid grid-cols-6 gap-2 max-w-md font-mono">
            {['', "'"].flatMap((suffix) => FACES.map((face) => (
              <button key={face + suffix} className="py-2 bg-slate-700 hover:bg-slate-600 active:bg-slate-500 rounded-lg font-semibold" onClick={() => userMove(inGrip(face + suffix))}>
                {face + suffix}
              </button>
            )))}
          </div>
        </div>
      </div>
    </div>
  );
};
