export interface PvpRoom {
  roomId: string;
  status: 'waiting' | 'ready_check' | 'countdown' | 'playing' | 'finished';
  p1_wallet: string;
  p1_username: string;
  p1_ready: boolean;
  p1_blinked: boolean;
  p1_blinkTime: number | null;
  p1_lastPing: number;
  p2_wallet: string | null;
  p2_username: string | null;
  p2_ready: boolean;
  p2_blinked: boolean;
  p2_blinkTime: number | null;
  p2_lastPing: number;
  gameStartTime: number | null;
  countdownStartTime: number | null;
  winner: 'p1' | 'p2' | 'draw' | null;
  winnerClaimed: boolean;
  p1_drawRefunded: boolean;
  p2_drawRefunded: boolean;
  createdAt: number;
}

export type PlayerRole = 'p1' | 'p2';

export interface RoomStatusResponse {
  room: PvpRoom;
  myRole: PlayerRole;
}
