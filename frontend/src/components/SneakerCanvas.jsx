import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, PresentationControls } from '@react-three/drei';

function SneakerModel({ rotation = [0.3, 0.5, 0] }) {
  const meshRef = useRef();

  // Basic shoe shape using primitives
  return (
    <group ref={meshRef} rotation={rotation} position={[0, -1, 0]}>
      {/* Shoe base */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[3, 0.5, 1.5]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      {/* Shoe top */}
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[3, 1, 1.5]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>
      
      {/* Shoe details */}
      <mesh position={[-1, 1.2, 0]}>
        <boxGeometry args={[0.5, 0.1, 1.5]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      
      {/* More details */}
      <mesh position={[0, 1.2, 0]}>
        <boxGeometry args={[0.5, 0.1, 1.5]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
    </group>
  );
}

export default function SneakerCanvas() {
  return (
    <div style={{ width: '100%', height: '400px', background: '#f8f8f8', borderRadius: '8px', overflow: 'hidden' }}>
      <Canvas shadows camera={{ position: [0, 2, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[5, 5, 5]} angle={0.15} penumbra={1} intensity={1} />
        <PresentationControls
          global
          rotation={[0, -0.3, 0]}
          polar={[-0.4, 0.2]}
          azimuth={[-1, 0.75]}
          config={{ mass: 2, tension: 400 }}
          snap={{ mass: 4, tension: 400 }}
        >
          <SneakerModel />
        </PresentationControls>
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
