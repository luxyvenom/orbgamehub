import { auth } from '@/auth';

interface PvpUser {
  wallet: string;
  username: string;
}

/**
 * Get authenticated user for PvP API routes.
 * Returns null if not authenticated.
 */
export async function getPvpUser(
  req: Request,
): Promise<PvpUser | null> {
  // Suppress unused parameter warning
  void req;

  const session = await auth();

  if (session?.user) {
    return {
      wallet: session.user.walletAddress || session.user.id || 'unknown',
      username: session.user.username || 'Player',
    };
  }

  return null;
}
