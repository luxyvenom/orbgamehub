'use client';

import { Button, LiveFeedback } from '@worldcoin/mini-apps-ui-kit-react';

type GameResult = 'win' | 'lose' | 'draw' | null;

interface ResultScreenProps {
  result: GameResult;
  gameTime: number;
  winAmount: string;
  betAmount: number;
  maxDuration: number;
  txState: 'pending' | 'success' | 'failed' | undefined;
  refundTxState?: 'pending' | 'success' | 'failed' | undefined;
  onClaim: () => void;
  onRefund?: () => void;
  onPlayAgain: () => void;
  onGoHome: () => void;
}

export function ResultScreen({
  result,
  gameTime,
  winAmount,
  betAmount,
  maxDuration,
  txState,
  refundTxState,
  onClaim,
  onRefund,
  onPlayAgain,
  onGoHome,
}: ResultScreenProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
      <div className="text-6xl mb-2">
        {result === 'win' ? '🏆' : result === 'lose' ? '😵' : '🤝'}
      </div>
      <h2 className="text-2xl font-bold">
        {result === 'win' ? 'YOU WIN!' : result === 'lose' ? 'YOU BLINKED!' : 'DRAW!'}
      </h2>
      <p className="text-gray-400 text-center">
        {result === 'win'
          ? `Opponent blinked at ${gameTime.toFixed(1)}s! You win ${winAmount} WLD`
          : result === 'lose'
          ? `You blinked at ${gameTime.toFixed(1)}s. Better luck next time!`
          : `Both held for ${maxDuration}s. Bet returned.`}
      </p>
      {result === 'win' && (
        <LiveFeedback
          label={{ failed: 'Claim failed', pending: 'Claiming...', success: 'Claimed!' }}
          state={txState}
          className="w-full"
        >
          <Button onClick={onClaim} size="lg" variant="primary" className="w-full">
            Claim {winAmount} WLD
          </Button>
        </LiveFeedback>
      )}
      {result === 'draw' && onRefund && (
        <LiveFeedback
          label={{ failed: 'Refund failed', pending: 'Refunding...', success: 'Refunded!' }}
          state={refundTxState}
          className="w-full"
        >
          <Button onClick={onRefund} size="lg" variant="primary" className="w-full">
            Claim Refund {betAmount} WLD
          </Button>
        </LiveFeedback>
      )}
      <Button onClick={onPlayAgain} size="lg" variant="tertiary" className="w-full">
        Play Again
      </Button>
      <Button onClick={onGoHome} size="lg" variant="tertiary" className="w-full">
        Back to Home
      </Button>
    </div>
  );
}
