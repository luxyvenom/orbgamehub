export const APP_ID = process.env.NEXT_PUBLIC_APP_ID as `app_${string}`;
export const VERIFY_ACTION = 'verifyplayer';

export const GAME_WALLET = process.env.NEXT_PUBLIC_GAME_WALLET ?? '0x0000000000000000000000000000000000000000';

// --- AI Mode ---
export const AI_BET_AMOUNT = 0.01;
export const AI_BLINK_RANGE = { min: 70, max: 70 };
export const GAME_MAX_DURATION = 80;
export const COUNTDOWN_SECONDS = 5;
export const GRACE_PERIOD = 0.5;
export const WIN_MULTIPLIER = 1.8;

// --- PvP Mode ---
export const PVP_BET_AMOUNT = 0.01;
export const PVP_WIN_AMOUNT = 0.018;
export const GAME_CONTRACT = process.env.NEXT_PUBLIC_GAME_CONTRACT as `0x${string}` | undefined;
export const PVP_MAX_DURATION = 120;
export const PVP_POLL_INTERVAL = 300;
export const PVP_DISCONNECT_TIMEOUT = 15000;
export const PVP_ROOM_TTL = 600;
export const PVP_COUNTDOWN_SECONDS = 5;
export const PVP_DRAW_THRESHOLD = 0.3;
