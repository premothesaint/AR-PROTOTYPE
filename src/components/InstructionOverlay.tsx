import React from 'react';

export default function InstructionOverlay({ arSession, onStartAR }: { arSession: string; onStartAR: () => void }) {
  if (arSession === 'active') return null;

  return (
    <div style={{
      background: 'rgba(10, 10, 26, 0.95)', border: '2px solid #2a2a3e',
      borderRadius: '16px', padding: '32px', maxWidth: '300px', textAlign: 'center'
    }}>
      <h2 style={{ fontSize: '20px', color: '#00d4ff', fontFamily: 'monospace', marginBottom: '16px' }}>
        {arSession === 'supported' ? 'AR CONSTRUCTION' : 'PREVIEW MODE'}
      </h2>
      <p style={{ fontSize: '13px', color: '#8a8a9a', marginBottom: '24px', fontFamily: 'monospace' }}>
        {arSession === 'supported' ? 'Point camera at a flat surface' : 'WebXR requires Android Chrome'}
      </p>
      {arSession === 'supported' && (
        <button onClick={onStartAR} style={{
          background: 'linear-gradient(135deg, #4a90e2, #00d4ff)', color: 'white',
          border: 'none', padding: '14px 32px', borderRadius: '10px', fontSize: '14px',
          fontFamily: 'monospace', cursor: 'pointer', width: '100%'
        }}>
          START AR SESSION
        </button>
      )}
    </div>
  );
}