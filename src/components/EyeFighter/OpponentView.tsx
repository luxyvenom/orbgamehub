'use client';

interface AiOpponentViewProps {
  type: 'ai';
  aiEyeOpen: boolean;
}

interface PvpOpponentViewProps {
  type: 'pvp';
  opponentName: string;
  opponentReady: boolean;
  opponentBlinked: boolean;
}

type OpponentViewProps = AiOpponentViewProps | PvpOpponentViewProps;

export function OpponentView(props: OpponentViewProps) {
  if (props.type === 'ai') {
    return (
      <div className="relative flex-1 min-h-0 overflow-hidden">
        <img
          src="/image%20copy.png"
          alt="Opponent"
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute top-2 left-2 bg-black/60 px-3 py-1 rounded-lg text-xs font-bold text-red-400">
          OPPONENT
        </div>
        {!props.aiEyeOpen && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
            <span className="text-6xl">😵</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative flex-1 min-h-0 overflow-hidden bg-gray-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <div className="text-5xl">👤</div>
        <span className="text-white font-bold text-lg">{props.opponentName}</span>
        <span className={`text-xs font-bold px-3 py-1 rounded-full ${
          props.opponentBlinked
            ? 'bg-red-500/20 text-red-400'
            : props.opponentReady
            ? 'bg-green-500/20 text-green-400'
            : 'bg-yellow-500/20 text-yellow-400'
        }`}>
          {props.opponentBlinked ? 'BLINKED!' : props.opponentReady ? 'READY' : 'WAITING...'}
        </span>
      </div>
      <div className="absolute top-2 left-2 bg-black/60 px-3 py-1 rounded-lg text-xs font-bold text-red-400">
        OPPONENT
      </div>
      {props.opponentBlinked && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
          <span className="text-6xl">😵</span>
        </div>
      )}
    </div>
  );
}
