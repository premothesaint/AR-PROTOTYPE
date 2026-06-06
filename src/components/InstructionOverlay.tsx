import React from 'react';

interface InstructionOverlayProps {
  arSession: string;
  onStartAR: () => void;
  isMobile?: boolean;
}

export default function InstructionOverlay({ arSession, onStartAR }: InstructionOverlayProps) {
  if (arSession === 'active') return null;

  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);

  return (
    <div style={{
      background: 'rgba(10, 10, 26, 0.95)',
      border: '2px solid #2a2a3e',
      borderRadius: '16px',
      padding: '32px',
      maxWidth: '320px',
      textAlign: 'center'
    }}>
      <h2 style={{
        fontSize: '20px',
        color: '#00d4ff',
        marginBottom: '16px',
        fontFamily: 'monospace'
      }}>
        {arSession === 'supported' ? 'AR Construction' : 'Preview Mode'}
      </h2>
      
      <p style={{
        fontSize: '13px',
        color: '#8a8a9a',
        marginBottom: '24px',
        fontFamily: 'monospace'
      }}>
        {arSession === 'supported' 
          ? 'Point camera at a flat surface'
          : isIOS 
            ? 'iOS detected - make sure you are on HTTPS' 
            : 'WebXR requires mobile device'
        }
      </p>

      {arSession === 'supported' && (
        <button
          onClick={onStartAR}
          style={{
            background: 'linear-gradient(135deg, #4a90e2, #00d4ff)',
            color: 'white',
            border: 'none',
            padding: '14px 32px',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: 'bold',
            fontFamily: 'monospace',
            cursor: 'pointer',
            width: '100%'
          }}
        >
          Start AR Session
        </button>
      )}
    </div>
  );
}