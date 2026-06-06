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
    // Don't check until user interacts - iOS requires user gesture
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      setArSession('supported');
    }
  }, []);

  const handleStartAR = async () => {
    console.log('Start AR button clicked');
    setShowOverlay(false);
    
    try {
      // Check if WebXR is available
      if (!('xr' in navigator)) {
        // Try to request directly - iOS Safari might support it
        alert('WebXR API not found. Please make sure you are using Safari on iOS 12+');
        setShowOverlay(true);
        return;
      }

      const xr = (navigator as any).xr;
      
      // Check if immersive-ar is supported
      try {
        const supported = await xr.isSessionSupported('immersive-ar');
        console.log('AR supported:', supported);
        
        if (!supported) {
          alert('AR not supported on this device/browser');
          setShowOverlay(true);
          return;
        }
      } catch (checkError) {
        console.error('Error checking AR support:', checkError);
        // Continue anyway - some iOS versions throw here but still work
      }

      // Request AR session
      const session = await xr.requestSession('immersive-ar', {
        requiredFeatures: ['hit-test'],
        optionalFeatures: ['dom-overlay', 'local-floor', 'bounded-floor'],
      });

      console.log('AR Session created:', session);
      setArSession('active');
      
      // Handle session end
      session.addEventListener('end', () => {
        console.log('AR Session ended');
        setArSession('supported');
        setShowOverlay(true);
      });

    } catch (error: any) {
      console.error('AR Error:', error);
      
      let message = 'Could not start AR. ';
      if (error.message?.includes('user gesture')) {
        message += 'Please tap the button again.';
      } else if (error.message?.includes('camera')) {
        message += 'Please allow camera access in Settings > Safari > Camera.';
      } else {
        message += 'Make sure you are on HTTPS and using Safari on iOS 12+.';
      }
      
      alert(message);
      setShowOverlay(true);
    }
  };

  const handleCanvasClick = () => {
    if (arSession !== 'active') {
      const newModel = {
        id: nextId.current++,
        type: selectedModel,
        position: [(Math.random() - 0.5) * 4, 0, (Math.random() - 0.5) * 4] as [number, number, number],
        scale: 0.3 + Math.random() * 0.3,
        rotation: [0, Math.random() * Math.PI * 2, 0] as [number, number, number]
      };
      setPlacedModels(prev => [...prev, newModel]);
    }
  };

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      background: '#0a0a1a', 
      position: 'fixed', 
      top: 0, 
      left: 0,
      touchAction: 'manipulation'
    }}>
      <StatusBar arSession={arSession} />
      
      <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
        <Canvas camera={{ position: [0, 3, 6], fov: 50 }}>
          <Scene
            placedModels={placedModels}
            onModelPlaced={() => {}}
            onModelUpdate={() => {}}
            isPreview={arSession !== 'active'}
          />
          <OrbitControls 
            enableDamping
            enablePan={false}
            enableZoom={true}
            minDistance={2}
            maxDistance={10}
          />
        </Canvas>
      </div>

      {/* Overlay with Start AR Button */}
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
            zIndex: 1000,
            pointerEvents: 'auto'
          }}
        >
          <div 
            style={{
              background: 'rgba(10, 10, 26, 0.98)',
              border: '2px solid #00d4ff',
              borderRadius: '20px',
              padding: '40px',
              maxWidth: '320px',
              width: '90%',
              textAlign: 'center',
              boxShadow: '0 0 30px rgba(0, 212, 255, 0.3)'
            }}
          >
            <h2 style={{ 
              color: '#00d4ff', 
              fontFamily: 'monospace', 
              fontSize: '22px',
              marginBottom: '20px',
              letterSpacing: '2px'
            }}>
              AR CONSTRUCTION
            </h2>
            
            <p style={{ 
              color: '#8a8a9a', 
              fontFamily: 'monospace',
              fontSize: '13px',
              marginBottom: '30px',
              lineHeight: '1.6'
            }}>
              {arSession === 'supported' 
                ? 'Point your camera at a flat surface to place 3D models'
                : 'Preview mode - open on mobile for AR'
              }
            </p>

            {arSession === 'supported' && (
              <button
                onClick={handleStartAR}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  handleStartAR();
                }}
                style={{
                  background: 'linear-gradient(135deg, #4a90e2, #00d4ff)',
                  color: 'white',
                  border: 'none',
                  padding: '18px 40px',
                  borderRadius: '12px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  fontFamily: 'monospace',
                  letterSpacing: '2px',
                  cursor: 'pointer',
                  width: '100%',
                  pointerEvents: 'auto',
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
                  userSelect: 'none',
                  outline: 'none'
                }}
              >
                START AR SESSION
              </button>
            )}
            
            <p style={{
              color: '#666',
              fontSize: '10px',
              fontFamily: 'monospace',
              marginTop: '16px'
            }}>
              Requires iOS 12+ / Android 8+
            </p>
          </div>
        </div>
      )}

      {/* Model Selector */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1000 }}>
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