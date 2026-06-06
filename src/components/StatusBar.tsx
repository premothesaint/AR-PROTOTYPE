import React from 'react';

export default function StatusBar({ arSession }: { arSession: string }) {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: '40px',
      background: 'rgba(26, 26, 46, 0.95)', borderBottom: '1px solid #2a2a3e',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 16px', zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{
          width: '8px', height: '8px', borderRadius: '50%',
          background: arSession === 'active' ? '#44ff44' : arSession === 'supported' ? '#ffa500' : '#ff4444'
        }} />
        <span style={{ fontSize: '11px', color: '#8a8a9a', fontFamily: 'monospace' }}>
          {arSession === 'active' ? 'AR ACTIVE' : arSession === 'supported' ? 'AR READY' : 'AR UNAVAILABLE'}
        </span>
      </div>
    </div>
  );
}