// scripts/generate-icons.js
import { createCanvas } from 'canvas';
import fs from 'fs';

function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, size, size);
  
  // Grid pattern
  ctx.strokeStyle = '#4a90e2';
  ctx.lineWidth = size * 0.02;
  
  const gridSize = size / 8;
  for (let i = 0; i < size; i += gridSize) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(size, i);
    ctx.stroke();
  }
  
  // Center cube wireframe
  const center = size / 2;
  const cubeSize = size * 0.3;
  
  ctx.strokeStyle = '#00d4ff';
  ctx.lineWidth = size * 0.03;
  
  // Draw cube wireframe
  const points = [
    [-1, -1], [1, -1], [1, 1], [-1, 1]
  ];
  
  points.forEach(([x, y], i) => {
    const next = points[(i + 1) % points.length];
    ctx.beginPath();
    ctx.moveTo(center + x * cubeSize/2, center + y * cubeSize/2);
    ctx.lineTo(center + next[0] * cubeSize/2, center + next[1] * cubeSize/2);
    ctx.stroke();
  });
  
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(`public/icon-${size}.png`, buffer);
}

generateIcon(192);
generateIcon(512);
console.log('Icons generated!');