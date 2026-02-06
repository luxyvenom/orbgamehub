'use client';
import { VERIFY_ACTION } from '@/lib/constants';
import { Button, LiveFeedback } from '@worldcoin/mini-apps-ui-kit-react';
import { MiniKit, VerificationLevel } from '@worldcoin/minikit-js';
import { useState } from 'react';

export const Verify = () => {
  const [buttonState, setButtonState] = useState<
    'pending' | 'success' | 'failed' | undefined
  >(undefined);

  const onClickVerify = async (verificationLevel: VerificationLevel) => {
    setButtonState('pending');
    try {
      const result = await MiniKit.commandsAsync.verify({
        action: VERIFY_ACTION,
        verification_level: verificationLevel,
      });

      const response = await fetch('/api/verify-proof', {
        method: 'POST',
        body: JSON.stringify({
          payload: result.finalPayload,
          action: VERIFY_ACTION,
        }),
      });

      const data = await response.json();
      if (data.verifyRes.success) {
        setButtonState('success');
      } else {
        setButtonState('failed');
        setTimeout(() => setButtonState(undefined), 2000);
      }
    } catch {
      setButtonState('failed');
      setTimeout(() => setButtonState(undefined), 2000);
    }
  };

  return (
    <div className="grid w-full gap-4">
      <p className="text-lg font-semibold">Verify Identity</p>
      <LiveFeedback
        label={{
          failed: 'Verification failed',
          pending: 'Verifying...',
          success: 'Verified!',
        }}
        state={buttonState}
        className="w-full"
      >
        <Button
          onClick={() => onClickVerify(VerificationLevel.Orb)}
          disabled={buttonState === 'pending'}
          size="lg"
          variant="primary"
          className="w-full"
        >
          Verify with World ID (Orb)
        </Button>
      </LiveFeedback>
    </div>
  );
};
