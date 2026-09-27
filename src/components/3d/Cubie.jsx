import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

// Map logical facelet characters to hex colors
const COLOR_MAP = {
  W: '#ffffff',
  Y: '#ffd500',
  R: '#b71234',
  O: '#ff5800',
  G: '#009b48',
  B: '#0046ad'
};

const getFaceIndices = (x, y, z) => {
  const indices = { U: null, R: null, F: null, D: null, L: null, B: null };
  
  if (y === 1)  indices.U = (z === -1 ? 0 : z === 0 ? 3 : 6) + (x === -1 ? 0 : x === 0 ? 1 : 2);
  if (x === 1)  indices.R = 9 + (y === 1 ? 0 : y === 0 ? 3 : 6) + (z === 1 ? 0 : z === 0 ? 1 : 2);
  if (z === 1)  indices.F = 18 + (y === 1 ? 0 : y === 0 ? 3 : 6) + (x === -1 ? 0 : x === 0 ? 1 : 2);
  if (y === -1) indices.D = 27 + (z === 1 ? 0 : z === 0 ? 3 : 6) + (x === -1 ? 0 : x === 0 ? 1 : 2);
  if (x === -1) indices.L = 36 + (y === 1 ? 0 : y === 0 ? 3 : 6) + (z === -1 ? 0 : z === 0 ? 1 : 2);
  if (z === -1) indices.B = 45 + (y === 1 ? 0 : y === 0 ? 3 : 6) + (x === 1 ? 0 : x === 0 ? 1 : 2);

  return indices;
};

// Sticker component for a single face of a cubie
const Sticker = ({ position, rotation, color, isHighlighted = true }) => {
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[0.9, 0.9]} />
      <meshStandardMaterial 
        color={color || '#000000'}
        transparent
        opacity={isHighlighted ? 1 : 0.2} 
        emissive={isHighlighted && color ? color : '#000000'}
        emissiveIntensity={isHighlighted && color ? 0.2 : 0}
        side={THREE.DoubleSide} 
      />
    </mesh>
  );
};

export const Cubie = ({ x, y, z, stateStr, highlightedCubies }) => {
  const indices = getFaceIndices(x, y, z);
  const isHighlighted = highlightedCubies.size === 0 || highlightedCubies.has(`${x},${y},${z}`);

  return (
    <group position={[x * 1.05, y * 1.05, z * 1.05]}>
      {/* Black Core */}
      <RoundedBox args={[1, 1, 1]} radius={0.1} smoothness={4}>
        <meshStandardMaterial color="#111111" />
      </RoundedBox>

      {/* Faces */}
      {indices.U !== null && <Sticker position={[0, 0.51, 0]} rotation={[-Math.PI / 2, 0, 0]} color={COLOR_MAP[stateStr[indices.U]]} isHighlighted={isHighlighted} />}
      {indices.D !== null && <Sticker position={[0, -0.51, 0]} rotation={[Math.PI / 2, 0, 0]} color={COLOR_MAP[stateStr[indices.D]]} isHighlighted={isHighlighted} />}
      
      {indices.F !== null && <Sticker position={[0, 0, 0.51]} rotation={[0, 0, 0]} color={COLOR_MAP[stateStr[indices.F]]} isHighlighted={isHighlighted} />}
      {indices.B !== null && <Sticker position={[0, 0, -0.51]} rotation={[0, Math.PI, 0]} color={COLOR_MAP[stateStr[indices.B]]} isHighlighted={isHighlighted} />}
      
      {indices.R !== null && <Sticker position={[0.51, 0, 0]} rotation={[0, Math.PI / 2, 0]} color={COLOR_MAP[stateStr[indices.R]]} isHighlighted={isHighlighted} />}
      {indices.L !== null && <Sticker position={[-0.51, 0, 0]} rotation={[0, -Math.PI / 2, 0]} color={COLOR_MAP[stateStr[indices.L]]} isHighlighted={isHighlighted} />}
    </group>
  );
};
