import React, { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import ModelSelector from './components/ModelSelector';
import StatusBar from './components/StatusBar';
import Scene from './components/Scene';

type ModelType = 'cube' | 'building' | 'watertank';

function App() {
  const [selectedModel, setSelectedModel] = useState<ModelType>('cube');
  const [placedModels, setPlacedModels] = useState<any[]>([]);
  const [arSession, setArSession] = useState<'unsupported' | 'supported' | 'active'>('unsupported');
  const nextId = useRef(0);
  const [showOverlay, setShowOverlay] = useState(true);

  useEffect(() => {
    // Auto-detect as supported on mobile
    if (/iPhone|iPad|iPod|Android/.test(navigator.userAgent)) {
      setArSession('supported');
    }
  }, []);

  const handleStartAR = async () => {
    setShowOverlay(false);
    try {
      if ('xr' in navigator) {
        const session = await (navigator as any).xr.requestSession('immersive-ar', {
          requiredFeatures: ['hit-test'],
        });
        setArSession('active');
      } else {
        alert('WebXR not available. Try Safari on iOS 12+ or Chrome on Android.');
      }
    } catch (error) {
      alert('AR failed. Make sure you are on HTTPS.');
      setShowOverlay(true);
    }
  };

  const handleCanvasClick = () => {
    const newModel = {
      id: nextId.current++,
      type: selectedModel,
      position: [(Math.random() - 0.5) * 4, 0, (Math.random() - 0.5) * 4] as [number, number, number],
      scale: 0.3 + Math.random() * 0.3,
      rotation: [0, Math.random() * Math.PI * 2, 0] as [number, number, number]
    };
    setPlacedModels(prev => [...prev, newModel]);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#0a0a1a', position: 'fixed', top: 0, left: 0 }}>
      <StatusBar arSession={arSession} />
      
      <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
        <Canvas camera={{ position: [0, 3, 6], fov: 50 }}>
          <Scene
            placedModels={placedModels}
            onModelPlaced={() => {}}
            onModelUpdate={() => {}}
            isPreview={arSession !== 'active'}
          />
          <OrbitControls />
        </Canvas>
      </div>

      {/* Clickable Overlay */}
      {showOverlay && arSession !== 'active' && (
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            background: 'rgba(10, 10, 26, 0.3)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div 
            style={{
              background: 'rgba(10, 10, 26, 0.95)',
              border: '2px solid #2a2a3e',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '300px',
              textAlign: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ color: '#00d4ff', fontFamily: 'monospace', marginBottom: '16px' }}>
              {arSession === 'supported' ? 'AR Ready' : 'Preview Mode'}
            </h2>
            
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleStartAR();
              }}
              style={{
                background: 'linear-gradient(135deg, #4a90e2, #00d4ff)',
                color: 'white',
                border: 'none',
                padding: '16px 32px',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: 'bold',
                fontFamily: 'monospace',
                cursor: 'pointer',
                width: '100%',
                marginTop: '16px',
                pointerEvents: 'auto',
                zIndex: 1000
              }}
            >
              START AR SESSION
            </button>
          </div>
        </div>
      )}

      {/* Model Selector */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 100 }}>
        <ModelSelector 
          selectedModel={selectedModel} 
          onSelectModel={setSelectedModel} 
          arSession={arSession}
        />
      </div>
    </div>
  );
}

export default App;