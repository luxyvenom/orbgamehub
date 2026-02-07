'use client';

interface ReadyOverlayProps {
  isReady: boolean;
  faceDetected: boolean;
}

export function ReadyOverlay({ isReady, faceDetected }: ReadyOverlayProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-10">
      <div className="text-5xl mb-4">
        {isReady && faceDetected ? '✅' : isReady ? '👀' : '⏳'}
      </div>
      <h2 className="text-xl font-bold">
        {!isReady ? 'Loading camera...' : !faceDetected ? 'Position your face' : 'Face detected!'}
      </h2>
      <p className="text-gray-300 text-sm mt-2">
        {!isReady
          ? 'Initializing eye detection...'
          : !faceDetected
          ? 'Look at the camera so we can detect your eyes'
          : 'Starting automatically...'}
      </p>
    </div>
  );
}
