'use client';

import React, { useEffect, useRef, useState } from 'react';
import { NJCSParams, NJCSState, njcsStep, computeLyapunovExponents } from '@/lib/encryption/njcs';

interface ChaosVisualizerProps {
  params: NJCSParams | null
  isActive: boolean
  onComplete?: () => void
}

export default function ChaosVisualizer({ params, isActive, onComplete }: ChaosVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const [currentState, setCurrentState] = useState<NJCSState | null>(null);
  const stateRef = useRef<NJCSState | null>(null);
  const trajectoryRef = useRef<{ x: number, z: number }[]>([]);
  const iterationsRef = useRef<number>(0);
  const [lyapunov, setLyapunov] = useState<number[]>([]);

  useEffect(() => {
    if (params && isActive) {
      const initialState = { x: params.x0, y: params.y0, z: params.z0, w: params.w0 };
      setCurrentState(initialState);
      stateRef.current = initialState;
      trajectoryRef.current = [];
      iterationsRef.current = 0;
      const lexp = computeLyapunovExponents(params);
      setLyapunov(lexp);
    }
  }, [params, isActive]);

  useEffect(() => {
    if (!isActive || !params || !canvasRef.current) {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      return;
    }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;

    const render = () => {
      let s = stateRef.current;
      if (s && params) {
        for (let i = 0; i < 5; i++) {
          s = njcsStep(s, params);
          trajectoryRef.current.push({ x: s.x, z: s.z });
          iterationsRef.current++;
        }
        stateRef.current = s;
        setCurrentState(s);
        if (trajectoryRef.current.length > 2000) trajectoryRef.current.splice(0, 5);
      }
      ctx.fillStyle = '#0d0d1a';
      ctx.fillRect(0, 0, width, height);
      if (trajectoryRef.current.length > 1) {
        ctx.beginPath();
        const mapX = (v: number) => (v + 5) * (width / 10);
        const mapY = (v: number) => height - (v + 5) * (height / 10);
        trajectoryRef.current.forEach((pt, i) => {
          i === 0 ? ctx.moveTo(mapX(pt.x), mapY(pt.z)) : ctx.lineTo(mapX(pt.x), mapY(pt.z));
        });
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#378ADD');
        gradient.addColorStop(0.5, '#534AB7');
        gradient.addColorStop(1, '#1D9E75');
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.5;
        ctx.lineJoin = 'round';
        ctx.stroke();
      }
      if (iterationsRef.current > 5000 && onComplete) { onComplete(); return; }
      requestRef.current = requestAnimationFrame(render);
    };
    requestRef.current = requestAnimationFrame(render);
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [isActive, params, onComplete]);

  if (!isActive) return null;

  return (
    <div className="flex flex-col space-y-4 w-full bg-[#0d0d1a] p-4 rounded-xl border border-gray-800 text-white font-mono text-sm
$chaosViz2 = @'
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { NJCSParams, NJCSState, njcsStep, computeLyapunovExponents } from '@/lib/encryption/njcs';

interface ChaosVisualizerProps {
  params: NJCSParams | null
  isActive: boolean
  onComplete?: () => void
}

export default function ChaosVisualizer({ params, isActive, onComplete }: ChaosVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const [currentState, setCurrentState] = useState<NJCSState | null>(null);
  const stateRef = useRef<NJCSState | null>(null);
  const trajectoryRef = useRef<{ x: number, z: number }[]>([]);
  const iterationsRef = useRef<number>(0);
  const [lyapunov, setLyapunov] = useState<number[]>([]);

  useEffect(() => {
    if (params && isActive) {
      const initialState = { x: params.x0, y: params.y0, z: params.z0, w: params.w0 };
      setCurrentState(initialState);
      stateRef.current = initialState;
      trajectoryRef.current = [];
      iterationsRef.current = 0;
      const lexp = computeLyapunovExponents(params);
      setLyapunov(lexp);
    }
  }, [params, isActive]);

  useEffect(() => {
    if (!isActive || !params || !canvasRef.current) {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      return;
    }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;

    const render = () => {
      let s = stateRef.current;
      if (s && params) {
        for (let i = 0; i < 5; i++) {
          s = njcsStep(s, params);
          trajectoryRef.current.push({ x: s.x, z: s.z });
          iterationsRef.current++;
        }
        stateRef.current = s;
        setCurrentState(s);
        if (trajectoryRef.current.length > 2000) trajectoryRef.current.splice(0, 5);
      }
      ctx.fillStyle = '#0d0d1a';
      ctx.fillRect(0, 0, width, height);
      if (trajectoryRef.current.length > 1) {
        ctx.beginPath();
        const mapX = (v: number) => (v + 5) * (width / 10);
        const mapY = (v: number) => height - (v + 5) * (height / 10);
        trajectoryRef.current.forEach((pt, i) => {
          i === 0 ? ctx.moveTo(mapX(pt.x), mapY(pt.z)) : ctx.lineTo(mapX(pt.x), mapY(pt.z));
        });
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#378ADD');
        gradient.addColorStop(0.5, '#534AB7');
        gradient.addColorStop(1, '#1D9E75');
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.5;
        ctx.lineJoin = 'round';
        ctx.stroke();
      }
      if (iterationsRef.current > 5000 && onComplete) { onComplete(); return; }
      requestRef.current = requestAnimationFrame(render);
    };
    requestRef.current = requestAnimationFrame(render);
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [isActive, params, onComplete]);

  if (!isActive) return null;

  return (
    <div className="flex flex-col space-y-4 w-full bg-[#0d0d1a] p-4 rounded-xl border border-gray-800 text-white font-mono text-sm overflow-hidden">
      <div className="flex items-center space-x-2 text-[#378ADD]">
        <div className="w-2 h-2 rounded-full bg-[#378ADD] animate-pulse"></div>
        <span>Generating hyperchaotic keystream...</span>
      </div>
      <div className="relative w-full h-[200px] border border-[#1a1a3a] rounded-lg overflow-hidden bg-black/20">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ minHeight: '200px' }} />
        <div className="absolute bottom-2 left-2 text-xs text-gray-500">x-z phase portrait (4D projection)</div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
        {(['x','y','z','w'] as const).map((k, i) => (
          <div key={k} className="bg-[#1a1a3a] p-2 rounded">
            <span className="text-gray-400">{k}\u2080:</span>
            <span className={`ml-1 ${i === 3 ? 'text-[#1D9E75]' : 'text-white'}`}>
              {currentState ? (currentState as any)[k].toFixed(6) : '0.000000'}
            </span>
          </div>
        ))}
      </div>
      {lyapunov.length === 4 && (
        <div className="bg-[#0a0a14] p-3 rounded-lg border border-gray-800 flex flex-col space-y-1">
          <div className="text-gray-400 text-xs mb-1">Lyapunov Spectrum (computed):</div>
          <div className="flex justify-between text-xs">
            {lyapunov.map((l, i) => (
              <span key={i} className={l > 0 ? 'text-[#1D9E75]' : 'text-gray-500'}>
                {'\u03bb'}{i+1}={l > 0 ? '+' : ''}{l}
              </span>
            ))}
          </div>
          <div className="text-[10px] text-gray-500 mt-1 text-right">
            {lyapunov.filter(l => l > 0).length >= 2 ? '(hyperchaotic confirmed)' : '(chaotic)'}
          </div>
        </div>
      )}
    </div>
  );
}
