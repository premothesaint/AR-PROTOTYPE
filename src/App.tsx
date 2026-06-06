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
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    checkARSupport();
  }, []);

  const checkARSupport = async () => {
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    console.log('Device:', { isIOS, isAndroid });

    // Try standard WebXR check
    if ('xr' in navigator) {
      try {
        const supported = await (navigator as any).xr.isSessionSupported('immersive-ar');
        console.log('Standard WebXR AR supported:', supported);
        if (supported) {
          setArSession('supported');
          return;
        }
      } catch (e) {
        console.log('WebXR check error:', e);
      }
    }

    // On mobile, assume supported and try anyway
    if (isIOS || isAndroid) {
      console.log('Mobile device - setting as supported');
      setArSession('supported');
    }
  };

  const handleStartAR = async () => {
    console.log('Attempting to start AR...');
    setShowOverlay(false);

    try {
      // Method 1: Standard WebXR
      if ('xr' in navigator) {
        const xr = (navigator as any).xr;
        
        // Try without checking first (some browsers fail check but succeed request)
        const session = await xr.requestSession('immersive-ar', {
          requiredFeatures: ['hit-test'],
          optionalFeatures: ['dom-overlay', 'local-floor', 'bounded-floor'],
        }).catch(async () => {
          // Try with minimal features
          return await xr.requestSession('immersive-ar', {
            requiredFeatures: [],
            optionalFeatures: ['hit-test'],
          });
        });

        console.log('AR Session started!', session);
        setArSession('active');

        session.addEventListener('end', () => {
          console.log('AR ended');
          setArSession('supported');
          setShowOverlay(true);
        });

        return;
      }

      // Method 2: Use WebRTC + MediaStream for iOS Safari
      const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
      if (isIOS) {
        // Request camera access first (this triggers AR capabilities on iOS)
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });

        console.log('Camera access granted');
        
        // Stop the stream - we just needed to trigger camera permission
        stream.getTracks().forEach(track => track.stop());

        // Try WebXR again after camera permission
        if ('xr' in navigator) {
          const session = await (navigator as any).xr.requestSession('immersive-ar', {
            requiredFeatures: ['hit-test'],
          });
          
          console.log('AR Session started after camera permission!');
          setArSession('active');
          return;
        }

        // If still no WebXR, show camera feed as fallback
        alert('WebXR not available. Camera access is working but AR features require iOS 13+ with Safari.');
        setShowOverlay(true);
        return;
      }

      alert('AR not available on this device. Please use:\n\n• iPhone/iPad with iOS 13+ and Safari\n• Android with Chrome');
      setShowOverlay(true);

    } catch (error: any) {
      console.error('AR Error:', error);
      
      let message = 'Could not start AR. ';
      if (error.name === 'NotAllowedError') {
        message = 'Camera permission denied. Please allow camera access in Settings > Safari > Camera.';
      } else if (error.name === 'NotSupportedError') {
        message = 'AR not supported on this device/browser.';
      } else if (error.name === 'SecurityError') {
        message = 'HTTPS is required for AR. Make sure you\'re using a secure connection.';
      } else {
        message += error.message || 'Unknown error';
      }
      
      alert(message);
      setShowOverlay(true);
    }
  };

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
        <Canvas 
          ref={canvasRef}
          camera={{ position: [0, 3, 6], fov: 50 }}
        >
          <Scene
            placedModels={placedModels}
            onModelPlaced={() => {}}
            onModelUpdate={() => {}}
            isPreview={arSession !== 'active'}
          />
          <OrbitControls enableDamping />
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
          background: 'rgba(10, 10, 26, 0.7)'
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
            <h2 style={{ color: '#00d4ff', fontFamily: 'monospace', marginBottom: '20px' }}>
              AR CONSTRUCTION
            </h2>
            
            <p style={{ color: '#8a8a9a', fontFamily: 'monospace', fontSize: '13px', marginBottom: '25px' }}>
              Point your camera at a flat surface to place 3D models
            </p>

            <button
              onClick={handleStartAR}
              style={{
                background: 'linear-gradient(135deg, #4a90e2, #00d4ff)',
                color: 'white',
                border: 'none',
                padding: '18px 40px',
                borderRadius: '12px',
                fontSize: '18px',
                fontWeight: 'bold',
                fontFamily: 'monospace',
                cursor: 'pointer',
                width: '100%',
                touchAction: 'manipulation'
              }}
            >
              START AR SESSION
            </button>

            <p style={{ color: '#666', fontSize: '11px', fontFamily: 'monospace', marginTop: '15px' }}>
              Camera permission required
            </p>
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