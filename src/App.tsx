import React, { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
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
  const [isMobile, setIsMobile] = useState(false);
  const nextId = useRef(0);

  useEffect(() => {
    // Check if running on mobile device
    const mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    setIsMobile(mobile);

    // Check WebXR support
    async function checkXRSupport() {
      try {
        if ('xr' in navigator) {
          const supported = await (navigator as any).xr?.isSessionSupported('immersive-ar');
          if (supported) {
            setArSession('supported');
            return;
          }
        }
        
        // iOS Safari might not expose WebXR until user interaction
        // Check for iOS device with ARKit support
        if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
          // iOS 12+ supports AR via WebXR
          const iosVersion = parseInt(
            navigator.userAgent.match(/OS (\d+)_(\d+)/)?.[1] || '0'
          );
          if (iosVersion >= 12) {
            setArSession('supported');
            return;
          }
        }
        
        setArSession('unsupported');
      } catch (error) {
        console.log('WebXR check failed:', error);
        setArSession('unsupported');
      }
    }

    checkXRSupport();
  }, []);

  const handleCanvasClick = () => {
    // Add a model when clicking in preview mode
    const newModel: PlacedModel = {
      id: nextId.current++,
      type: selectedModel,
      position: [
        (Math.random() - 0.5) * 4,
        0,
        (Math.random() - 0.5) * 4
      ],
      scale: 0.3 + Math.random() * 0.3,
      rotation: [0, Math.random() * Math.PI * 2, 0]
    };
    setPlacedModels(prev => [...prev, newModel]);
  };

  const handleStartAR = async () => {
    try {
      // Request AR session
      if ('xr' in navigator) {
        const session = await (navigator as any).xr.requestSession('immersive-ar', {
          requiredFeatures: ['hit-test', 'dom-overlay'],
          optionalFeatures: ['local-floor', 'bounded-floor'],
        });
        setArSession('active');
        console.log('AR Session started:', session);
      }
    } catch (error) {
      console.error('Failed to start AR:', error);
      // Fallback: If WebXR fails, at least show an alert
      alert('AR failed to start. Make sure you\'re on HTTPS and have granted camera permissions.');
    }
  };

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      background: '#0a0a1a', 
      overflow: 'hidden',
      position: 'relative'
    }}>
      <StatusBar arSession={arSession} />
      
      <div 
        style={{ 
          width: '100%', 
          height: '100%', 
          position: 'absolute', 
          top: 0, 
          left: 0 
        }}
        onClick={handleCanvasClick}
      >
        <Canvas camera={{ position: [0, 3, 6], fov: 50 }}>
          <Scene
            placedModels={placedModels}
            onModelPlaced={() => {}}
            onModelUpdate={() => {}}
            isPreview={arSession !== 'active'}
          />
          <OrbitControls 
            enableDamping 
            dampingFactor={0.05}
            minDistance={2}
            maxDistance={10}
            maxPolarAngle={Math.PI / 2.5}
            enablePan={true}
            enableZoom={true}
          />
        </Canvas>
      </div>

      {arSession !== 'active' && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 100,
          pointerEvents: 'none'
        }}>
          <div style={{ pointerEvents: 'auto' }}>
            <InstructionOverlay 
              arSession={arSession} 
              onStartAR={handleStartAR}
              isMobile={isMobile}
            />
          </div>
        </div>
      )}

      <ModelSelector 
        selectedModel={selectedModel} 
        onSelectModel={setSelectedModel} 
        arSession={arSession}
      />
    </div>
  );
}

export default App;