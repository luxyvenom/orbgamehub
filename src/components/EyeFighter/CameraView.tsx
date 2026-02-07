'use client';

import { RefObject } from 'react';

interface CameraViewProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  isBlinking: boolean;
  ear: number;
  label: string;
  showEarBar?: boolean;
}

export function CameraView({ videoRef, canvasRef, isBlinking, ear, label, showEarBar }: CameraViewProps) {
  return (
    <div className="relative flex-1 min-h-0 overflow-hidden">
      <video
        ref={videoRef}
        playsInline
        muted
        className="w-full h-full object-cover"
        style={{ transform: 'scaleX(-1)' }}
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ transform: 'scaleX(-1)' }}
      />
      <div
        className={`absolute top-2 left-2 bg-black/60 px-3 py-1 rounded-lg text-xs font-bold ${
          isBlinking ? 'text-red-400' : 'text-green-400'
        }`}
      >
        {label}
      </div>
      {showEarBar && (() => {
        const pct = Math.min((ear / 0.4) * 100, 100);
        const thresholdPct = (0.25 / 0.4) * 100; // 62.5%
        const inDanger = pct <= thresholdPct;
        return (
          <div className="absolute bottom-2 left-2 right-2">
            <div className="relative h-2 bg-gray-800/60 rounded-full overflow-hidden">
              {/* Danger zone background */}
              <div
                className="absolute inset-y-0 left-0 bg-red-900/40"
                style={{ width: `${thresholdPct}%` }}
              />
              {/* Threshold line */}
              <div
                className="absolute inset-y-0 w-0.5 bg-red-500/80"
                style={{ left: `${thresholdPct}%` }}
              />
              {/* EAR value bar */}
              <div
                className={`h-full transition-all duration-75 ${inDanger ? 'bg-red-500' : 'bg-green-500'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            {inDanger && (
              <div className="text-red-400 text-[10px] font-bold text-center mt-0.5 animate-pulse">
                EYES CLOSING!
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
