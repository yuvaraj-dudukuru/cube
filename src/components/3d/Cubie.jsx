import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import useTeachingStore from '../../store/useTeachingStore';

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

const WHITE = new THREE.Color('#ffffff');

// Sticker component for a single face of a cubie
const Sticker = ({ position, rotation, color, dim = false, glow = 0, flashAt = 0 }) => {
  const mesh = useRef();
  const mat = useRef();
  const base = useMemo(() => new THREE.Color(color || '#000000'), [color]);
  const shown = useMemo(() => {
    if (!dim) return color || '#000000';
    const hsl = base.getHSL({});
    return '#' + new THREE.Color().setHSL(hsl.h, hsl.s * 0.3, hsl.l).getHexString();
  }, [base, color, dim]);

  useFrame(({ clock }) => {
    const sinceFlash = flashAt ? (performance.now() - flashAt) / 600 : 1;
    const flash = sinceFlash < 1 ? Math.sin(Math.PI * sinceFlash) : 0;
    const pulse = glow ? 0.5 + 0.5 * Math.sin(clock.elapsedTime * 6) : 0;
    mat.current.emissive.copy(base).lerp(WHITE, Math.max(flash, glow * pulse * 0.4));
    mat.current.emissiveIntensity = dim ? 0 : 0.2 + glow * pulse + flash;
    mesh.current.scale.setScalar(1 - 0.12 * glow * pulse);
  });

  return (
    <mesh ref={mesh} position={position} rotation={rotation}>
      <planeGeometry args={[0.9, 0.9]} />
      <meshStandardMaterial
        ref={mat}
        color={shown}
        transparent
        opacity={dim ? 0.25 : 1}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

export const Cubie = ({ x, y, z, stateStr, highlightedPieces }) => {
  const indices = getFaceIndices(x, y, z);
  const glowPieces = useTeachingStore(state => state.glowPieces);
  const brightGlow = useTeachingStore(state => state.hintLevel >= 2);
  const flashAt = useTeachingStore(state => state.flashAt);
  // Per-sticker look: dimmed outside the highlighted set, pulsing on the target piece.
  const look = (i) => {
    const dim = highlightedPieces?.size > 0 && !highlightedPieces.has(i);
    return {
      color: COLOR_MAP[stateStr[i]],
      dim,
      glow: glowPieces.has(i) ? (brightGlow ? 1 : 0.4) : 0,
      flashAt: dim ? 0 : flashAt,
    };
  };

  return (
    <group position={[x * 1.05, y * 1.05, z * 1.05]}>
      {/* Black Core */}
      <RoundedBox args={[1, 1, 1]} radius={0.1} smoothness={4}>
        <meshStandardMaterial color="#111111" />
      </RoundedBox>

      {/* Faces */}
      {indices.U !== null && <Sticker position={[0, 0.51, 0]} rotation={[-Math.PI / 2, 0, 0]} {...look(indices.U)} />}
      {indices.D !== null && <Sticker position={[0, -0.51, 0]} rotation={[Math.PI / 2, 0, 0]} {...look(indices.D)} />}
      
      {indices.F !== null && <Sticker position={[0, 0, 0.51]} rotation={[0, 0, 0]} {...look(indices.F)} />}
      {indices.B !== null && <Sticker position={[0, 0, -0.51]} rotation={[0, Math.PI, 0]} {...look(indices.B)} />}
      
      {indices.R !== null && <Sticker position={[0.51, 0, 0]} rotation={[0, Math.PI / 2, 0]} {...look(indices.R)} />}
      {indices.L !== null && <Sticker position={[-0.51, 0, 0]} rotation={[0, -Math.PI / 2, 0]} {...look(indices.L)} />}
    </group>
  );
};
