import React from 'react';
import * as THREE from 'three';

export function CubeFrame({ color = '#00d4ff', scale = 1 }: { color?: string; scale?: number }) {
  return (
    <lineSegments scale={scale}>
      <edgesGeometry args={[new THREE.BoxGeometry(1, 1, 1)]} />
      <lineBasicMaterial color={color} />
    </lineSegments>
  );
}

export function BuildingSkeleton({ color = '#4a90e2', scale = 1 }: { color?: string; scale?: number }) {
  const vertices: number[] = [];
  const w = 0.8, h = 1.5, d = 0.8;
  
  // Vertical posts
  for (let x = -1; x <= 1; x += 2) {
    for (let z = -1; z <= 1; z += 2) {
      vertices.push(x * w/2, -h/2, z * d/2, x * w/2, h/2, z * d/2);
    }
  }
  
  // Horizontal beams
  for (let floor = 0; floor <= 3; floor++) {
    const y = -h/2 + (floor * h/3);
    [-1, 1].forEach(x => {
      vertices.push(x * w/2, y, -d/2, x * w/2, y, d/2);
    });
    [-1, 1].forEach(z => {
      vertices.push(-w/2, y, z * d/2, w/2, y, z * d/2);
    });
  }
  
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  
  return (
    <lineSegments geometry={geometry} scale={scale}>
      <lineBasicMaterial color={color} />
    </lineSegments>
  );
}

export function WaterTankTower({ color = '#87CEEB', scale = 1 }: { color?: string; scale?: number }) {
  const vertices: number[] = [];
  const baseSize = 0.4, towerHeight = 1.5, tankRadius = 0.3, tankHeight = 0.5;
  
  // Legs
  for (let x = -1; x <= 1; x += 2) {
    for (let z = -1; z <= 1; z += 2) {
      vertices.push(x * baseSize/2, -towerHeight/2, z * baseSize/2, x * baseSize/2, towerHeight/2 - tankHeight, z * baseSize/2);
    }
  }
  
  // Tank rings
  for (let i = 0; i < 8; i++) {
    const a1 = (i / 8) * Math.PI * 2;
    const a2 = ((i + 1) / 8) * Math.PI * 2;
    const yB = towerHeight/2 - tankHeight;
    const yT = towerHeight/2;
    
    vertices.push(Math.cos(a1)*tankRadius, yB, Math.sin(a1)*tankRadius, Math.cos(a2)*tankRadius, yB, Math.sin(a2)*tankRadius);
    vertices.push(Math.cos(a1)*tankRadius, yT, Math.sin(a1)*tankRadius, Math.cos(a2)*tankRadius, yT, Math.sin(a2)*tankRadius);
    vertices.push(Math.cos(a1)*tankRadius, yB, Math.sin(a1)*tankRadius, Math.cos(a1)*tankRadius, yT, Math.sin(a1)*tankRadius);
  }
  
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  
  return (
    <lineSegments geometry={geometry} scale={scale}>
      <lineBasicMaterial color={color} />
    </lineSegments>
  );
}