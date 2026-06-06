import React, { useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import ModelSelector from './components/ModelSelector';
import InstructionOverlay from './components/InstructionOverlay';
import StatusBar from './components/StatusBar';
import Scene from './components/Scene';
import './App.css';

type ModelType = 'cube' | 'building' | 'watertank';

interface PlacedModel {
  id: number;
  type: ModelType;
  position: [number, number, number];
  scale: number;
  rotation: [number, number, number];
}

function App() {
  const [selectedModel, setSelectedModel] = useState<ModelType>('cube');
  const [placedModels, setPlacedModels] = useState<PlacedModel[]>([]);
  const [arSession, setArSession] = useState<'unsupported' | 'supported' | 'active'>('unsupported');
  const nextId = useRef(0);

  React.useEffect(() => {
    if ('xr' in navigator) {
      (navigator as any).xr?.isSessionSupported('immersive-ar')
        .then((supported: boolean) => setArSession(supported ? 'supported' : 'unsupported'))
        .catch(() => setArSession('unsupported'));
    }
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#0a0a1a', overflow: 'hidden' }}>
      <StatusBar arSession={arSession} />
      
      <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
        <Canvas camera={{ position: [0, 2, 5], fov: 50 }}>
          <Scene
            placedModels={placedModels}
            onModelPlaced={() => {}}
            onModelUpdate={() => {}}
            isPreview
          />
        </Canvas>
      </div>

      <div style={{
        position: 'fixed', top: '40px', left: 0, right: 0, bottom: '130px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none', zIndex: 50
      }}>
        <div style={{ pointerEvents: 'auto' }}>
          <InstructionOverlay arSession={arSession} onStartAR={() => setArSession('active')} />
        </div>
      </div>

      <ModelSelector selectedModel={selectedModel} onSelectModel={setSelectedModel} arSession={arSession} />
    </div>
  );
}

export default App;