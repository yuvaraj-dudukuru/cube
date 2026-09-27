import { CubeRenderer } from './components/3d/CubeRenderer';

function App() {
  return (
    <div className="w-screen h-screen flex flex-col md:flex-row bg-slate-900 text-white overflow-hidden">
      {/* Left Panel: 3D Cube (40% on desktop, top half on mobile) */}
      <div className="w-full h-1/2 md:w-[40%] md:h-full relative border-b md:border-b-0 md:border-r border-slate-700">
        <CubeRenderer />
      </div>

      {/* Right Panel: Active Content (60% on desktop, bottom half on mobile) */}
      <div className="w-full h-1/2 md:w-[60%] md:h-full flex flex-col items-center justify-center p-8">
        <h1 className="text-4xl font-bold mb-4 font-sans text-center">Rubik's Cube Learning App</h1>
        <p className="text-slate-400 text-lg mb-8 text-center max-w-md">
          A step-by-step interactive guide to solving the 3x3 Rubik's cube.
        </p>
        <div className="flex gap-4">
          <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition-colors">
            Start Learning
          </button>
          <button className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition-colors">
            Free Play
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
