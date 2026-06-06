import React from 'react';
import { Canvas } from '@react-three/fiber';
import { CubeFrame, BuildingSkeleton, WaterTankTower } from './models/WireframeModels';

type ModelType = 'cube' | 'building' | 'watertank';

const models: { type: ModelType; label: string; color: string }[] = [
  { type: 'cube', label: 'CUBE', color: '#00d4ff' },
  { type: 'building', label: 'BUILDING', color: '#4a90e2' },
  { type: 'watertank', label: 'TANK', color: '#87CEEB' },
];

export default function ModelSelector({ selectedModel, onSelectModel, arSession }: {
  selectedModel: ModelType;
  onSelectModel: (model: ModelType) => void;
  arSession: string;
}) {
  if (arSession !== 'active') return null;

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, height: '130px',
      background: 'rgba(26, 26, 46, 0.95)', borderTop: '1px solid #2a2a3e',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px',
      padding: '12px', zIndex: 100
    }}>
      {models.map(({ type, label, color }) => (
        <button key={type} onClick={() => onSelectModel(type)} style={{
          width: '95px', height: '100px',
          background: selectedModel === type ? 'rgba(0, 212, 255, 0.1)' : 'rgba(15, 15, 26, 0.8)',
          border: `2px solid ${selectedModel === type ? color : '#2a2a3e'}`,
          borderRadius: '12px', cursor: 'pointer', padding: '8px',
          display: 'flex', flexDirection: 'column', alignItems: 'center'
        }}>
          <div style={{ width: '65px', height: '65px' }}>
            <Canvas camera={{ position: [0, 0, 2.5] }}>
              <ambientLight intensity={0.6} />
              <group rotation={[0.5, 0.5, 0]}>
                {type === 'cube' && <CubeFrame color={color} scale={0.5} />}
                {type === 'building' && <BuildingSkeleton color={color} scale={0.5} />}
                {type === 'watertank' && <WaterTankTower color={color} scale={0.5} />}
              </group>
            </Canvas>
          </div>
          <span style={{ fontSize: '10px', color: selectedModel === type ? color : '#8a8a9a', fontFamily: 'monospace', marginTop: '4px' }}>
            {label}
          </span>
        </button>
      ))}
    </div>
  );
}