export const APP_ID = process.env.NEXT_PUBLIC_APP_ID as `app_${string}`;
export const VERIFY_ACTION = 'verifyplayer';

export const BET_OPTIONS = [
  { label: '0.1 WLD', value: 0.1 },
  { label: '0.5 WLD', value: 0.5 },
  { label: '1.0 WLD', value: 1.0 },
] as const;

export const GAME_WALLET = process.env.NEXT_PUBLIC_GAME_WALLET ?? '0x0000000000000000000000000000000000000000';

// AI difficulty: min/max seconds before AI "blinks"
export const AI_BLINK_RANGE = { min: 5, max: 15 };

// Game duration cap (seconds)
export const GAME_MAX_DURATION = 20;

// Countdown before game starts
export const COUNTDOWN_SECONDS = 3;
