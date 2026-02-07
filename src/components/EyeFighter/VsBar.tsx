'use client';

interface VsBarProps {
  gameTime?: number;
  isPlaying: boolean;
  inGracePeriod: boolean;
}

export function VsBar({ gameTime, isPlaying, inGracePeriod }: VsBarProps) {
  return (
    <div className="flex items-center justify-center gap-4 py-1.5 bg-gray-900 shrink-0">
      <span className="text-yellow-400 font-black text-base">VS</span>
      {isPlaying && gameTime !== undefined && (
        <span className="text-white font-mono text-base font-bold tabular-nums">
          {gameTime.toFixed(1)}s
        </span>
      )}
      {isPlaying && !inGracePeriod && (
        <span className="text-red-400 text-xs font-bold animate-pulse">DON&apos;T BLINK!</span>
      )}
    </div>
  );
}
