import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Cubie } from './Cubie';
import useCubeStore from '../../store/useCubeStore';

const positions = [];
for (let x = -1; x <= 1; x++) {
  for (let y = -1; y <= 1; y++) {
    for (let z = -1; z <= 1; z++) {
      if (x === 0 && y === 0 && z === 0) continue;
      positions.push([x, y, z]);
    }
  }
}

export const CubeRenderer = () => {
  const cubeState = useCubeStore(state => state.cubeState);
  const highlightedCubies = useCubeStore(state => state.highlightedCubies);

  return (
    <div className="w-full h-full bg-slate-900">
      <Canvas camera={{ position: [4, 4, 5], fov: 45 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 10, 10]} intensity={1} />
        <directionalLight position={[-10, -10, -10]} intensity={0.5} />
        
        <group>
          {positions.map(([x, y, z]) => (
            <Cubie 
              key={`${x}-${y}-${z}`} 
              x={x} y={y} z={z} 
              stateStr={cubeState} 
              highlightedCubies={highlightedCubies} 
            />
          ))}
        </group>

        <OrbitControls 
          enablePan={false} 
          minDistance={3} 
          maxDistance={10} 
          enableDamping={true}
          dampingFactor={0.1}
        />
      </Canvas>
    </div>
  );
};
