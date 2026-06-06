import React from 'react';
import { CubeFrame, BuildingSkeleton, WaterTankTower } from './models/WireframeModels';

interface PlacedModel {
  id: number;
  type: string;
  position: [number, number, number];
  scale: number;
  rotation: [number, number, number];
}

interface SceneProps {
  placedModels: PlacedModel[];
  onModelPlaced: (position: [number, number, number]) => void;
  onModelUpdate: (id: number, updates: Partial<PlacedModel>) => void;
  isPreview?: boolean;
}

export default function Scene({ placedModels, onModelPlaced, onModelUpdate, isPreview = false }: SceneProps) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      
      {isPreview && <gridHelper args={[10, 20, '#444466', '#222244']} position={[0, -0.5, 0]} />}
      
      {placedModels.map((model) => {
        let ModelComponent;
        switch (model.type) {
          case 'cube': ModelComponent = CubeFrame; break;
          case 'building': ModelComponent = BuildingSkeleton; break;
          case 'watertank': ModelComponent = WaterTankTower; break;
          default: return null;
        }
        
        return (
          <group key={model.id} position={model.position} scale={model.scale} rotation={model.rotation}>
            <ModelComponent />
          </group>
        );
      })}
      
      {isPreview && placedModels.length === 0 && (
        <group position={[0, 0, 0]} rotation={[0.5, 0.5, 0]}>
          <CubeFrame color="#00d4ff" scale={0.8} />
        </group>
      )}
    </>
  );
}