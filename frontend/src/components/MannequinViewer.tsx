'use client';

import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid, Center, Text, Line } from '@react-three/drei';
import * as THREE from 'three';
import { MeshData, MeshRing } from '@/types';
import { RotateCw, Eye, Sparkles } from 'lucide-react';

interface MannequinViewerProps {
  meshData: MeshData;
  activeRingKey?: string | null;
  onRingSelect?: (ringName: string) => void;
  className?: string;
}

// 3D Lofted Body Mesh Sub-component
function LoftedBodyMesh({
  meshData,
  wireframe,
}: {
  meshData: MeshData;
  wireframe: boolean;
}) {
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    
    // Scale vertices from millimeters to meters for Three.js scene (e.g. 1650mm -> 1.65m)
    const scale = 0.001;
    const flatVertices: number[] = [];
    
    meshData.vertices.forEach(([x, y, z]) => {
      flatVertices.push(x * scale, y * scale, z * scale);
    });

    const flatIndices: number[] = [];
    meshData.faces.forEach(([f0, f1, f2]) => {
      flatIndices.push(f0, f1, f2);
    });

    geo.setAttribute('position', new THREE.Float32BufferAttribute(flatVertices, 3));
    geo.setIndex(flatIndices);
    geo.computeVertexNormals();
    return geo;
  }, [meshData]);

  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial
        color="#c5a059" // Khmer golden silk hue
        roughness={0.35}
        metalness={0.2}
        wireframe={wireframe}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// Interactive Glowing Measurement Ring Sub-component
function GlowingMeasurementRing({
  ring,
  isActive,
  onSelect,
}: {
  ring: MeshRing;
  isActive: boolean;
  onSelect: () => void;
}) {
  const ringRef = useRef<THREE.Group>(null);
  const scale = 0.001;
  const yPos = ring.y_mm * scale;
  const radiusA = ring.radius_a_mm * scale * 1.015; // Slightly outside skin
  const radiusB = ring.radius_b_mm * scale * 1.015;

  const pointsArray = useMemo(() => {
    const pts: [number, number, number][] = [];
    const segments = 64;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      const x = radiusA * Math.cos(theta);
      const z = radiusB * Math.sin(theta);
      pts.push([x, 0, z]);
    }
    return pts;
  }, [radiusA, radiusB]);

  useFrame(({ clock }) => {
    if (ringRef.current && isActive) {
      const t = clock.getElapsedTime();
      const pulse = 1.0 + Math.sin(t * 5.0) * 0.04;
      ringRef.current.scale.set(pulse, 1, pulse);
    }
  });

  return (
    <group ref={ringRef} position={[0, yPos, 0]} onClick={(e) => { e.stopPropagation(); onSelect(); }}>
      {/* Visual glowing line */}
      <Line
        points={pointsArray}
        color={isActive ? "#00ffcc" : "#e6b800"}
        lineWidth={isActive ? 3 : 1.5}
      />

      {/* Floating 3D Label when active */}
      {isActive && (
        <group position={[0, 0.05, radiusB + 0.06]}>
          <Text
            fontSize={0.045}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.004}
            outlineColor="#0f172a"
          >
            {`${ring.name_km || ring.name}: ${ring.circumference_cm} cm (${(ring.circumference_mm / 25.4).toFixed(1)}")`}
          </Text>
        </group>
      )}
    </group>
  );
}

// Scene Root with dynamic camera & lighting
function Scene({
  meshData,
  activeRingKey,
  onRingSelect,
  autoRotate,
  wireframe,
}: {
  meshData: MeshData;
  activeRingKey?: string | null;
  onRingSelect?: (name: string) => void;
  autoRotate: boolean;
  wireframe: boolean;
}) {
  const modelHeight = (meshData.height_mm || 1650) * 0.001;
  const centerY = modelHeight / 2;

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, centerY, 2.5]} fov={42} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[3, 4, 3]} intensity={1.4} castShadow />
      <directionalLight position={[-3, 2, -2]} intensity={0.6} color="#d4af37" />
      <pointLight position={[0, centerY, 1.5]} intensity={0.7} color="#ffffff" />

      <Center position={[0, -centerY * 0.8, 0]}>
        <group>
          {/* Reconstructed 3D Body Mesh */}
          <LoftedBodyMesh meshData={meshData} wireframe={wireframe} />

          {/* Glowing Rings */}
          {meshData.rings && meshData.rings.map((ring) => {
            const isMatch = activeRingKey
              ? ring.name.toLowerCase().includes(activeRingKey.toLowerCase()) ||
                activeRingKey.toLowerCase().includes(ring.name.toLowerCase())
              : false;
            return (
              <GlowingMeasurementRing
                key={ring.name}
                ring={ring}
                isActive={isMatch}
                onSelect={() => onRingSelect && onRingSelect(ring.name)}
              />
            );
          })}
        </group>
      </Center>

      <Grid
        position={[0, -modelHeight * 0.45, 0]}
        args={[4, 4]}
        cellSize={0.2}
        cellColor="#475569"
        sectionSize={1}
        sectionColor="#64748b"
        fadeDistance={4}
      />

      <OrbitControls
        autoRotate={autoRotate}
        autoRotateSpeed={1.5}
        enablePan={false}
        minDistance={1.2}
        maxDistance={4.0}
        maxPolarAngle={Math.PI / 2 + 0.1}
      />
    </>
  );
}

export default function MannequinViewer({
  meshData,
  activeRingKey,
  onRingSelect,
  className = "w-full h-[500px]",
}: MannequinViewerProps) {
  const [autoRotate, setAutoRotate] = useState(false);
  const [wireframe, setWireframe] = useState(false);

  return (
    <div className={`relative bg-gradient-to-b from-slate-950 via-slate-900 to-amber-950/40 rounded-2xl overflow-hidden border border-amber-500/20 shadow-2xl ${className}`}>
      {/* 3D Canvas */}
      <Canvas shadows gl={{ antialias: true, alpha: true }}>
        <Scene
          meshData={meshData}
          activeRingKey={activeRingKey}
          onRingSelect={onRingSelect}
          autoRotate={autoRotate}
          wireframe={wireframe}
        />
      </Canvas>

      {/* Floating Toolbar Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-amber-500/30 text-xs text-amber-200">
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`flex items-center gap-1 px-2 py-1 rounded-md transition ${autoRotate ? 'bg-amber-500 text-slate-950 font-semibold' : 'hover:bg-slate-800'}`}
          title="Toggle Auto Rotation"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>Rotate</span>
        </button>

        <button
          onClick={() => setWireframe(!wireframe)}
          className={`flex items-center gap-1 px-2 py-1 rounded-md transition ${wireframe ? 'bg-amber-500 text-slate-950 font-semibold' : 'hover:bg-slate-800'}`}
          title="Toggle Wireframe Mesh"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Wireframe</span>
        </button>
      </div>

      {/* Active Measurement Badge */}
      {activeRingKey && (
        <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-xl border border-cyan-400/40 flex items-center gap-2 shadow-lg">
          <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
          <div>
            <div className="text-[10px] text-cyan-300 uppercase tracking-widest font-mono">Active Contour Ring</div>
            <div className="text-sm font-bold text-white capitalize">{activeRingKey.replace(/_/g, ' ')}</div>
          </div>
        </div>
      )}
    </div>
  );
}
