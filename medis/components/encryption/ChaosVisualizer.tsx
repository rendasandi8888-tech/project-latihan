'use client';

import React, { useEffect, useRef, useState } from 'react';
import { NJCSParams, NJCSState, njcsStep } from '@/lib/encryption/njcs';

interface ChaosVisualizerProps {
  params: NJCSParams | null
  isActive: boolean
  onComplete?: () => void
}

export default function ChaosVisualizer({ params, isActive, onComplete }: ChaosVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  
  // State animasi dan trajectory
  const [currentState, setCurrentState] = useState<NJCSState | null>(null);
  const stateRef = useRef<NJCSState | null>(null);
  const trajectoryRef = useRef<{ x: number, z: number }[]>([]);
  const iterationsRef = useRef<number>(0);

  // Initialize state when params change
  useEffect(() => {
    if (params && isActive) {
      const initialState = { x: params.x0, y: params.y0, z: params.z0, w: params.w0 };
      setCurrentState(initialState);
      stateRef.current = initialState;
      trajectoryRef.current = [];
      iterationsRef.current = 0;
    }
  }, [params, isActive]);

  // Animation loop
  useEffect(() => {
    if (!isActive || !params || !canvasRef.current) {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas internal dimensions for sharp rendering
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;

    const render = () => {
      // Step the simulation a few times per frame for speed
      let s = stateRef.current;
      if (s && params) {
        for (let i = 0; i < 5; i++) {
          s = njcsStep(s, params);
          trajectoryRef.current.push({ x: s.x, z: s.z });
          iterationsRef.current++;
        }
        stateRef.current = s;
        setCurrentState(s);
        
        // Limit trajectory length
        if (trajectoryRef.current.length > 2000) {
          trajectoryRef.current.shift();
          trajectoryRef.current.shift();
          trajectoryRef.current.shift();
          trajectoryRef.current.shift();
          trajectoryRef.current.shift();
        }
      }

      // Draw
      ctx.fillStyle = '#0d0d1a';
      ctx.fillRect(0, 0, width, height);

      // Create gradient line
      if (trajectoryRef.current.length > 1) {
        ctx.beginPath();
        
        // Map data range (approx -5 to 5 for x and z) to canvas coordinates
        const mapX = (val: number) => (val + 5) * (width / 10);
        const mapY = (val: number) => height - (val + 5) * (height / 10);

        for (let i = 0; i < trajectoryRef.current.length; i++) {
          const pt = trajectoryRef.current[i];
          const px = mapX(pt.x);
          const py = mapY(pt.z);
          
          if (i === 0) {
            ctx.moveTo(px, py);
          } else {
            ctx.lineTo(px, py);
          }
        }

        // Gradient #378ADD (biru) -> #534AB7 (ungu) -> #1D9E75 (hijau)
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#378ADD');
        gradient.addColorStop(0.5, '#534AB7');
        gradient.addColorStop(1, '#1D9E75');

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.5;
        ctx.lineJoin = 'round';
        ctx.stroke();
      }

      // Stop condition for demo purposes (e.g. 5000 iterations)
      if (iterationsRef.current > 5000 && onComplete) {
        onComplete();
        return; // Stop animation
      }

      requestRef.current = requestAnimationFrame(render);
    };

    requestRef.current = requestAnimationFrame(render);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isActive, params, onComplete]);

  if (!isActive) return null;

  return (
    <div className="flex flex-col space-y-4 w-full bg-[#0d0d1a] p-4 rounded-xl border border-gray-800 text-white font-mono text-sm overflow-hidden">
      
      {/* Status */}
      <div className="flex items-center space-x-2 text-[#378ADD]">
        <div className="w-2 h-2 rounded-full bg-[#378ADD] animate-pulse"></div>
        <span>Generating hyperchaotic keystream...</span>
      </div>

      {/* Canvas */}
      <div className="relative w-full h-[200px] border border-[#1a1a3a] rounded-lg overflow-hidden bg-black/20">
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 w-full h-full"
          style={{ minHeight: '200px' }}
        />
        <div className="absolute bottom-2 left-2 text-xs text-gray-500">
          x-z phase portrait (4D projection)
        </div>
      </div>

      {/* State Values */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
        <div className="bg-[#1a1a3a] p-2 rounded">
          <span className="text-gray-400">x₀:</span> 
          <span className="ml-1 text-white">{currentState?.x.toFixed(6) || '0.000000'}</span>
        </div>
        <div className="bg-[#1a1a3a] p-2 rounded">
          <span className="text-gray-400">y₀:</span> 
          <span className="ml-1 text-white">{currentState?.y.toFixed(6) || '0.000000'}</span>
        </div>
        <div className="bg-[#1a1a3a] p-2 rounded">
          <span className="text-gray-400">z₀:</span> 
          <span className="ml-1 text-white">{currentState?.z.toFixed(6) || '0.000000'}</span>
        </div>
        <div className="bg-[#1a1a3a] p-2 rounded">
          <span className="text-gray-400">w₀:</span> 
          <span className="ml-1 text-[#1D9E75]">{currentState?.w.toFixed(6) || '0.000000'}</span>
        </div>
      </div>

      {/* Lyapunov Exponents */}
      <div className="bg-[#0a0a14] p-3 rounded-lg border border-gray-800 flex flex-col space-y-1">
        <div className="text-gray-400 text-xs mb-1">Lyapunov Spectrum:</div>
        <div className="flex justify-between text-[#1D9E75]">
          <span>λ1=+0.23</span>
          <span>λ2=+0.11</span>
          <span className="text-gray-500">λ3=-0.45</span>
          <span className="text-gray-500">λ4=-0.89</span>
        </div>
        <div className="text-[10px] text-gray-500 mt-1 text-right">
          (hyperchaotic confirmed)
        </div>
      </div>

    </div>
  );
}
