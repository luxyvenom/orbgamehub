'use client';

interface CountdownOverlayProps {
  countdown: number;
}

export function CountdownOverlay({ countdown }: CountdownOverlayProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 z-10">
      <p className="text-3xl font-extrabold text-white tracking-wider mb-2">GAME STARTS IN</p>
      <div className="text-[10rem] leading-none font-black text-white drop-shadow-lg animate-pulse">
        {countdown}
      </div>
      <p className="text-gray-300 text-base mt-6">Keep your eyes open!</p>
    </div>
  );
}
