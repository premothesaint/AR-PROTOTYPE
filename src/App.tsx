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
    checkARSupport();
  }, []);

  const checkARSupport = async () => {
    console.log('Checking AR support...');
    console.log('User Agent:', navigator.userAgent);
    
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    const isChrome = /Chrome/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && !isChrome;
    
    console.log('Device info:', { isIOS, isAndroid, isChrome, isSafari });

    // Check if WebXR API exists
    const hasWebXR = 'xr' in navigator;
    console.log('Has WebXR API:', hasWebXR);

    if (hasWebXR) {
      try {
        const xr = (navigator as any).xr;
        const supported = await xr.isSessionSupported('immersive-ar');
        console.log('AR session supported:', supported);
        
        if (supported) {
          setArSession('supported');
          return;
        }
      } catch (error) {
        console.log('Error checking AR session:', error);
      }
    }

    // iOS Safari specific - it might have ARKit but not expose standard WebXR
    if (isIOS && isSafari) {
      console.log('iOS Safari detected - checking for AR Quick Look support');
      
      // iOS 12+ has AR Quick Look which can be used as fallback
      const iOSVersion = getIOSVersion();
      console.log('iOS Version:', iOSVersion);
      
      if (iOSVersion >= 12) {
        // iOS 12+ should support WebXR in Safari
        // Force reload with WebXR enabled
        setArSession('supported');
        return;
      }
    }

    // Android Chrome
    if (isAndroid && isChrome) {
      // Chrome on Android should support WebXR
      setArSession('supported');
      return;
    }

    setArSession('unsupported');
  };

  const getIOSVersion = () => {
    const match = navigator.userAgent.match(/OS (\d+)_(\d+)/);
    return match ? parseInt(match[1]) : 0;
  };

  const handleStartAR = async () => {
    console.log('Start AR button clicked');
    setShowOverlay(false);
    
    try {
      // Try standard WebXR first
      if ('xr' in navigator) {
        const xr = (navigator as any).xr;
        
        console.log('Requesting AR session...');
        const session = await xr.requestSession('immersive-ar', {
          requiredFeatures: ['hit-test'],
          optionalFeatures: ['dom-overlay', 'local-floor'],
        });

        console.log('AR Session started:', session);
        setArSession('active');
        
        session.addEventListener('end', () => {
          console.log('AR Session ended');
          setArSession('supported');
          setShowOverlay(true);
        });
        
        return;
      }

      // Fallback for iOS Safari - use AR Quick Look
      const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
      if (isIOS) {
        // Create a simple USDZ model for AR Quick Look
        alert('On iOS, you can use AR Quick Look. In a production app, we would provide .usdz files for AR viewing.');
        setShowOverlay(true);
        return;
      }

      alert('AR is not supported on this device/browser combination.');
      setShowOverlay(true);
      
    } catch (error: any) {
      console.error('AR Error:', error);
      
      // Check for specific errors
      if (error.name === 'NotSupportedError') {
        alert('AR not supported. Make sure you have granted camera permissions.');
      } else if (error.name === 'SecurityError') {
        alert('AR requires HTTPS connection.');
      } else if (error.name === 'InvalidStateError') {
        alert('AR session already active or invalid state.');
      } else {
        alert('Could not start AR: ' + (error.message || 'Unknown error'));
      }
      
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

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      background: '#0a0a1a', 
      position: 'fixed', 
      top: 0, 
      left: 0 
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
            minDistance={2}
            maxDistance={10}
          />
        </Canvas>
      </div>

      {showOverlay && arSession !== 'active' && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          background: 'rgba(10, 10, 26, 0.5)'
        }}>
          <div style={{
            background: 'rgba(10, 10, 26, 0.98)',
            border: '2px solid #00d4ff',
            borderRadius: '20px',
            padding: '30px',
            maxWidth: '320px',
            width: '85%',
            textAlign: 'center'
          }}>
            <h2 style={{ 
              color: '#00d4ff', 
              fontFamily: 'monospace', 
              fontSize: '20px',
              marginBottom: '15px'
            }}>
              {arSession === 'supported' ? 'AR READY' : 'PREVIEW MODE'}
            </h2>
            
            {arSession === 'supported' ? (
              <>
                <p style={{ color: '#8a8a9a', fontFamily: 'monospace', fontSize: '12px', marginBottom: '20px' }}>
                  Point camera at a flat surface
                </p>
                <button
                  onClick={handleStartAR}
                  style={{
                    background: 'linear-gradient(135deg, #4a90e2, #00d4ff)',
                    color: 'white',
                    border: 'none',
                    padding: '16px 32px',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    fontFamily: 'monospace',
                    cursor: 'pointer',
                    width: '100%',
                    pointerEvents: 'auto'
                  }}
                >
                  START AR
                </button>
              </>
            ) : (
              <p style={{ color: '#8a8a9a', fontFamily: 'monospace', fontSize: '12px' }}>
                {isMobile 
                  ? 'Your browser may not support WebXR. Try updating iOS/Safari or use Chrome on Android.'
                  : 'Open this page on a mobile device to use AR features.'
                }
              </p>
            )}
          </div>
        </div>
      )}

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