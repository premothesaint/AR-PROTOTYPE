import React, { useEffect, useState } from 'react';

interface StatusBarProps {
  arSession: string;
}

export default function StatusBar({ arSession }: StatusBarProps) {
  const [deviceInfo, setDeviceInfo] = useState('');

  useEffect(() => {
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    if (isIOS) setDeviceInfo('iOS');
    else if (isAndroid) setDeviceInfo('Android');
    else setDeviceInfo('Desktop');
  }, []);

  const getStatusColor = () => {
    switch (arSession) {
      case 'active': return '#44ff44';
      case 'supported': return '#ffa500';
      default: return '#ff4444';
    }
  };

  const getStatusText = () => {
    switch (arSession) {
      case 'active': return 'AR ACTIVE';
      case 'supported': return 'AR READY';
      default: return 'PREVIEW MODE';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '44px',
      background: 'rgba(26, 26, 46, 0.95)',
      borderBottom: '1px solid #2a2a3e',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      paddingTop: 'env(safe-area-inset-top)',
      zIndex: 100,
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: getStatusColor(),
          animation: arSession === 'active' ? 'pulse 2s infinite' : 'none'
        }} />
        <span style={{
          fontSize: '11px',
          color: '#8a8a9a',
          fontFamily: 'monospace',
          letterSpacing: '1px',
          fontWeight: 'bold'
        }}>
          {getStatusText()}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{
          fontSize: '9px',
          color: '#4a90e2',
          fontFamily: 'monospace'
        }}>
          {deviceInfo}
        </span>
        <span style={{
          fontSize: '10px',
          color: '#4a90e2',
          fontFamily: 'monospace',
          letterSpacing: '2px'
        }}>
          v1.0
        </span>
      </div>
    </div>
  );
}